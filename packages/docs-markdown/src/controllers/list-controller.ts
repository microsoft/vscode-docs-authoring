'use strict';

import * as vscode from 'vscode';
import { ListType } from '../constants/list-type';
import {
	insertContentToEditor,
	isMarkdownFileCheck,
	isValidEditor,
	noActiveEditorMessage
} from '../helper/common';
import {
	addIndent,
	autolistAlpha,
	autolistNumbered,
	checkEmptyLine,
	checkEmptySelection,
	CountIndent,
	createBulletedListFromText,
	createNumberedListFromText,
	fixedBulletedListRegex,
	fixedNumberedListWithIndentRegexTemplate,
	getAlphabetLine,
	getNumberedLine,
	getNumberedLineWithRegex,
	insertList,
	isBulletedLine,
	nestedNumberedList,
	removeNestedListMultipleLine,
	removeNestedListSingleLine,
	tabPattern
} from '../helper/list';
import { output } from '../helper/output';
import { sendTelemetryData } from '../helper/telemetry';

const telemetryCommand: string = 'insertList';
let commandOption: string;

export function insertListsCommands() {
	const commands = [
		{ command: automaticList.name, callback: automaticList },
		{ command: insertBulletedList.name, callback: insertBulletedList },
		{ command: insertNestedList.name, callback: insertNestedList },
		{ command: insertNumberedList.name, callback: insertNumberedList },
		{ command: removeNestedList.name, callback: removeNestedList }
	];
	return commands;
}

/**
 * Creates a numbered (numerical) list in the vscode editor.
 */
export function insertNumberedList() {
	commandOption = 'numbered';
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	} else {
		if (!isValidEditor(editor, false, 'insert numbered list')) {
			return;
		}

		if (!isMarkdownFileCheck(editor, false)) {
			return;
		}

		if (checkEmptyLine(editor) || checkEmptySelection(editor)) {
			insertList(editor, ListType.Numbered);
		} else {
			createNumberedListFromText(editor);
		}
		sendTelemetryData(telemetryCommand, commandOption);
	}
}

/**
 * Creates a bulleted (dash) list in the vscode editor.
 */
export function insertBulletedList() {
	commandOption = 'bulleted';
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	} else {
		if (!isValidEditor(editor, false, 'insert bulleted list')) {
			return;
		}

		if (!isMarkdownFileCheck(editor, false)) {
			return;
		}

		try {
			if (checkEmptyLine(editor)) {
				insertList(editor, ListType.Bulleted);
			} else {
				createBulletedListFromText(editor);
			}
		} catch (error) {
			output.appendLine(error);
		}
		sendTelemetryData(telemetryCommand, commandOption);
	}
}

/**
 * Adds the next list item automatically. Either bulleted or numbered, includes indentation.
 */
export function automaticList() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	} else {
		try {
			if (!isValidEditor(editor, false, 'automatic list')) {
				return;
			}

			if (!isMarkdownFileCheck(editor, false)) {
				return;
			}

			const cursorPosition = editor.selection.active;
			const numbered = getNumberedLine(
				editor.document.lineAt(cursorPosition.line).text.substring(0, cursorPosition.character)
			);
			const alphabet = getAlphabetLine(
				editor.document.lineAt(cursorPosition.line).text.substring(0, cursorPosition.character)
			);

			if (numbered > 0) {
				autolistNumbered(editor, cursorPosition, numbered);
			} else if (alphabet > 0) {
				autolistAlpha(editor, cursorPosition, alphabet);
			} else if (
				isBulletedLine(editor.document.lineAt(cursorPosition.line).text.trim()) &&
				!cursorPosition.isEqual(cursorPosition.with(cursorPosition.line, 0))
			) {
				// Check if the line is a bulleted line
				const strLine = editor.document.lineAt(cursorPosition.line).text;
				let insertText = '';
				const indent = addIndent(editor.document.lineAt(cursorPosition.line).text);
				if (strLine.trim() === '-' && strLine.indexOf('-') === strLine.length - 1) {
					insertText = ' \n' + indent + '- ';
				} else {
					insertText = '\n' + indent + '- ';
				}
				insertContentToEditor(editor, insertText, false);
			} else {
				// default case
				const defaultText = '\n';
				insertContentToEditor(editor, defaultText, false);
			}
		} catch (Exception) {
			const exceptionText = '\n';
			insertContentToEditor(editor, exceptionText, false);
		}
	}
}

/**
 * Creates indentation in an existing list.
 */
export function insertNestedList() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	} else {
		const cursorPosition = editor.selection.active;

		if (!isValidEditor(editor, false, 'insert nested list')) {
			return;
		}

		if (!isMarkdownFileCheck(editor, false)) {
			return;
		}

		// Check user selected multiple line (Still not support automatic nested list for multiple line)
		if (!editor.selection.isSingleLine) {
			const startSelected = editor.selection.start;
			const endSelected = editor.selection.end;
			const selectedLines = [];

			// Insert tab to multiple line
			for (let i = startSelected.line; i <= endSelected.line; i++) {
				const lineText = editor.document.lineAt(i).text;

				selectedLines.push(tabPattern + lineText);
			}

			// Replace editor's text
			const range: vscode.Range = new vscode.Range(
				startSelected.line,
				0,
				endSelected.line,
				editor.document.lineAt(endSelected.line).text.length
			);
			const updateText = selectedLines.join('\n');
			insertContentToEditor(editor, updateText, true, range);
		} else if (!checkEmptyLine(editor)) {
			const text = editor.document.getText(
				new vscode.Range(
					cursorPosition.with(cursorPosition.line, 0),
					cursorPosition.with(cursorPosition.line, editor.selection.end.character)
				)
			);
			const indentCount = CountIndent(editor.document.lineAt(cursorPosition.line).text);
			const numberedRegex = new RegExp(
				fixedNumberedListWithIndentRegexTemplate.replace('{0}', indentCount.toString())
			);

			// Handle nested list of bullet
			if (fixedBulletedListRegex.exec(text) != null) {
				editor.edit(update => {
					update.insert(cursorPosition.with(cursorPosition.line, 0), tabPattern);
				});
			} else if (getNumberedLineWithRegex(numberedRegex, text) > 0) {
				nestedNumberedList(editor, cursorPosition, indentCount);
				insertContentToEditor(editor, tabPattern, false);
			} else {
				insertContentToEditor(editor, tabPattern, false);
			}
		} else {
			insertContentToEditor(editor, tabPattern, false);
		}
	}
}

/**
 *  Removes indentation from a nested list.
 */
export function removeNestedList() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	} else {
		if (!isMarkdownFileCheck(editor, false)) {
			return;
		}

		// Check user selected multiple line
		if (!editor.selection.isSingleLine) {
			// Delete multiple line
			removeNestedListMultipleLine(editor);
		} else {
			removeNestedListSingleLine(editor);
		}
	}
}
