'use strict';

import { existsSync } from 'graceful-fs';
import { basename, extname, join } from 'path';
import { ProgressLocation, QuickPickItem, QuickPickOptions, Uri, window, workspace } from 'vscode';
import {
	ignoreFiles,
	noActiveEditorMessage,
	postError,
	showStatusMessage,
	showWarningMessage
} from '../../helper/common';
import { sendTelemetryData } from '../../helper/telemetry';
import { generateMasterRedirectionFile } from '../redirects/generateRedirectionFile';
import { capitalizationOfMetadata } from './capitalizationOfMetadata';
import { handleSingleValuedMetadata } from './handleSingleValuedMetadata';
import { microsoftLinks } from './microsoftLinks';
import { removeUnusedImagesAndIncludes } from './remove-unused-assets-controller';
import { removeEmptyMetadata } from './removeEmptyMetadata';
import { runAll, runAllWorkspace } from './runAll';
import { getCleanUpQuickPick, recurseCallback } from './utilities';
import { cleanUpDevLangInCodeBlocks } from './devlangsInCodeBlocks';
import recursive = require('recursive-readdir');

const telemetryCommand: string = 'applyCleanup';
let commandOption: string;

export function applyCleanupCommand() {
	const commands = [{ command: applyCleanup.name, callback: applyCleanup }];
	return commands;
}

export async function applyCleanupFile(uri: Uri) {
	const { items, opts } = getCleanUpQuickPick();
	const file = uri.fsPath;
	items.push({
		description: '',
		label: 'Everything'
	});
	const selection = await window.showQuickPick(items, opts);
	if (!selection) {
		return;
	}
	// check for dirty file
	workspace.openTextDocument(Uri.parse(uri.path)).then(doc => {
		if (doc.isDirty) {
			showWarningMessage(
				`Selected file ${file} is not saved and cannot be modified. Save file then run the command again.`
			);
			showStatusMessage(
				`Selected file ${file} is not saved and cannot be modified. Save file then run the command again.`
			);
		}
	});
	window.withProgress(
		{
			cancellable: true,
			location: ProgressLocation.Notification,
			title: 'Cleanup'
		},
		(progress, token) => {
			token.onCancellationRequested(() => {
				postError('User canceled the long running operation');
			});
			let message = 'Cleanup';
			let statusMessage = '';
			const promises: Promise<any>[] = [];
			progress.report({ increment: 1, message });
			return new Promise(async (resolve, reject) => {
				switch (selection.label.toLowerCase()) {
					case 'single-valued metadata':
						showStatusMessage('Cleanup: Single-Valued metadata started.');
						message = 'Single-Valued metadata started.';
						progress.report({ increment: 1, message });
						statusMessage = 'Cleanup: Single-Valued metadata completed.';
						promises.push(handleSingleValuedMetadata(progress, file, null, null));
						message = 'Single-Valued metadata completed.';
						commandOption = 'single-value';
						break;
					case 'microsoft links':
						showStatusMessage('Cleanup: Microsoft Links started.');
						message = 'Microsoft Links started.';
						progress.report({ increment: 1, message });
						statusMessage = 'Cleanup: Microsoft Links completed.';
						promises.push(microsoftLinks(progress, file, null, null));
						message = 'Microsoft Links completed.';
						commandOption = 'links';
						break;
					case 'capitalization of metadata values':
						showStatusMessage('Cleanup: Capitalization of metadata values started.');
						message = 'Capitalization of metadata values started.';
						progress.report({ increment: 1, message });
						statusMessage = 'Cleanup: Capitalization of metadata values completed.';
						promises.push(capitalizationOfMetadata(progress, file, null, null));
						message = 'Capitalization of metadata values completed.';
						commandOption = 'capitalization';
						break;
					case 'clean up devlang for code blocks':
						showStatusMessage('Cleanup: Devlang for code blocks started.');
						message = 'Devlang for code blocks started.';
						progress.report({ increment: 1, message });
						statusMessage = 'Cleanup: Devlang for code blocks completed.';
						promises.push(cleanUpDevLangInCodeBlocks(progress, file, null, null));
						message = 'Devlang for code blocks completed.';
						commandOption = 'devlang';
						break;
					case 'everything':
						showStatusMessage('Cleanup: Everything started.');
						message = 'Everything started.';
						progress.report({ increment: 1, message });
						statusMessage = 'Cleanup: Everything completed.';
						promises.push(runAll(progress, file, null, null));
						message = 'Everything complete.';
						commandOption = 'everything';
						break;
					case 'empty metadata':
						const options: QuickPickOptions = { placeHolder: 'Cleanup...' };
						const qpItems: QuickPickItem[] = [];
						qpItems.push({
							description: '',
							label: 'Remove metadata attributes with empty values'
						});
						qpItems.push({
							description: '',
							label: `Remove metadata attributes with "na" or "n/a"`
						});
						qpItems.push({
							description: '',
							label: 'Remove commented out metadata attributes'
						});
						qpItems.push({
							description: '',
							label: 'Remove all'
						});
						showStatusMessage('Cleanup: Metadata attribute cleanup started.');
						message = 'Empty metadata attribute cleanup started.';
						window.showQuickPick(qpItems, options).then(selected => {
							if (!selected) {
								reject();
								return;
							}
							switch (selected.label.toLowerCase()) {
								case 'remove metadata attributes with empty values':
									promises.push(removeEmptyMetadata(progress, file, null, null, 'empty'));
									commandOption = 'remove-empty';
									break;
								case `remove metadata attributes with "na" or "n/a"`:
									promises.push(removeEmptyMetadata(progress, file, null, null, 'na'));
									commandOption = 'remove-na';
									break;
								case 'remove commented out metadata attributes':
									promises.push(removeEmptyMetadata(progress, file, null, null, 'commented'));
									commandOption = 'remove-commented';
									break;
								case 'remove all':
									promises.push(removeEmptyMetadata(progress, file, null, null, 'all'));
									commandOption = 'remove-all-empty';
									break;
							}
						});
						statusMessage = 'Cleanup: Metadata attribute cleanup completed.';
						message = 'Empty metadata attribute cleanup completed.';
				}
				Promise.all(promises)
					.then(() => {
						progress.report({ increment: 100, message: `${message} 100%` });
						showStatusMessage(statusMessage);
						setTimeout(() => {
							resolve();
						}, 2000);
					})
					.catch(err => {
						postError(err);
					});
				sendTelemetryData(telemetryCommand, commandOption);
			});
		}
	);
}

export async function applyCleanupFolder(uri: Uri) {
	const { items, opts } = getCleanUpQuickPick();
	items.push({
		description: '',
		label: 'Everything'
	});
	const selection = await window.showQuickPick(items, opts);
	if (!selection) {
		return;
	}
	window.withProgress(
		{
			cancellable: true,
			location: ProgressLocation.Notification,
			title: 'Cleanup'
		},
		(progress, token) => {
			token.onCancellationRequested(() => {
				postError('User canceled the long running operation');
			});
			return new Promise(async (resolve, reject) => {
				let message = '';
				let statusMessage = '';
				const files = await recursive(uri.fsPath, ignoreFiles);
				const promises: Promise<any>[] = [];
				// check for dirty files
				files.map(file => {
					file = file.replace(/\\/g, '/');
					if (extname(file) === '.md') {
						workspace.openTextDocument(Uri.parse(file)).then(doc => {
							if (doc.isDirty) {
								showWarningMessage(
									`Selected file ${file} is not saved and cannot be modified. Save file then run the command again.`
								);
								showStatusMessage(
									`Selected file ${file} is not saved and cannot be modified. Save file then run the command again.`
								);
							}
						});
					}
				});
				switch (selection.label.toLowerCase()) {
					case 'single-valued metadata':
						showStatusMessage('Cleanup: Single-Valued metadata started.');
						message = 'Single-Valued metadata started.';
						progress.report({ increment: 1, message });
						statusMessage = 'Cleanup: Single-Valued metadata completed.';
						files.map((file, index) => {
							promises.push(handleSingleValuedMetadata(progress, file, files, index));
						});
						message = 'Single-Valued metadata completed.';
						commandOption = 'single-value';
						break;
					case 'microsoft links':
						showStatusMessage('Cleanup: Microsoft Links started.');
						message = 'Microsoft Links started.';
						progress.report({ increment: 1, message });
						statusMessage = 'Cleanup: Microsoft Links completed.';
						files.map((file, index) => {
							promises.push(microsoftLinks(progress, file, files, index));
						});
						message = 'Microsoft Links completed.';
						commandOption = 'links';
						break;
					case 'capitalization of metadata values':
						showStatusMessage('Cleanup: Capitalization of metadata values started.');
						message = 'Capitalization of metadata values started.';
						progress.report({ increment: 1, message });
						statusMessage = 'Cleanup: Capitalization of metadata values completed.';
						files.map((file, index) => {
							promises.push(capitalizationOfMetadata(progress, file, files, index));
						});
						message = 'Capitalization of metadata values completed.';
						commandOption = 'capitalization';
						break;
					case 'clean up devlang for code blocks':
						showStatusMessage('Cleanup: Clean up devlang for code blocks started.');
						message = 'Clean up devlang for code blocks.';
						progress.report({ increment: 1, message });
						statusMessage = 'Devlang for code blocks completed.';
						files.map((file, index) => {
							promises.push(cleanUpDevLangInCodeBlocks(progress, file, files, index));
						});
						message = 'Clean up devlang for code blocks completed.';
						commandOption = 'devlang';
						break;
					case 'everything':
						showStatusMessage('Cleanup: Everything started.');
						message = 'Everything started.';
						progress.report({ increment: 1, message });
						statusMessage = 'Cleanup: Everything completed.';
						files.map((file, index) => {
							promises.push(runAll(progress, file, files, index));
						});
						message = 'Everything completed.';
						commandOption = 'everything';
						break;
					case 'empty metadata':
						const options: QuickPickOptions = { placeHolder: 'Empty metadata' };
						const qpItems: QuickPickItem[] = [];
						qpItems.push({
							description: '',
							label: 'Remove metadata attributes with empty values'
						});
						qpItems.push({
							description: '',
							label: `Remove metadata attributes with "na" or "n/a"`
						});
						qpItems.push({
							description: '',
							label: 'Remove commented out metadata attributes'
						});
						qpItems.push({
							description: '',
							label: 'Remove all'
						});
						showStatusMessage('Cleanup: Metadata attribute cleanup started.');
						const selected = await window.showQuickPick(qpItems, options);
						if (!selected) {
							return;
						}
						message = 'Metadata attribute cleanup started.';
						progress.report({ increment: 1, message });
						switch (selected.label.toLowerCase()) {
							case 'remove metadata attributes with empty values':
								files.map((file, index) => {
									promises.push(removeEmptyMetadata(progress, file, files, index, 'empty'));
								});
								commandOption = 'remove-empty';
								break;
							case `remove metadata attributes with "na" or "n/a"`:
								files.map((file, index) => {
									promises.push(removeEmptyMetadata(progress, file, files, index, 'na'));
								});
								commandOption = 'remove-na';
								break;
							case 'remove commented out metadata attributes':
								files.map((file, index) => {
									promises.push(removeEmptyMetadata(progress, file, files, index, 'commented'));
								});
								commandOption = 'remove-commented';
								break;
							case 'remove all':
								files.map((file, index) => {
									promises.push(removeEmptyMetadata(progress, file, files, index, 'all'));
								});
								commandOption = 'remove-all-empty';
								break;
						}
						message = 'Metadata attribute cleanup completed.';
						statusMessage = 'Cleanup: Metadata attribute cleanup completed.';
				}
				Promise.all(promises)
					.then(() => {
						progress.report({ increment: 100, message: `${message} 100%` });
						showStatusMessage(statusMessage);
						setTimeout(() => {
							resolve();
						}, 2000);
					})
					.catch(error => {
						postError(error);
						reject();
					});
				sendTelemetryData(telemetryCommand, commandOption);
			});
		}
	);
}

export async function applyCleanup() {
	const { items, opts } = getCleanUpQuickPick();
	items.push({
		description: '',
		label: 'Master redirection file'
	});
	items.push({
		description: '',
		label: 'Unused images and includes'
	});
	items.push({
		description: '',
		label: 'Everything'
	});
	const selection = await window.showQuickPick(items, opts);
	if (!selection) {
		return;
	}
	window.withProgress(
		{
			cancellable: true,
			location: ProgressLocation.Notification,
			title: 'Cleanup'
		},
		(progress, token) => {
			token.onCancellationRequested(() => {
				postError('User canceled the long running operation');
			});
			return new Promise(async (resolve, reject) => {
				const editor = window.activeTextEditor;
				if (!editor) {
					noActiveEditorMessage();
					return;
				} else {
					const resource = editor.document.uri;
					const folder = workspace.getWorkspaceFolder(resource);
					if (folder) {
						const workspacePath = folder.uri.fsPath;

						if (workspacePath == null) {
							postError('No workspace is opened.');
							reject();
						}

						// Check if the current workspace is the root folder of a repo by checking if the .git folder is present
						const gitDir = join(workspacePath, '.git');
						if (!existsSync(gitDir)) {
							postError('Current workspace is not root folder of a repo.');
							reject();
						}
						let message = '';
						let statusMessage = '';
						const promises: Promise<any>[] = [];
						switch (selection.label.toLowerCase()) {
							case 'single-valued metadata':
								showStatusMessage('Cleanup: Single-Valued metadata started.');
								message = 'Single-Valued metadata started.';
								progress.report({ increment: 1, message });
								statusMessage = 'Cleanup: Single-Valued metadata completed.';
								promises.push(recurseCallback(workspacePath, progress, handleSingleValuedMetadata));
								message = 'Single-Valued metadata completed.';
								commandOption = 'single-value';
								break;
							case 'microsoft links':
								showStatusMessage('Cleanup: Microsoft Links started.');
								message = 'Microsoft Links started.';
								progress.report({ increment: 1, message });
								statusMessage = 'Cleanup: Microsoft Links completed.';
								promises.push(recurseCallback(workspacePath, progress, microsoftLinks));
								message = 'Microsoft Links completed.';
								commandOption = 'links';
								break;
							case 'capitalization of metadata values':
								showStatusMessage('Cleanup: Capitalization of metadata values started.');
								message = 'Capitalization of metadata values started.';
								progress.report({ increment: 1, message });
								statusMessage = 'Cleanup: Capitalization of metadata values completed.';
								promises.push(recurseCallback(workspacePath, progress, capitalizationOfMetadata));
								message = 'Capitalization of metadata values completed.';
								commandOption = 'capitalization';
								break;
							case 'master redirection file':
								showStatusMessage('Cleanup: Master redirection started.');
								message = 'Master redirection started.';
								progress.report({ increment: 1, message });
								statusMessage = 'Cleanup: Master redirection completed.';
								await generateMasterRedirectionFile(workspacePath, resolve);
								message = 'Master redirection complete.';
								commandOption = 'redirects';
								break;
							case 'unused images and includes':
								showStatusMessage('Cleanup: Unused Images and includes.');
								message = 'Removal of unused images and includes started.';
								progress.report({ increment: 1, message });
								statusMessage =
									'Cleanup: Removing unused images and includes. This could take several minutes.';
								promises.push(
									new Promise(res => {
										removeUnusedImagesAndIncludes(progress, workspacePath, res);
									})
								);
								message = 'Removal of unused images and includes complete.';
								commandOption = 'unused-images-and-includes';
								break;
							case 'clean up devlang for code blocks':
								showStatusMessage('Cleanup: Devlang for code blocks started.');
								message = 'Clean up devlang for code blocks started.';
								progress.report({ increment: 1, message });
								statusMessage = 'Cleanup: Devlang for code blocks completed.';
								promises.push(recurseCallback(workspacePath, progress, cleanUpDevLangInCodeBlocks));
								message = 'Clean up devlang for code blocks completed.';
								commandOption = 'devlang';
								break;
							case 'everything':
								progress.report({ increment: 1, message });
								await runAllWorkspace(workspacePath, progress, resolve);
								commandOption = 'everything';
								break;
							case 'empty metadata':
								const options: QuickPickOptions = { placeHolder: 'Cleanup...' };
								const qpItems: QuickPickItem[] = [];
								qpItems.push({
									description: '',
									label: 'Remove metadata attributes with empty values'
								});
								qpItems.push({
									description: '',
									label: `Remove metadata attributes with "na" or "n/a"`
								});
								qpItems.push({
									description: '',
									label: 'Remove commented out metadata attributes'
								});
								qpItems.push({
									description: '',
									label: 'Remove all'
								});
								showStatusMessage('Cleanup: Metadata attribute cleanup started.');
								const selected = await window.showQuickPick(qpItems, options);
								if (!selected) {
									reject();
									return;
								}
								message = 'Empty metadata attribute cleanup started.';
								progress.report({ increment: 1, message });
								statusMessage = 'Cleanup: Metadata attribute cleanup completed.';
								promises.push(
									new Promise((chainResolve, chainReject) => {
										recursive(workspacePath, ignoreFiles, (err: any, files: string[]) => {
											if (err) {
												postError(err);
												chainReject();
											}
											const filePromises: Promise<any>[] = [];
											switch (selected.label.toLowerCase()) {
												case 'remove metadata attributes with empty values':
													files.map((file, index) => {
														filePromises.push(
															removeEmptyMetadata(progress, file, files, index, 'empty')
														);
													});
													commandOption = 'remove-empty';
													break;
												case `remove metadata attributes with "na" or "n/a"`:
													files.map((file, index) => {
														filePromises.push(
															removeEmptyMetadata(progress, file, files, index, 'na')
														);
													});
													commandOption = 'remove-na';
													break;
												case 'remove commented out metadata attributes':
													files.map((file, index) => {
														filePromises.push(
															removeEmptyMetadata(progress, file, files, index, 'commented')
														);
													});
													commandOption = 'remove-commented';
													break;
												case 'remove all':
													files.map((file, index) => {
														filePromises.push(
															removeEmptyMetadata(progress, file, files, index, 'all')
														);
													});
													commandOption = 'remove-all';
													break;
											}
											Promise.all(filePromises)
												.then(() => {
													chainResolve();
												})
												.catch(error => {
													postError(error);
												});
										});
										message = 'Empty metadata attribute cleanup completed.';
									})
								);
						}
						Promise.all(promises)
							.then(() => {
								progress.report({ increment: 100, message: `${message} 100%` });
								showStatusMessage(statusMessage);
								setTimeout(() => {
									resolve();
								}, 2000);
							})
							.catch(err => {
								postError(err);
							});
						sendTelemetryData(telemetryCommand, commandOption);
					}
				}
			});
		}
	);
}
