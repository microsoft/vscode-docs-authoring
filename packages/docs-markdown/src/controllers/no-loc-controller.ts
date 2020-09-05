'use strict';

import { CompletionItem, Position, Range, Selection, TextEditor, window } from 'vscode';
import {
	insertContentToEditor,
	isMarkdownFileCheck,
	noActiveEditorMessage
} from '../helper/common';
import { sendTelemetryData } from '../helper/telemetry';
import { isCursorInsideYamlHeader } from '../helper/yaml-metadata';

const telemetryCommand: string = 'applyNoLoc';
let commandOption: string;

export function noLocTextCommand() {
	const commands = [{ command: noLocText.name, callback: noLocText }];
	return commands;
}

export function noLocCompletionItemsMarkdownYamlHeader() {
	return [new CompletionItem(`no-loc: []`)];
}
export function noLocCompletionItemsMarkdown() {
	return [new CompletionItem(`:::no-loc text="":::`)];
}
export function noLocCompletionItemsYaml() {
	return [new CompletionItem(`no-loc:\n- `)];
}

/**
 * Inserts non-localizable text
 */
export async function noLocText() {
	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}

	// is this a markdown file or yaml?
	if (isMarkdownFileCheck(editor, false)) {
		// if markdown, is the user's cursor in the yaml header?
		if (isCursorInsideYamlHeader(editor)) {
			await insertYamlNoLocEntry(editor);
		} else {
			await insertMarkdownNoLocEntry(editor);
		}
	} else {
		await insertYamlNoLocEntry(editor);
	}
}

async function insertYamlNoLocEntry(editor: TextEditor) {
	commandOption = 'yaml-entry';
	sendTelemetryData(telemetryCommand, commandOption);
	if (isContentOnCurrentLine(editor)) {
		window.showErrorMessage('The no-loc metadata must be inserted on a new line.');
		return;
	}

	if (isMarkdownFileCheck(editor, false)) {
		const insertText = 'no-loc: []';
		await insertContentToEditor(editor, insertText, false);
		const newPosition = new Position(editor.selection.active.line, insertText.indexOf(']'));
		const newSelection = new Selection(newPosition, newPosition);
		editor.selection = newSelection;
	} else {
		const tabs = getTabInsertion(editor);

		const insertText = `no-loc:\n${tabs}- `;
		await insertContentToEditor(editor, insertText, false);
		const newPosition = new Position(
			editor.selection.active.line + 1,
			insertText.indexOf('- ') + 1
		);
		const newSelection = new Selection(newPosition, newPosition);
		editor.selection = newSelection;
	}
}

function getTabInsertion(editor: TextEditor): string {
	let tabs = '';
	const numToInsert = editor.selection.end.character;
	for (let ii = 0; ii < numToInsert; ii++) {
		tabs += editor.options.insertSpaces ? ' ' : '\t';
	}
	return tabs;
}

async function insertMarkdownNoLocEntry(editor: TextEditor) {
	commandOption = 'markdown-entry';
	sendTelemetryData(telemetryCommand, commandOption);
	const textSelection = editor.document.getText(editor.selection);
	if (textSelection === '') {
		const insertText = `:::no-loc text="":::`;
		await insertContentToEditor(editor, insertText, false);
		const newPosition = new Position(
			editor.selection.active.line,
			editor.selection.active.character + insertText.indexOf(`"`) + 1
		);
		const newSelection = new Selection(newPosition, newPosition);
		editor.selection = newSelection;
	} else {
		const insertText = `:::no-loc text="${textSelection}":::`;
		await insertContentToEditor(editor, insertText, true, editor.selection);
		const newPosition = new Position(
			editor.selection.end.line,
			editor.selection.end.character + insertText.indexOf(`"`) + 1
		);
		const newSelection = new Selection(newPosition, newPosition);
		editor.selection = newSelection;
	}
}

function isContentOnCurrentLine(editor: TextEditor): boolean {
	const range = new Range(editor.selection.active.line, 0, editor.selection.active.line, 1000);
	const lineText = editor.document.getText(range);
	if (lineText === '') {
		return false;
	}
	return !/^\s+$/.test(lineText);
}
