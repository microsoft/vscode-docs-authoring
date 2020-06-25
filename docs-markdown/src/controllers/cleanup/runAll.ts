import { readFile, writeFile } from 'graceful-fs';
import { ignoreFiles, postError, showStatusMessage } from '../../helper/common';
import { generateMasterRedirectionFile } from '../redirects/generateRedirectionFile';
import { lowerCaseData } from './capitalizationOfMetadata';
import { handleMarkdownMetadata } from './handleMarkdownMetadata';
import { handleYamlMetadata } from './handleYamlMetadata';
import { handleLinksWithRegex } from './microsoftLinks';
import { removeUnusedImagesAndIncludes } from './remove-unused-assets-controller';
import { readWriteFileWithProgress, showProgress } from './utilities';
import jsdiff = require('diff');
import recursive = require('recursive-readdir');

/**
 * Run all Cleanup... scripts.
 * handleSingValuedMetadata() => cleans up Yaml Metadata values that have single array item;
 * microsoftLinks() => converts http:// to https:// for all microsoft links.
 * capitalizationOfMetadata() => lower cases all metadata found in .md files
 * generateMasterRedirectionFile() => creates master redirection file for root.
 */
export function runAll(progress: any, file: string, files: string[] | null, index: number | null) {
	const message = 'Everything';
	if (file.endsWith('.yml') || file.endsWith('.md')) {
		return readWriteFileWithProgress(progress, file, message, files, index, (data: string) => {
			if (file.endsWith('.yml')) {
				data = handleYamlMetadata(data);
			} else if (file.endsWith('.md')) {
				data = handleLinksWithRegex(data);
				if (data.startsWith('---')) {
					let frontMatter = '';
					const regex = new RegExp(`^(---)([^>]+?)(---)$`, 'm');
					const metadataMatch = data.match(regex);
					if (metadataMatch) {
						frontMatter = lowerCaseData(metadataMatch[2], 'ms.author');
						frontMatter = lowerCaseData(metadataMatch[2], 'author');
						frontMatter = lowerCaseData(metadataMatch[2], 'ms.prod');
						frontMatter = lowerCaseData(metadataMatch[2], 'ms.service');
						frontMatter = lowerCaseData(metadataMatch[2], 'ms.subservice');
						frontMatter = lowerCaseData(metadataMatch[2], 'ms.technology');
						frontMatter = lowerCaseData(metadataMatch[2], 'ms.topic');
						frontMatter = handleMarkdownMetadata(metadataMatch[2]);
						data = data.replace(regex, `---${frontMatter}---`);
					}
				}
			}
			return data;
		});
	} else {
		return Promise.resolve();
	}
}
export async function runAllWorkspace(workspacePath: string, progress: any, resolve: any) {
	showStatusMessage('Cleanup: Everything started.');
	const message = 'Everything';
	progress.report({ increment: 0, message });
	return new Promise((chainResolve, chainReject) =>
		recursive(workspacePath, ignoreFiles, (err: any, files: string[]) => {
			if (err) {
				postError(err);
				chainReject();
			}
			const promises: Promise<any>[] = [];
			files.map(async (file, index) => {
				if (file.endsWith('.yml') || file.endsWith('docfx.json')) {
					promises.push(
						new Promise((readResolve, readReject) => {
							readFile(file, 'utf8', (error, data) => {
								if (error) {
									postError(`Error: ${error}`);
									readReject();
								}
								const origin = data;
								data = handleYamlMetadata(data);
								const diff = jsdiff
									.diffChars(origin, data)
									.some((part: { added: any; removed: any }) => {
										return part.added || part.removed;
									});
								if (diff) {
									promises.push(
										new Promise((res, rej) => {
											writeFile(file, data, e => {
												if (e) {
													postError(`Error: ${e}`);
													rej();
												}
												showProgress(index, files, progress, message);
												res();
											});
										}).catch(e => {
											postError(e);
										})
									);
								}
								readResolve();
							});
						}).catch(error => {
							postError(error);
						})
					);
				} else if (file.endsWith('.md')) {
					promises.push(
						new Promise((readResolve, reject) => {
							readFile(file, 'utf8', (error, data) => {
								if (error) {
									postError(`Error: ${error}`);
									reject();
								}
								const origin = data;
								data = handleLinksWithRegex(data);
								if (data.startsWith('---')) {
									let frontMatter = '';
									const regex = new RegExp(`^(---)([^>]+?)(---)$`, 'm');
									const metadataMatch = data.match(regex);
									if (metadataMatch) {
										frontMatter = lowerCaseData(metadataMatch[2], 'ms.author');
										frontMatter = lowerCaseData(metadataMatch[2], 'author');
										frontMatter = lowerCaseData(metadataMatch[2], 'ms.prod');
										frontMatter = lowerCaseData(metadataMatch[2], 'ms.service');
										frontMatter = lowerCaseData(metadataMatch[2], 'ms.subservice');
										frontMatter = lowerCaseData(metadataMatch[2], 'ms.technology');
										frontMatter = lowerCaseData(metadataMatch[2], 'ms.topic');
										frontMatter = handleMarkdownMetadata(metadataMatch[2]);
										data = data.replace(regex, `---${frontMatter}---`);
									}
								}
								const diff = jsdiff
									.diffChars(origin, data)
									.some((part: { added: any; removed: any }) => {
										return part.added || part.removed;
									});
								if (diff) {
									promises.push(
										new Promise((res, rej) => {
											writeFile(file, data, e => {
												if (e) {
													postError(`Error: ${e}`);
													rej();
												}
												showProgress(index, files, progress, message);
												res();
											});
										}).catch(e => {
											postError(e);
										})
									);
								}
								readResolve();
							});
						}).catch(error => {
							postError(error);
						})
					);
				}
			});
			promises.push(
				new Promise(res => {
					generateMasterRedirectionFile(workspacePath, res);
				})
			);
			promises.push(
				new Promise(async res => {
					removeUnusedImagesAndIncludes(progress, workspacePath, res);
				})
			);
			Promise.all(promises)
				.then(() => {
					progress.report({ increment: 100, message: 'Everything completed.' });
					showStatusMessage(`Cleanup: Everything completed.`);
					setTimeout(() => {
						chainResolve();
						resolve();
					}, 2000);
				})
				.catch(error => {
					postError(error);
				});
		})
	);
}
