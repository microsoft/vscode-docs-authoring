import * as fs from 'fs';
import { homedir } from 'os';
import { basename, extname, join } from 'path';
import * as recursive from 'recursive-readdir';
import { Uri, window, workspace } from 'vscode';
import {
	ignoreFiles,
	naturalLanguageCompare,
	postError,
	showStatusMessage
} from '../../helper/common';
import { sendTelemetryData } from '../../helper/telemetry';
import * as yamlMetadata from '../../helper/yaml-metadata';
import { RedirectFileName, RedirectTelemetryCommand } from './constants';
import { RedirectionFile } from './redirection';
import { MasterRedirection } from './utilities';
import jsyaml = require('js-yaml');

export async function generateMasterRedirectionFile(rootPath?: string, done?: any) {
	const editor = window.activeTextEditor;
	let workspacePath: string;
	if (editor) {
		sendTelemetryData(RedirectTelemetryCommand, '');
		const resource = editor.document.uri;
		let folder = workspace.getWorkspaceFolder(resource);
		if (!folder && rootPath) {
			folder = workspace.getWorkspaceFolder(Uri.file(rootPath));
		}
		if (folder) {
			const repoName = folder.name.toLowerCase();
			workspacePath = folder.uri.fsPath;

			const date = new Date(Date.now());

			if (workspacePath == null) {
				postError('No workspace is opened.');
				return;
			}

			// Check if the current workspace is the root folder of a repo by checking if the .git folder is present
			const gitDir = join(workspacePath, '.git');
			if (!fs.existsSync(gitDir)) {
				postError('Current workspace is not root folder of a repo.');
				return;
			}

			const files = await recursive(workspacePath, ignoreFiles);

			const redirectionFiles: RedirectionFile[] = [];
			const errorFiles: any[] = [];

			showStatusMessage('Generating Master Redirection file.');

			files
				.filter((file: any) => extname(file.toLowerCase()) === '.md')
				.forEach((file: any) => {
					const content = fs.readFileSync(file, 'utf8');
					const mdContent = new yamlMetadata.MarkdownFileMetadataContent(content, file);

					try {
						const metadataContent = mdContent.getYamlMetadataContent();

						if (metadataContent !== '') {
							const yamlHeader = jsyaml.load(metadataContent.toLowerCase());

							if (yamlHeader != null && yamlHeader.redirect_url != null) {
								if (yamlHeader.redirect_document_id !== true) {
									yamlHeader.redirect_document_id = false;
								}
								redirectionFiles.push(
									new RedirectionFile(
										file,
										yamlHeader.redirect_url,
										yamlHeader.redirect_document_id,
										folder
									)
								);
							}
						}
					} catch (error) {
						errorFiles.push({
							errorMessage: error,
							fileName: file
						});
					}
				});

			if (redirectionFiles.length === 0) {
				showStatusMessage('No redirection files found.');
				if (done) {
					done();
				}
			}

			if (redirectionFiles.length > 0) {
				let masterRedirection: MasterRedirection | null;
				const masterRedirectionFilePath: string = join(workspacePath, RedirectFileName);
				// If there is already a master redirection file, read its content to load into masterRedirection variable
				if (fs.existsSync(masterRedirectionFilePath)) {
					// test for valid json
					try {
						masterRedirection = JSON.parse(fs.readFileSync(masterRedirectionFilePath, 'utf8'));
					} catch (error) {
						showStatusMessage('Invalid JSON: ' + error);
						return;
					}
				} else {
					masterRedirection = null;
					showStatusMessage('Created new redirection file.');
				}

				if (masterRedirection == null) {
					// This means there is no existing master redirection file, we will create master redirection file and write all scanned result into it
					masterRedirection = new MasterRedirection(redirectionFiles);
				} else {
					const existingSourcePath: string[] = [];

					masterRedirection.redirections.forEach(item => {
						if (!item.source_path) {
							showStatusMessage(
								'An array is missing the sourcePath value. Please check .openpublishing.redirection.json.'
							);
							return;
						}
						existingSourcePath.push(item.source_path.toLowerCase());
					});

					redirectionFiles.forEach(item => {
						if (existingSourcePath.indexOf(item.source_path.toLowerCase()) >= 0) {
							item.isAlreadyInMasterRedirectionFile = true;
						} else {
							if (masterRedirection != null) {
								masterRedirection.redirections.push(item);
							} else {
								showStatusMessage('No redirection files found to add.');
								if (done) {
									done();
								}
							}
						}
					});
				}
				if (masterRedirection.redirections.length > 0) {
					masterRedirection.redirections.sort((a, b) => {
						return naturalLanguageCompare(a.source_path, b.source_path);
					});

					fs.writeFileSync(
						masterRedirectionFilePath,
						JSON.stringify(
							masterRedirection,
							['redirections', 'source_path', 'redirect_url', 'redirect_document_id'],
							4
						)
					);

					const currentYear = date.getFullYear();
					const currentMonth = date.getMonth() + 1;
					const currentDay = date.getDate();
					const currentHour = date.getHours();
					const currentMinute = date.getMinutes();
					const currentMilliSeconds = date.getMilliseconds();
					const timeStamp =
						currentYear +
						`-` +
						currentMonth +
						`-` +
						currentDay +
						`_` +
						currentHour +
						`-` +
						currentMinute +
						`-` +
						currentMilliSeconds;
					const deletedRedirectsFolderName = repoName + '_deleted_redirects_' + timeStamp;
					const docsAuthoringHomeDirectory = join(homedir(), 'Docs Authoring');
					const docsRedirectDirectory = join(docsAuthoringHomeDirectory, 'redirects');
					const deletedRedirectsPath = join(docsRedirectDirectory, deletedRedirectsFolderName);
					if (fs.existsSync(docsRedirectDirectory)) {
						fs.mkdirSync(deletedRedirectsPath);
					} else {
						if (!fs.existsSync(docsAuthoringHomeDirectory)) {
							fs.mkdirSync(docsAuthoringHomeDirectory);
						}
						if (!fs.existsSync(docsRedirectDirectory)) {
							fs.mkdirSync(docsRedirectDirectory);
						}
						if (!fs.existsSync(deletedRedirectsPath)) {
							fs.mkdirSync(deletedRedirectsPath);
						}
					}

					redirectionFiles.forEach(item => {
						const source = fs.createReadStream(item.fileFullPath);
						const dest = fs.createWriteStream(
							join(deletedRedirectsPath, basename(item.source_path))
						);

						source.pipe(dest);
						source.on('close', () => {
							fs.unlink(item.fileFullPath, error => {
								if (error) {
									postError(`Error: ${error}`);
								}
							});
						});
					});

					redirectionFiles.forEach(item => {
						if (item.isAlreadyInMasterRedirectionFile) {
							showStatusMessage('Already in master redirection file: ' + item.fileFullPath);
						} else {
							showStatusMessage('Added to master redirection file. ' + item.fileFullPath);
						}
					});

					showStatusMessage('Redirected files copied to ' + deletedRedirectsPath);
					showStatusMessage('Done');
					if (done) {
						done();
					}
				}
			}
		}
	}
}
