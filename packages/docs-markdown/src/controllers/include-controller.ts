/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

import * as os from 'os';
import * as path from 'path';
import { QuickPickItem, window, workspace } from 'vscode';
import {
	hasValidWorkSpaceRootPath,
	isMarkdownFileCheck,
	noActiveEditorMessage
} from '../helper/common';
import { sendTelemetryData } from '../helper/telemetry';
import { includeBuilder } from '../helper/utility';
import { getOpenPublishingFile } from './snippet/utilities';
import { resolve, join } from 'path';
import * as vscode from 'vscode';
import { Helpers } from './doc-index/helpers';
const util = require('util');
const glob = util.promisify(require('glob'));

const telemetryCommand: string = 'insertInclude';
const markdownExtension = '.md';

export function insertIncludeCommand() {
	const commands = [{ command: insertInclude.name, callback: insertInclude }];
	return commands;
}

const repoLookup: Map<string, string> = new Map<string, string>();

/**
 * transforms the current selection into an include.
 */
export async function insertInclude() {
	const editor = window.activeTextEditor;

	if (!editor) {
		noActiveEditorMessage();
		return;
	}

	const activeFileDir = path.dirname(editor.document.fileName);
	let folderPath: string = '';

	if (workspace.workspaceFolders) {
		folderPath = workspace.workspaceFolders[0].uri.fsPath;
	}

	if (!isMarkdownFileCheck(editor, false)) {
		return;
	}

	if (!hasValidWorkSpaceRootPath(telemetryCommand)) {
		return;
	}

	if (!folderPath) {
		return;
	}

	const files = await glob('**/includes/**/*.md', {
		cwd: folderPath,
		nocase: true,
		realpath: true
	});
	const items: QuickPickItem[] = [];

	files.forEach((file: string) =>
		items.push({
			description: path.dirname(file),
			label: path.basename(file)
		})
	);

	const descSelector = (item: QuickPickItem) => (item && item.description) || '';
	items.sort((a, b) => {
		const [aDesc, bDesc] = [descSelector(a), descSelector(b)];
		if (aDesc < bDesc) {
			return -1;
		}
		if (aDesc > bDesc) {
			return 1;
		}

		return 0;
	});

	// show the quick pick menu
	const qpSelection = await window.showQuickPick(items);

	// replace the selected text with the properly formatted link
	if (!qpSelection) {
		return;
	}

	let result: string;
	const position = editor.selection.active;

	// strip markdown extension from label text.
	const includeText = qpSelection.label.replace(markdownExtension, '');
	switch (os.type()) {
		case 'Windows_NT':
			result = includeBuilder(
				path.relative(
					activeFileDir,
					path
						.join(qpSelection.description || 'Unknown', qpSelection.label)
						.split('\\')
						.join('\\\\')
				),
				includeText
			);
			break;
		case 'Darwin':
			result = includeBuilder(
				path.relative(
					activeFileDir,
					path
						.join(qpSelection.description || 'Unknown', qpSelection.label)
						.split('//')
						.join('//')
				),
				includeText
			);
			break;
	}

	await editor.edit(editBuilder => {
		editBuilder.insert(position, result.replace(/\\/g, '/'));
	});

	sendTelemetryData(telemetryCommand, '');
}

export async function getIncludeText(filePath: string): Promise<string> {
	const fs = require('fs');
	return await fs.readFileSync(filePath, 'utf8');
}

export async function getOpenPublishingConfigFile(filePath: string) {
	const fs = require('fs');
	const openPublishingFilePath = resolve(filePath, '.openpublishing.publish.config.json');
	const openPublishingFile = await fs.readFileSync(openPublishingFilePath, 'utf8');
	const openPublishingJson = JSON.parse(openPublishingFile);
	return openPublishingJson.dependent_repositories;
}

export async function getSnippetText(crossReference?: string, filePath?: string): Promise<string> {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	let result = '';
	const path = require('path');
	let selected: QuickPickItem | undefined;
	if (repoLookup.has(crossReference)) {
		result = await getIncludeText(
			Helpers.trimEndStr(Helpers.trimEndStr(repoLookup.get(crossReference), '\\'), '/').replace(
				/\\/gim,
				'/'
			) +
				'/' +
				filePath
		);
	}

	if (workspace) {
		if (workspace.workspaceFolders) {
			const repoRoot = workspace.workspaceFolders[0].uri.fsPath;
			const openPublishingRepos = await getOpenPublishingConfigFile(repoRoot);
			if (openPublishingRepos) {
				const openPublishingOptions: QuickPickItem[] = [];
				openPublishingRepos.map((repo: { path_to_root: string; url: string }) => {
					openPublishingOptions.push({ label: repo.path_to_root, description: repo.url });
				});
				const repo = openPublishingOptions.filter(e => e.label === crossReference)[0];
				if (repo !== undefined) {
					try {
						const inputRepoPath = await vscode.window.showInputBox({
							prompt: `Enter file path for Cross-Reference GitHub Repo: ${repo.description}`
						});

						if (inputRepoPath) {
							repoLookup.set(crossReference, inputRepoPath);
							result = await getIncludeText(
								Helpers.trimEndStr(Helpers.trimEndStr(inputRepoPath, '\\'), '/').replace(
									/\\/gim,
									'/'
								) +
									'/' +
									filePath
							);
						}
					} catch (error) {
						const errorString = error.toString();
						const stackTrace = !!error.stack ? error.stack : '';
					}
				}
			}
		}
	}

	return result;
}
