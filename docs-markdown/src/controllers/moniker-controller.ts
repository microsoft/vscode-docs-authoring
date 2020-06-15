'use strict';

import { Range, TextEditor, window } from 'vscode';
import {
	insertContentToEditor,
	isMarkdownFileCheck,
	noActiveEditorMessage,
	setCursorPosition
} from '../helper/common';
import { sendTelemetryData } from '../helper/telemetry';
import { isCursorInsideYamlHeader } from '../helper/yaml-metadata';

export function insertMonikerCommand() {
	const commands = [{ command: insertMoniker.name, callback: insertMoniker }];
	return commands;
}

export async function insertMoniker() {
	const editor = window.activeTextEditor;
	let sign: string = '';

	if (!editor) {
		noActiveEditorMessage();
		return;
	}

	if (!isMarkdownFileCheck(editor, false)) {
		return;
	}

	// is cursor on a new line
	if (isContentOnCurrentLine(editor)) {
		window.showErrorMessage('Moniker must be inserted on a new line.');
		return;
	}

	const monikerOptions = [
		'range equals',
		'range greater than or equal',
		'range less than or equal'
	];

	const qpSelection = await window.showQuickPick(monikerOptions);
	if (!qpSelection) {
		return;
	}
	if (qpSelection === monikerOptions[0]) {
		sign = '';
	}
	if (qpSelection === monikerOptions[1]) {
		sign = '>=';
	}
	if (qpSelection === monikerOptions[2]) {
		sign = '<=';
	}

	// if markdown, is the user's cursor in the yaml header?
	if (isCursorInsideYamlHeader(editor)) {
		await insertYamlMoniker(editor, sign);
	} else {
		await insertMarkdownMoniker(editor, sign);
	}
}

// cursor is in the YAML metadata block
async function insertYamlMoniker(editor: TextEditor, sign: string) {
	const telemetryCommand: string = 'insertMoniker';
	const insertText = `monikerRange: '${sign}'`;
	const cursorIndex = insertText.indexOf("'") + sign.length + 1;
	await insertContentToEditor(editor, insertText, false);
	setCursorPosition(editor, editor.selection.active.line, cursorIndex);

	const cursorPosition = 'yaml-header';
	sendTelemetryData(telemetryCommand, cursorPosition);
}

// cursor is in the Markdown body of the file
async function insertMarkdownMoniker(editor: TextEditor, sign: string) {
	const telemetryCommand: string = 'insertMoniker';
	const insertText = `::: moniker range="${sign}"\n\n::: moniker-end`;
	await insertContentToEditor(editor, insertText, false);
	const cursorIndex = insertText.indexOf(`"`) + sign.length + 1;
	setCursorPosition(editor, editor.selection.active.line, cursorIndex);
	const cursorPosition = 'markdown-body';
	sendTelemetryData(telemetryCommand, cursorPosition);
}

function isContentOnCurrentLine(editor: TextEditor): boolean {
	const range = new Range(editor.selection.active.line, 0, editor.selection.active.line, 1000);
	const lineText = editor.document.getText(range);
	if (lineText === '') {
		return false;
	}
	return !/^\s+$/.test(lineText);
}
