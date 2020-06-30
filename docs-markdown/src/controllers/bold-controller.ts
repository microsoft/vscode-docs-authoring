'use strict';

import { Range, Selection, TextEditorEdit, window } from 'vscode';
import {
	insertContentToEditor,
	isMarkdownFileCheck,
	isValidEditor,
	noActiveEditorMessage,
	postWarning,
	showStatusMessage
} from '../helper/common';
import { insertUnselectedText } from '../helper/format-logic-manager';
import { isBold, isBoldAndItalic } from '../helper/format-styles';
import { sendTelemetryData } from '../helper/telemetry';

const telemetryCommand: string = 'formatBold';

export function boldFormattingCommand() {
	const commands = [{ command: formatBold.name, callback: formatBold }];
	return commands;
}

/**
 * Replaces current selection with MD bold formatted selection
 */
export async function formatBold() {
	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	} else {
		if (!isValidEditor(editor, true, 'format bold')) {
			return;
		}

		if (!isMarkdownFileCheck(editor, false)) {
			return;
		}

		const selections: Selection[] = editor.selections;
		let range;

		// if unselect text, add bold syntax without any text
		if (selections.length === 0) {
			const cursorPosition = editor.selection.active;
			const selectedText = '';
			// assumes the range of bold syntax
			range = new Range(
				cursorPosition.with(
					cursorPosition.line,
					cursorPosition.character - 2 < 0 ? 0 : cursorPosition.character - 2
				),
				cursorPosition.with(cursorPosition.line, cursorPosition.character + 2)
			);
			// calls formatter and returns selectedText as MD bold
			const formattedText = bold(selectedText);
			await insertUnselectedText(editor, formatBold.name, formattedText, range);
		}

		// if only a selection is made with a single cursor
		if (selections.length === 1) {
			const selection = editor.selection;
			const selectedText = editor.document.getText(selection);
			const cursorPosition = editor.selection.active;
			range = new Range(
				cursorPosition.with(
					cursorPosition.line,
					cursorPosition.character - 2 < 0 ? 0 : cursorPosition.character - 2
				),
				cursorPosition.with(cursorPosition.line, cursorPosition.character + 2)
			);
			// calls formatter and returns selectedText as MD Bold
			const formattedText = bold(selectedText);
			insertContentToEditor(editor, formattedText, true);
		}

		// if multiple cursors were used to make selections
		if (selections.length > 1) {
			editor
				.edit((edit: TextEditorEdit): void => {
					selections.forEach((selection: Selection) => {
						for (let i = selection.start.line; i <= selection.end.line; i++) {
							const selectedText = editor.document.getText(selection);
							const formattedText = bold(selectedText);
							edit.replace(selection, formattedText);
						}
					});
				})
				.then(success => {
					if (!success) {
						postWarning('Could not format selections. Abandoning command.');
						showStatusMessage('Could not format selections. Abandoning command.');
						return;
					}
				});
		}
	}
	sendTelemetryData(telemetryCommand, '');
}

/**
 * Returns input string formatted MD Bold.
 * @param {string} content - selected text
 * @param {vscode.Range} range - If provided will get the text at the given range.
 */
export function bold(content: string, range?: Range) {
	// Clean up string if it is already formatted
	const selectedText = content.trim();

	if (isBold(content) || isBoldAndItalic(content)) {
		return selectedText.substring(2, selectedText.length - 2);
	}

	// Set syntax for bold formatting and replace original string with formatted string
	const styleBold = `**${selectedText}**`;
	return styleBold;
}
