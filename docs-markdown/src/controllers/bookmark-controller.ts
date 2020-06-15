'use strict';

import { existsSync, readFileSync } from 'fs';
import { basename, dirname, extname, join, relative, resolve } from 'path';
import * as recursive from 'recursive-readdir';
import { QuickPickItem, window, workspace } from 'vscode';
import { addbookmarkIdentifier, bookmarkBuilder } from '../helper/bookmark-builder';
import { ignoreFiles, insertContentToEditor, noActiveEditorMessage } from '../helper/common';
import { sendTelemetryData } from '../helper/telemetry';

const telemetryCommand: string = 'insertBookmark';
let commandOption: string;
const markdownExtensionFilter = ['.md'];

export const headingTextRegex = /^ {0,3}(#{2,6})(.*)/gm;
export const yamlTextRegex = /^-{3}\s*\r?\n([\s\S]*?)-{3}\s*\r?\n([\s\S]*)/;

export function insertBookmarkCommands() {
	const commands = [
		{ command: insertBookmarkExternal.name, callback: insertBookmarkExternal },
		{ command: insertBookmarkInternal.name, callback: insertBookmarkInternal }
	];
	return commands;
}

/**
 * Creates a bookmark to another file at the cursor position
 */
export async function insertBookmarkExternal() {
	commandOption = 'external';
	let folderPath: string = '';
	let fullPath: string = '';

	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}
	const activeFileName = editor.document.fileName;
	const activeFilePath = dirname(activeFileName);

	// Check to see if the active file has been saved.  If it has not been saved, warn the user.
	// The user will still be allowed to add a link but it the relative path will not be resolved.

	if (!existsSync(activeFileName)) {
		window.showWarningMessage(
			`${activeFilePath} is not saved.  Cannot accurately resolve path to create link.`
		);
		return;
	}
	if (workspace.workspaceFolders) {
		folderPath = workspace.workspaceFolders[0].uri.fsPath;
	}

	// recursively get all the files from the root folder
	const files = await recursive(folderPath, ignoreFiles);

	const items: QuickPickItem[] = [];
	files.sort();
	files
		.filter((file: any) => markdownExtensionFilter.indexOf(extname(file.toLowerCase())) !== -1)
		.forEach((file: any) => {
			items.push({ label: basename(file), description: dirname(file) });
		});

	// show the quick pick menu
	const qpSelection = await window.showQuickPick(items);
	let result = '';
	let bookmark = '';

	if (!qpSelection) {
		return;
	}

	if (qpSelection.description) {
		fullPath = join(qpSelection.description, qpSelection.label);
	}

	const content = readFileSync(fullPath, 'utf8');
	const headings = content.match(headingTextRegex);

	if (!headings) {
		window.showErrorMessage('No headings found in file, cannot insert bookmark!');
		return;
	}

	const adjustedHeadingsItems: QuickPickItem[] = [];
	const adjustedHeadings = addbookmarkIdentifier(headings);
	adjustedHeadings.forEach((adjustedHeading: string) => {
		adjustedHeadingsItems.push({ label: adjustedHeading, detail: ' ' });
	});

	const headingSelection = await window.showQuickPick(adjustedHeadingsItems);
	if (!headingSelection) {
		return;
	}
	if (
		resolve(activeFilePath) === resolve(qpSelection.label.split('\\').join('\\\\')) &&
		basename(activeFileName) === qpSelection.label
	) {
		bookmark = bookmarkBuilder(
			editor.document.getText(editor.selection),
			headingSelection.label,
			''
		);
	} else {
		if (qpSelection.description) {
			result = relative(
				activeFilePath,
				join(qpSelection.description, qpSelection.label).split('\\').join('\\\\')
			);
		}
		bookmark = bookmarkBuilder(
			editor.document.getText(editor.selection),
			headingSelection.label,
			result
		);
	}
	await insertContentToEditor(editor, bookmark, true, editor.selection);
	sendTelemetryData(telemetryCommand, commandOption);
}

/**
 * Creates a bookmark at the current cursor position
 */
export async function insertBookmarkInternal() {
	commandOption = 'internal';
	const editor = window.activeTextEditor;
	if (!editor) {
		return;
	}

	const content = editor.document.getText();
	const headings = content.match(headingTextRegex);
	if (!headings) {
		window.showErrorMessage('No headings found in file, cannot insert bookmark!');
		return;
	}

	// put number to duplicate names in position order
	const adjustedHeadings = addbookmarkIdentifier(headings);
	const adjustedHeadingsItems: QuickPickItem[] = [];
	adjustedHeadings.forEach((heading: string) => {
		adjustedHeadingsItems.push({ label: heading, detail: ' ' });
	});

	const headingSelection = await window.showQuickPick(adjustedHeadingsItems);
	if (!headingSelection) {
		return;
	}
	const bookmark = bookmarkBuilder(
		editor.document.getText(editor.selection),
		headingSelection.label,
		''
	);
	await insertContentToEditor(editor, bookmark, true, editor.selection);
	sendTelemetryData(telemetryCommand, commandOption);
}
