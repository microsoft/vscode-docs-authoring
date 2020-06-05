'use strict';

import { QuickPickOptions, Range, Selection, TextEditorEdit, window } from 'vscode';
import {
	insertContentToEditor,
	isMarkdownFileCheck,
	isValidEditor,
	noActiveEditorMessage,
	postWarning,
	showStatusMessage
} from '../helper/common';
import { insertUnselectedText } from '../helper/format-logic-manager';
import { isInlineCode, isMultiLineCode } from '../helper/format-styles';
import { getLanguageIdentifierQuickPickItems, languages } from '../helper/highlight-langs';
import { sendTelemetryData } from '../helper/telemetry';

const telemetryCommand: string = 'formatCode';

export function codeFormattingCommand() {
	const commands = [{ command: formatCode.name, callback: formatCode }];
	return commands;
}

/**
 * Replaces current single or multiline selection with MD code formated selection
 */
export async function formatCode() {
	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	} else {
		if (!isValidEditor(editor, true, 'format code')) {
			return;
		}

		if (!isMarkdownFileCheck(editor, false)) {
			return;
		}

		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);
		// Show code language list if the selected text spans multiple lines and is not already formatted as code block.
		// If the selected text is already in a code block, delete the fenced code wrapper.
		// Single line selections will not include a code language.
		if (!selection.isSingleLine) {
			if (!isMultiLineCode(selectedText)) {
				await showSupportedLanguages(selectedText, selection);
			} else {
				await applyCodeFormatting(selectedText, selection, '');
			}
		} else {
			await applyCodeFormatting(selectedText, selection, '');
		}
	}
	sendTelemetryData(telemetryCommand, '');
}

/**
 * Returns input string formatted MD Code or removed markdown code if it already exists.
 * @param {string} content - selected text
 * @param {boolean} isSingleLine - determines is code formatting is inline (isSingleLine = true)
 * @param {vscode.Range} range - If provided will get the text at the given range
 */
export function format(content: string, codeLang: string, isSingleLine: boolean, range: Range) {
	const selectedText = content.trim();

	let styleCode = '';

	// If the selection is contained in a single line treat it as inline code
	// If the selection spans multiple lines apply fenced code formatting
	if (isSingleLine) {
		// Clean up string if it is already formatted
		if (isInlineCode(selectedText)) {
			styleCode = selectedText.substring(1, selectedText.length - 1);
		} else {
			styleCode = '`' + selectedText + '`';
		}
	} else {
		if (isMultiLineCode(selectedText)) {
			// Determine the range if a supported language is part of the starting line.
			const getRange = selectedText.indexOf('\r\n');
			styleCode =
				'\r\n' + selectedText.substring(getRange, selectedText.length - 3).trim() + '\r\n';
		} else {
			styleCode = '\n```' + codeLang + '\n' + selectedText + '\n```\n';
		}
	}
	// Clean up string if it is already formatted
	return styleCode;
}

/**
 * Returns a list of code languages for users to choose from.  The languages will be displayed in a quick pick menu.
 */

export async function showSupportedLanguages(content: string, selectedContent: any) {
	const supportedLanguages = getLanguageIdentifierQuickPickItems();
	const options: QuickPickOptions = {
		matchOnDescription: true,
		placeHolder: 'Select a programming language (required)'
	};
	const qpSelection = await window.showQuickPick(supportedLanguages, options);
	if (!qpSelection) {
		postWarning('No code language selected. Abandoning command.');
		return;
	}

	const language = languages.find(lang => lang.language === qpSelection.label);
	if (language !== undefined) {
		const alias = language.aliases[0];
		await applyCodeFormatting(content, selectedContent, alias);
	}
}

export async function applyCodeFormatting(content: string, selectedContent: any, codeLang: string) {
	const selectedText = content.trim();
	const editor = window.activeTextEditor;

	if (!editor) {
		noActiveEditorMessage();
		return;
	} else {
		const selections: Selection[] = editor.selections;
		const emptyRange = new Range(editor.selection.active, editor.selection.active);

		// if unselect text, add bold syntax without any text
		if (selections.length === 0) {
			const cursorPosition = editor.selection.active;
			// assumes the range of code syntax
			const range = new Range(
				cursorPosition.with(
					cursorPosition.line,
					cursorPosition.character - 1 < 0 ? 0 : cursorPosition.character - 1
				),
				cursorPosition.with(cursorPosition.line, cursorPosition.character + 1)
			);

			const formattedText = format(selectedText, '', selectedContent.isSingleLine, range);

			await insertUnselectedText(editor, formatCode.name, formattedText, range);
		}

		// if only a selection is made with a single cursor
		if (selections.length === 1) {
			// calls formatter and returns selectedText as MD Code
			const formattedText = format(
				selectedText,
				codeLang,
				selectedContent.isSingleLine,
				emptyRange
			);

			await insertContentToEditor(editor, formattedText, true);
		}

		// if multiple cursors were used to make selections
		if (selections.length > 1) {
			const success = await editor.edit((edit: TextEditorEdit) => {
				selections.forEach((selection: Selection) => {
					for (let i = selection.start.line; i <= selection.end.line; i++) {
						const text = editor.document.getText(selection);
						const formattedText = format(text, codeLang, selectedContent.isSingleLine, emptyRange);
						edit.replace(selection, formattedText);
					}
				});
			});

			if (!success) {
				postWarning('Could not format selections. Abandoning command.');
				showStatusMessage('Could not format selections. Abandoning command.');
				return;
			}
		}
	}
}
