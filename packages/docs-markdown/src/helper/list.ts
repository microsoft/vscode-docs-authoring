'use strict';

/**
 * TODO: Update functions to remove interaction with the VSCode editor, to allow for unit testing of functionality.
 * TODO: Add function comments
 * TODO: Use common support functions instead of repetitious calls to VSCode directly.
 */

import * as vscode from 'vscode';
import { ListType } from '../constants/list-type';
import * as common from './common';
import { LineObjectModel } from './line-object-model';
import { ListObjectModel } from './list-object-model';

export const numberedListRegex = /^( )*[0-9]+\.( )/;
export const alphabetListRegex = /^( )*[a-z]{1}\.( )/;
export const bulletedListRegex = /^( )*\-( )/;
export const numberedListWithIndentRegexTemplate = '^( ){{0}}[0-9]+\\.( )';
export const alphabetListWithIndentRegexTemplate = '^( ){{0}}[a-z]{1}\\.( )';
export const fixedBulletedListRegex = /^( )*\-( )$/;
export const fixedNumberedListWithIndentRegexTemplate = '^( ){{0}}[0-9]+\\.( )$';
export const fixedAlphabetListWithIndentRegexTemplate = '^( ){{0}}[a-z]{1}\\.( )$';
export const startAlphabet = 'a';
export const numberedListValue = '1';
export const tabPattern = '    ';

/**
 * Creates a list(numbered or bulleted) in the vscode editor.
 */
export function insertList(editor: vscode.TextEditor, listType: ListType) {
	const cursorPosition = editor.selection.active;
	const lineText = editor.document.lineAt(cursorPosition.line).text;
	const listObjectModel = createListObjectModel(editor);
	let previousOuterNumbered =
		listObjectModel.previousOuter != null && listType === ListType.Numbered
			? listObjectModel.previousOuter.listNumber
			: 0;
	let previousNestedNumbered = startAlphabet.charCodeAt(0) - 1;

	const endInnerListedLine =
		listObjectModel.nextNested != null ? listObjectModel.nextNested.line : cursorPosition.line;
	const indentCount = CountIndent(lineText);
	let newNumberedLines = [];
	if (indentCount > 0 && indentCount !== 4) {
		newNumberedLines.push(
			listType === ListType.Numbered
				? ' '.repeat(indentCount) + '1. '
				: ' '.repeat(indentCount) + '- '
		);
		insertEmptyList(editor, newNumberedLines.join('\n'));
		common.setCursorPosition(editor, cursorPosition.line, newNumberedLines[0].length);
	} else {
		if (indentCount === 0) {
			const newlineText = listType === ListType.Numbered ? ++previousOuterNumbered + '. ' : '- ';
			newNumberedLines.push(newlineText);
		} else {
			const newlineText =
				listType === ListType.Numbered
					? tabPattern + String.fromCharCode(++previousNestedNumbered) + '. '
					: tabPattern + '- ';
			newNumberedLines.push(newlineText);
		}

		const updatedInnerListed = updateOrderedNumberedList(
			editor,
			cursorPosition.line + 1,
			endInnerListedLine,
			previousNestedNumbered,
			tabPattern.length,
			ListType.Alphabet
		);

		const updatedOuterListed = updateOrderedNumberedList(
			editor,
			endInnerListedLine + 1,
			editor.document.lineCount - 1,
			previousOuterNumbered,
			0,
			ListType.Numbered
		);
		newNumberedLines = newNumberedLines.concat(updatedInnerListed).concat(updatedOuterListed);
		const endLine = cursorPosition.line + updatedInnerListed.length + updatedOuterListed.length;

		const range: vscode.Range = new vscode.Range(
			cursorPosition.line,
			0,
			endLine,
			editor.document.lineAt(endLine).text.length
		);
		common.insertContentToEditor(editor, newNumberedLines.join('\n'), true, range);
		common.setCursorPosition(editor, cursorPosition.line, newNumberedLines[0].length);
	}
}

/**
 * Created a number list from existing text.
 */
export function createNumberedListFromText(editor: vscode.TextEditor) {
	const listObjectModel = createListObjectModel(editor);
	const startSelected = editor.selection.start;
	const endSelected = editor.selection.end;
	let previousNestedListNumbered =
		listObjectModel.previousNested != null
			? listObjectModel.previousNested.listNumber
			: startAlphabet.charCodeAt(0) - 1;
	let previousNestedListType =
		listObjectModel.previousNested != null
			? listObjectModel.previousNested.listType
			: ListType.Alphabet;
	const numberedListLines = [];
	const casetype = createNumberedListCaseType(editor, ListType.Numbered);
	// Update selected text
	for (let i = startSelected.line; i <= endSelected.line; i++) {
		let lineText = editor.document.lineAt(i).text;
		const indentCount = CountIndent(lineText);
		const numberedListType = getListTypeOfNumberedList(lineText);
		if (lineText.trim().length === 0) {
			numberedListLines.push(lineText);
			// previousOuterNumbered = 0;
			previousNestedListNumbered = startAlphabet.charCodeAt(0) - 1;
			previousNestedListType = ListType.Alphabet;
			continue;
		}
		lineText = getTextOfNumberedList(lineText, numberedListType);
		switch (casetype) {
			case CaseType.TextType:
				numberedListLines.push(lineText);
				break;
			case CaseType.UnIndentNestedType:
				numberedListLines.push(numberedListValue + '. ' + lineText);
				break;
			case CaseType.IndentType:
				if (indentCount === 0) {
					numberedListLines.push(numberedListValue + '. ' + lineText);
					previousNestedListNumbered = startAlphabet.charCodeAt(0) - 1;
					previousNestedListType = ListType.Alphabet;
				} else {
					if (previousNestedListType === ListType.Numbered) {
						numberedListLines.push(tabPattern + ++previousNestedListNumbered + '. ' + lineText);
					} else if (previousNestedListType === ListType.Alphabet) {
						numberedListLines.push(
							tabPattern + String.fromCharCode(++previousNestedListNumbered) + '. ' + lineText
						);
					} else {
						numberedListLines.push(tabPattern + lineText);
					}
				}
				break;
		}
	}
	if (casetype === CaseType.TextType) {
		// previousOuterNumbered = 0;
		previousNestedListNumbered = startAlphabet.charCodeAt(0) - 1;
		previousNestedListType = ListType.Alphabet;
	} else if (casetype === CaseType.UnIndentNestedType) {
		previousNestedListNumbered = startAlphabet.charCodeAt(0) - 1;
		previousNestedListType = ListType.Alphabet;
	}

	const newSelection = new vscode.Selection(
		new vscode.Position(startSelected.line, 0),
		new vscode.Position(endSelected.line, numberedListLines[numberedListLines.length - 1].length)
	);

	// const endInnerListedLine = listObjectModel.nextNested != null && CountIndent(editor.document.lineAt(endSelected.line).text) > 0 ? listObjectModel.nextNested.line : endSelected.line;
	const endLine = endSelected.line;

	const range = new vscode.Range(
		new vscode.Position(startSelected.line, 0),
		new vscode.Position(endLine, editor.document.lineAt(endLine).text.length)
	);
	common.insertContentToEditor(editor, numberedListLines.join('\n'), true, range);
	editor.selection = newSelection;
}

export function updateOrderedNumberedList(
	editor: vscode.TextEditor,
	startLine: number,
	endLine: number,
	currentNumber: number,
	indentCount: number,
	listType: ListType
) {
	const newNumberedLines = [];
	for (let lineNumber = startLine; lineNumber <= endLine; lineNumber++) {
		const lineText = editor.document.lineAt(lineNumber).text;
		if (lineText.trim() === '') {
			break;
		}
		const lineTextIndentCount = CountIndent(lineText);
		const lineTextListType = getListTypeOfNumberedList(lineText);

		if (
			lineTextIndentCount === indentCount &&
			(lineTextListType === ListType.Numbered || lineTextListType === ListType.Alphabet)
		) {
			const newlineText =
				' '.repeat(indentCount) +
				(listType === ListType.Numbered ? '1' : '1') +
				'. ' +
				getTextOfNumberedList(lineText, lineTextListType);
			newNumberedLines.push(newlineText);
		} else {
			newNumberedLines.push(lineText);
			if (lineTextIndentCount === indentCount) {
				currentNumber = listType === ListType.Numbered ? 0 : startAlphabet.charCodeAt(0) - 1;
			}
		}
	}
	return newNumberedLines;
}

export function updateNumberedList(
	editor: vscode.TextEditor,
	startLine: number,
	endLine: number,
	currentNumber: number,
	indent: string,
	isNested: boolean
) {
	let lineNumber = startLine;
	const newNumberedLines = [];

	// Update only the numbered list which is the indent are the same
	const regex = new RegExp(
		numberedListWithIndentRegexTemplate.replace('{0}', indent.length.toString())
	);

	for (; lineNumber <= endLine; lineNumber++) {
		let lineText = editor.document.lineAt(lineNumber).text;
		if (lineText.trim() === '') {
			break;
		}

		if (
			getNumberedLineWithRegex(regex, lineText) > 0 ||
			(isNested && editor.selection.start.line === lineNumber)
		) {
			lineText = lineText.substring(lineText.indexOf('.', 0) + 1, lineText.length).trim();
			newNumberedLines.push(indent + numberedListValue + '. ' + lineText);
		} else {
			newNumberedLines.push(lineText);
		}
	}
	return newNumberedLines;
}

/**
 * Update the nested list of numbers.
 * @param {vscode.TextEditor} editor - The document associated with this text editor.
 * @param {number} startLine - Numbered list start the index of the line.
 * @param {number} endLine - Numbered list end the index of the line.
 * @param {number} currentLineCode - The current line of the number/alphabet number of the char code.
 * @param {string} indent - Indent string.
 * @param {enum} listType - Numbered list of types.
 */

export function updateNestedNumberedList(
	editor: vscode.TextEditor,
	startLine: number,
	endLine: number,
	currentLineCode: number,
	indent: string,
	listType: ListType
) {
	const newNumberedLines = [];
	for (let lineNumber = startLine; lineNumber <= endLine; lineNumber++) {
		const lineText = editor.document.lineAt(lineNumber).text;
		if (lineText.trim() === '') {
			break;
		}
		const lineListType = getListTypeOfNumberedList(lineText);
		switch (listType) {
			case ListType.Numbered:
				if (lineListType === ListType.Numbered || lineListType === ListType.Alphabet) {
					newNumberedLines.push(
						indent + ++currentLineCode + '. ' + getTextOfNumberedList(lineText, lineListType)
					);
				} else {
					newNumberedLines.push(lineText);
					if (CountIndent(lineText) === indent.length) {
						currentLineCode = 0;
					}
				}
				break;
			case ListType.Alphabet:
				if (lineListType === ListType.Numbered || lineListType === ListType.Alphabet) {
					newNumberedLines.push(
						indent +
							String.fromCharCode(++currentLineCode) +
							'. ' +
							getTextOfNumberedList(lineText, lineListType)
					);
				} else {
					newNumberedLines.push(lineText);
					if (CountIndent(lineText) === indent.length) {
						currentLineCode = startAlphabet.charCodeAt(0) - 1;
					}
				}
				break;
			case ListType.Bulleted:
				newNumberedLines.push(indent + '- ' + getTextOfNumberedList(lineText, lineListType));
				break;
		}
	}
	return newNumberedLines;
}

export function getNumberTextOfNumberedList(text: string, listType: ListType) {
	switch (listType) {
		case ListType.Numbered:
		case ListType.Alphabet:
			text = text.substring(0, text.indexOf('.')).trim();
			break;
		case ListType.Bulleted:
			text = text.substring(0, text.indexOf('-')).trim();
			break;
	}
	return text;
}

export function getTextOfNumberedList(text: string, listType: ListType) {
	switch (listType) {
		case ListType.Numbered:
		case ListType.Alphabet:
			text = text.substring(text.indexOf('.') + 2);
			break;
		case ListType.Bulleted:
			text = text.substring(text.indexOf('-') + 2);
			break;
		case ListType.Other:
			text = text.substring(CountIndent(text));
			break;
	}
	return text;
}

export function getListTypeOfNumberedList(text: string) {
	let listType;
	if (numberedListRegex.test(text)) {
		listType = ListType.Numbered;
	} else if (alphabetListRegex.test(text)) {
		listType = ListType.Alphabet;
	} else if (bulletedListRegex.test(text)) {
		listType = ListType.Bulleted;
	} else {
		listType = ListType.Other;
	}
	return listType;
}

export function updateNestedAlphabetList(
	editor: vscode.TextEditor,
	startLine: number,
	endLine: number,
	currentAlphabet: number,
	indent: string
) {
	let lineNumber = startLine;
	const newAlphabetLines = [];

	// const numberRegex = new RegExp(numberedListWithIndentRegexTemplate.replace("{0}", indent.length.toString()));
	const alphabetRegex = new RegExp(
		alphabetListWithIndentRegexTemplate.replace('{0}', indent.length.toString())
	);

	for (; lineNumber <= endLine; lineNumber++) {
		let lineText = editor.document.lineAt(lineNumber).text;

		if (lineText.trim() === '') {
			break;
		}

		if (
			getAlphabetLineWithRegex(alphabetRegex, lineText) > 0 ||
			editor.selection.start.line === lineNumber
		) {
			lineText = lineText.substring(lineText.indexOf('.', 0) + 1, lineText.length).trim();
			newAlphabetLines.push(indent + String.fromCharCode(++currentAlphabet) + '. ' + lineText);
		} else {
			newAlphabetLines.push(lineText);
		}
	}
	return newAlphabetLines;
}

/**
 * Creates a new bulleted list from the current selection.
 * @param {vscode.TextEditor} editor - the current vscode active editor.
 */
export function createBulletedListFromText(editor: vscode.TextEditor) {
	const startSelected = editor.selection.start;
	const endSelected = editor.selection.end;
	const numberedListLines = [];
	const casetype = createNumberedListCaseType(editor, ListType.Bulleted);
	for (let line = startSelected.line; line <= endSelected.line; line++) {
		let lineText = editor.document.lineAt(line).text;
		if (lineText.trim() === '') {
			numberedListLines.push(lineText);
			continue;
		}
		const indentCount = CountIndent(lineText);
		const numberedListType = getListTypeOfNumberedList(lineText);
		lineText = getTextOfNumberedList(lineText, numberedListType);
		switch (casetype) {
			case CaseType.TextType:
				numberedListLines.push(lineText);
				break;
			case CaseType.UnIndentNestedType:
				numberedListLines.push('- ' + lineText);
				break;
			case CaseType.IndentType:
				if (indentCount === 0) {
					numberedListLines.push('- ' + lineText);
				} else {
					numberedListLines.push(tabPattern + '- ' + lineText);
				}
				break;
		}
	}
	/*     if (casetype === CaseType.TextType || casetype === CaseType.UnIndentNestedType) {
        } */

	const newSelection = new vscode.Selection(
		new vscode.Position(startSelected.line, 0),
		new vscode.Position(endSelected.line, numberedListLines[numberedListLines.length - 1].length)
	);
	const endLine = endSelected.line;
	const range = new vscode.Range(
		new vscode.Position(startSelected.line, 0),
		new vscode.Position(endLine, editor.document.lineAt(endLine).text.length)
	);
	common.insertContentToEditor(editor, numberedListLines.join('\n'), true, range);
	editor.selection = newSelection;
}

export function checkEmptyLine(editor: vscode.TextEditor) {
	const cursorPosition = editor.selection.active;
	const selectedLine = editor.document.lineAt(cursorPosition);
	return editor.selection.isEmpty && selectedLine.text.trim() === '';
}

export function checkEmptySelection(editor: vscode.TextEditor) {
	for (let i = editor.selection.start.line; i <= editor.selection.end.line; i++) {
		if (!editor.document.lineAt(i).isEmptyOrWhitespace) {
			return false;
		}
	}
	return true;
}

export function insertEmptyList(editor: vscode.TextEditor, list: string) {
	const cursorPosition = editor.selection.active;
	editor.edit(update => {
		update.insert(cursorPosition.with(cursorPosition.line, 0), list);
	});
}

export function isBulletedLine(text: string) {
	return text.trim() !== '' && (text.trim() === '-' || text.substring(0, 2) === '- ');
}

/**
 * Get the list line number.
 * @param {vscode.TextEditor} editor - The document associated with this text editor.
 * @param {number} line - A line number in [0, lineCount].
 * @param {enum} listType - Numbered list of types.
 * @param {number} start - The zero-based index number indicating the beginning of the substring.
 */
export function getListLineNumber(
	editor: vscode.TextEditor,
	line: number,
	listType: ListType,
	start?: number
) {
	if (line > -1 && line < editor.document.lineCount) {
		const text =
			start == null
				? editor.document.lineAt(line).text
				: editor.document.lineAt(line).text.substring(start);
		switch (listType) {
			case ListType.Numbered:
				return getNumberedLine(text);
			case ListType.Alphabet:
				return getAlphabetLine(text);
			case ListType.Bulleted:
				return getBulletedLine(text);
		}
	}
	return -1;
}

export function getNumberedLine(text: string) {
	const match = numberedListRegex.exec(text);
	if (match != null) {
		const numbered = match[0].split('.')[0];
		return +numbered;
	}
	return -1;
}

export function getNumberedLineWithRegex(regex: RegExp, text: string) {
	const match = regex.exec(text);
	if (match != null) {
		const numbered = match[0].split('.')[0];
		return +numbered;
	}
	return -1;
}

export function getAlphabetLine(text: string) {
	const match = alphabetListRegex.exec(text);
	if (match != null) {
		const alphabet = match[0].split('.')[0].trim();
		return alphabet.charCodeAt(0) < 'z'.charCodeAt(0) ? alphabet.charCodeAt(0) : -1;
	}
	return -1;
}

export function getAlphabetLineWithRegex(regex: RegExp, text: string) {
	const match = regex.exec(text);
	if (match != null) {
		const alphabet = match[0].split('.')[0].trim();
		return alphabet.charCodeAt(0) < 'z'.charCodeAt(0) ? alphabet.charCodeAt(0) : -1;
	}
	return -1;
}

export function getBulletedLine(text: string) {
	const match = bulletedListRegex.exec(text);
	if (match != null) {
		return '-'.charCodeAt(0);
	}
	return -1;
}

export function addIndent(line: string) {
	const stringTrim = line.trim();
	return line.substring(0, line.indexOf(stringTrim));
}

export function CountIndent(text: string) {
	for (let i = 0; i < text.length; i++) {
		if (text[i] !== ' ') {
			return i;
		}
	}
	return 0;
}

export function findCurrentNumberedListNextLine(editor: vscode.TextEditor, currentLine: number) {
	const nextLine = 0;

	if (currentLine >= editor.document.lineCount) {
		return nextLine;
	}

	const indentCount = CountIndent(editor.document.lineAt(currentLine).text);

	const regex = new RegExp(
		numberedListWithIndentRegexTemplate.replace('{0}', indentCount.toString())
	);

	while (
		++currentLine < editor.document.lineCount &&
		editor.document.lineAt(currentLine).text.trim() !== ''
	) {
		const number = getNumberedLineWithRegex(regex, editor.document.lineAt(currentLine).text);
		if (number > 0) {
			return currentLine;
		}
	}
	return nextLine;
}

export function findCurrentAlphabetListNextLine(editor: vscode.TextEditor, currentLine: number) {
	const nextLine = 0;

	if (currentLine >= editor.document.lineCount) {
		return nextLine;
	}

	const indentCount = CountIndent(editor.document.lineAt(currentLine).text);
	const regex = new RegExp(
		alphabetListWithIndentRegexTemplate.replace('{0}', indentCount.toString())
	);

	while (
		++currentLine < editor.document.lineCount &&
		editor.document.lineAt(currentLine).text.trim() !== ''
	) {
		const number = getAlphabetLineWithRegex(regex, editor.document.lineAt(currentLine).text);
		if (number > 0) {
			return currentLine;
		}
	}
	return nextLine;
}

export function findCurrentNumberedListLastLine(
	editor: vscode.TextEditor,
	currentLine: number,
	indentAdjust?: number
) {
	let lastLine = -1;

	if (currentLine >= editor.document.lineCount) {
		return lastLine;
	}

	let indentCount = CountIndent(editor.document.lineAt(currentLine).text);

	if (indentAdjust != null) {
		indentCount = indentCount - indentAdjust;
	}

	while (
		++currentLine < editor.document.lineCount &&
		editor.document.lineAt(currentLine).text.trim() !== ''
	) {
		const regex = new RegExp(
			numberedListWithIndentRegexTemplate.replace('{0}', indentCount.toString())
		);
		const number = getNumberedLineWithRegex(regex, editor.document.lineAt(currentLine).text);
		if (number > 0) {
			lastLine = currentLine;
		}
	}
	return lastLine;
}

export function findCurrentAlphabetListLastLine(editor: vscode.TextEditor, currentLine: number) {
	if (currentLine >= editor.document.lineCount) {
		return editor.document.lineCount - 1;
	}

	const indentCount = CountIndent(editor.document.lineAt(currentLine).text);

	while (
		currentLine < editor.document.lineCount &&
		editor.document.lineAt(currentLine).text.trim() !== ''
	) {
		const regex = new RegExp(
			alphabetListWithIndentRegexTemplate.replace('{0}', indentCount.toString())
		);
		if (
			getAlphabetLineWithRegex(regex, editor.document.lineAt(currentLine).text) > 0 ||
			editor.selection.start.line === currentLine
		) {
			currentLine++;
		} else {
			break;
		}
	}
	return currentLine - 1;
}

// Find the previous number in current indent
export function findCurrentNumberedListPreviousNumber(
	editor: vscode.TextEditor,
	currentLine: number,
	indentAdjust?: number
) {
	let previousListNumbered = 0;

	if (currentLine >= editor.document.lineCount) {
		return previousListNumbered;
	}

	let indentCount = CountIndent(editor.document.lineAt(currentLine).text);

	if (indentAdjust != null) {
		indentCount = indentCount - indentAdjust;
	}

	const regex = new RegExp(
		numberedListWithIndentRegexTemplate.replace('{0}', indentCount.toString())
	);

	while (--currentLine >= 0 && editor.document.lineAt(currentLine).text.trim() !== '') {
		previousListNumbered = getNumberedLineWithRegex(
			regex,
			editor.document.lineAt(currentLine).text
		);
		previousListNumbered = previousListNumbered !== -1 ? previousListNumbered : 0;

		if (previousListNumbered > 0) {
			return previousListNumbered;
		}
	}

	return previousListNumbered;
}

export function autolistAlpha(
	editor: vscode.TextEditor,
	cursorPosition: vscode.Position,
	alphabet: number
) {
	// Check numbered block
	const lineNumber = cursorPosition.line;
	const firstLine = editor.document
		.lineAt(lineNumber)
		.text.substring(cursorPosition.character, editor.document.lineAt(lineNumber).text.length);
	const indentCount = CountIndent(editor.document.lineAt(lineNumber).text);
	const indent = ' '.repeat(indentCount);
	let alphabetLines = [];

	// Add a new line
	alphabetLines.push('\n' + indent + numberedListValue + '. ' + firstLine);
	const listObjectModel = createListObjectModel(editor);
	const endInnerListedLine =
		listObjectModel.nextNested != null && indentCount > 0
			? listObjectModel.nextNested.line
			: lineNumber;
	const previousOuterNumbered =
		listObjectModel.previousOuter != null ? listObjectModel.previousOuter.listNumber : 0;
	const updatedInnerListed = updateOrderedNumberedList(
		editor,
		lineNumber + 1,
		endInnerListedLine,
		alphabet,
		indentCount,
		ListType.Alphabet
	);
	const updatedOuterListed = updateOrderedNumberedList(
		editor,
		endInnerListedLine + 1,
		editor.document.lineCount - 1,
		previousOuterNumbered,
		0,
		ListType.Numbered
	);
	alphabetLines = alphabetLines.concat(updatedInnerListed).concat(updatedOuterListed);
	const endLine = lineNumber + updatedInnerListed.length + updatedOuterListed.length;

	// Replace editer's text and range assignment
	const range: vscode.Range = new vscode.Range(
		lineNumber,
		cursorPosition.character,
		endLine,
		editor.document.lineAt(endLine).text.length
	);
	const replacementText = alphabetLines.join('\n');
	common.insertContentToEditor(editor, replacementText, true, range);

	// set cursor position
	common.setCursorPosition(
		editor,
		lineNumber + 1,
		String.fromCharCode(alphabet).toString().length + indentCount + 2
	);
}

export function autolistNumbered(
	editor: vscode.TextEditor,
	cursorPosition: vscode.Position,
	numbered: number
) {
	// Check numbered block
	const lineNumber = cursorPosition.line;
	const firstLine = editor.document
		.lineAt(cursorPosition.line)
		.text.substring(
			cursorPosition.character,
			editor.document.lineAt(cursorPosition.line).text.length
		);
	const indentCount = CountIndent(editor.document.lineAt(cursorPosition.line).text);
	const indent = ' '.repeat(indentCount);
	let numberedLines = [];

	// Add a new line
	numberedLines.push('\n' + indent + numberedListValue + '. ' + firstLine);
	const listObjectModel = createListObjectModel(editor);
	const endInnerListedLine =
		listObjectModel.nextNested != null && indentCount > 0
			? listObjectModel.nextNested.line
			: lineNumber;
	let previousOuterNumbered = 0;
	if (indentCount === 0) {
		previousOuterNumbered = numbered;
	} else if (listObjectModel.previousOuter != null) {
		previousOuterNumbered = listObjectModel.previousOuter.listNumber;
	}

	const updatedInnerListed = updateOrderedNumberedList(
		editor,
		lineNumber + 1,
		endInnerListedLine,
		numbered,
		indentCount,
		ListType.Numbered
	);
	const updatedOuterListed = updateOrderedNumberedList(
		editor,
		endInnerListedLine + 1,
		editor.document.lineCount - 1,
		previousOuterNumbered,
		0,
		ListType.Numbered
	);
	numberedLines = numberedLines.concat(updatedInnerListed).concat(updatedOuterListed);
	const endLine = lineNumber + updatedInnerListed.length + updatedOuterListed.length;
	const range: vscode.Range = new vscode.Range(
		cursorPosition.line,
		cursorPosition.character,
		endLine,
		editor.document.lineAt(endLine).text.length
	);
	common.insertContentToEditor(editor, numberedLines.join('\n'), true, range);

	// set cursor position
	common.setCursorPosition(
		editor,
		cursorPosition.line + 1,
		numbered.toString().length + indentCount + 2
	);
}

export function nestedNumberedList(
	editor: vscode.TextEditor,
	cursorPosition: vscode.Position,
	indentCount: number
) {
	const previousLine = cursorPosition.line - 1;
	const nextLine = cursorPosition.line + 1;
	const previousInnerNumbered = getListLineNumber(
		editor,
		previousLine,
		ListType.Numbered,
		cursorPosition.character
	);
	const previousaphabet = getListLineNumber(
		editor,
		previousLine,
		ListType.Alphabet,
		cursorPosition.character
	);
	const nextnumbered = getListLineNumber(
		editor,
		nextLine,
		ListType.Numbered,
		cursorPosition.character
	);
	const nextalphabet = getListLineNumber(
		editor,
		nextLine,
		ListType.Alphabet,
		cursorPosition.character
	);
	const newIndentCount = CountIndent(tabPattern + editor.document.lineAt(cursorPosition.line).text);
	let cursorIndex = (tabPattern + tabPattern.repeat(indentCount) + startAlphabet + '. ').length;

	// When have next/previous inner number list
	if (previousInnerNumbered > 0 || (previousaphabet <= 0 && nextnumbered > 0)) {
		const listObjectModel = createListObjectModel(editor);
		const previousOuterNumbered =
			listObjectModel.previousOuter != null ? listObjectModel.previousOuter.listNumber : 0;
		const numbered = previousInnerNumbered > 0 ? previousInnerNumbered : 0;
		const endInnerListedLine =
			listObjectModel.nextNested != null ? listObjectModel.nextNested.line : cursorPosition.line;
		const endOuterListedLine =
			listObjectModel.nextOuter != null ? listObjectModel.nextOuter.line : endInnerListedLine;

		// Update inner numbered list
		const updatedInnerListed = updateNestedNumberedList(
			editor,
			cursorPosition.line,
			endInnerListedLine,
			numbered,
			tabPattern.repeat(newIndentCount / 4),
			ListType.Numbered
		);
		const updatedOuterListed = updateOrderedNumberedList(
			editor,
			endInnerListedLine + 1,
			endOuterListedLine,
			previousOuterNumbered,
			indentCount,
			ListType.Numbered
		);
		const updatedListedText =
			updatedInnerListed.concat(updatedOuterListed).length > 0
				? updatedInnerListed.concat(updatedOuterListed).join('\n')
				: '';
		const range: vscode.Range = new vscode.Range(
			cursorPosition.line,
			0,
			endOuterListedLine,
			editor.document.lineAt(endOuterListedLine).text.length
		);
		common.insertContentToEditor(editor, updatedListedText, true, range);
		cursorIndex =
			updatedInnerListed.length > 0 ? updatedInnerListed[0].indexOf('. ') + 2 : cursorIndex;
	} else if (previousaphabet > 0 || nextalphabet > 0) {
		const listObjectModel = createListObjectModel(editor);
		const previousOuterNumbered =
			listObjectModel.previousOuter != null ? listObjectModel.previousOuter.listNumber : 0;
		const alphabet = previousaphabet > 0 ? previousaphabet : startAlphabet.charCodeAt(0) - 1;
		const endInnerListedLine =
			listObjectModel.nextNested != null ? listObjectModel.nextNested.line : cursorPosition.line;
		const endOuterListedLine =
			listObjectModel.nextOuter != null ? listObjectModel.nextOuter.line : endInnerListedLine;

		// Update inner alphabet list
		const updatedInnerListed = updateNestedNumberedList(
			editor,
			cursorPosition.line,
			endInnerListedLine,
			alphabet,
			tabPattern.repeat(newIndentCount / 4),
			ListType.Alphabet
		);
		const updatedOuterListed = updateOrderedNumberedList(
			editor,
			endInnerListedLine + 1,
			endOuterListedLine,
			previousOuterNumbered,
			indentCount,
			ListType.Numbered
		);
		const updatedListedText =
			updatedInnerListed.concat(updatedOuterListed).length > 0
				? updatedInnerListed.concat(updatedOuterListed).join('\n')
				: '';
		const range: vscode.Range = new vscode.Range(
			cursorPosition.line,
			0,
			endOuterListedLine,
			editor.document.lineAt(endOuterListedLine).text.length
		);
		common.insertContentToEditor(editor, updatedListedText, true, range);
	} else {
		const lineText = editor.document.lineAt(cursorPosition.line).text;
		const lineCount = CountIndent(lineText);
		const listObjectModel = createListObjectModel(editor);
		let previousOuterNumbered =
			listObjectModel.previousOuter != null ? listObjectModel.previousOuter.listNumber : 0;
		let previousOuterListType = ListType.Numbered;
		let previousNestedNumbered =
			listObjectModel.previousNested != null
				? listObjectModel.previousNested.listNumber
				: startAlphabet.charCodeAt(0) - 1;
		let previousNestedListType =
			listObjectModel.previousNested != null
				? listObjectModel.previousNested.listType
				: ListType.Alphabet;
		let endInnerListedLine =
			listObjectModel.nextNested != null ? listObjectModel.nextNested.line : cursorPosition.line;
		let endOuterListedLine =
			listObjectModel.nextOuter != null ? listObjectModel.nextOuter.line : endInnerListedLine;
		let numberedListLines = [];
		const lineTextListType = getListTypeOfNumberedList(lineText);

		// const lineTextListNumbered = getNumberTextOfNumberedList(lineText, lineTextListType);
		switch (lineTextListType) {
			case ListType.Numbered:
			case ListType.Alphabet:
				let newNumber = numberedListValue;
				if (lineCount === 0) {
					newNumber = numberedListValue;
				}
				let newLineText =
					' '.repeat(newIndentCount) +
					newNumber +
					'. ' +
					getTextOfNumberedList(lineText, lineTextListType);
				numberedListLines.push(newLineText);
				break;
			case ListType.Bulleted:
			case ListType.Other:
				newLineText =
					' '.repeat(newIndentCount) +
					getNumberTextOfNumberedList(lineText, lineTextListType) +
					getTextOfNumberedList(lineText, lineTextListType);
				if (lineCount === 0) {
					previousNestedNumbered = startAlphabet.charCodeAt(0) - 1;
					previousNestedListType = ListType.Alphabet;
				}
				break;
		}
		if (lineCount > 0) {
			endOuterListedLine = endInnerListedLine;
			previousOuterNumbered = previousNestedNumbered;
			previousOuterListType = previousNestedListType;
			endInnerListedLine = cursorPosition.line;
			previousNestedNumbered = startAlphabet.charCodeAt(0) - 1;
			previousNestedListType = ListType.Alphabet;
		}

		const updatedInnerListed = updateNestedNumberedList(
			editor,
			cursorPosition.line + 1,
			endInnerListedLine,
			previousNestedNumbered,
			tabPattern.repeat(newIndentCount / 4),
			previousNestedListType
		);
		const updatedOuterListed = updateOrderedNumberedList(
			editor,
			endInnerListedLine + 1,
			endOuterListedLine,
			previousOuterNumbered,
			indentCount,
			previousOuterListType
		);
		numberedListLines = numberedListLines.concat(updatedInnerListed.concat(updatedOuterListed));
		cursorIndex = cursorPosition.character + numberedListLines[0].length - lineText.length;
		const range: vscode.Range = new vscode.Range(
			cursorPosition.line,
			0,
			endOuterListedLine,
			editor.document.lineAt(endOuterListedLine).text.length
		);
		common.insertContentToEditor(editor, numberedListLines.join('\n'), true, range);
	}
	// set cursor position
	common.setCursorPosition(editor, cursorPosition.line, cursorIndex > 0 ? cursorIndex : 0);
}

export function removeNestedListSingleLine(editor: vscode.TextEditor) {
	const cursorPosition = editor.selection.active;
	const startSelected = editor.selection.start;
	const endSelected = editor.selection.end;
	const text = editor.document.getText(
		new vscode.Range(
			cursorPosition.with(cursorPosition.line, 0),
			cursorPosition.with(cursorPosition.line, endSelected.character)
		)
	);
	const indentCount = CountIndent(editor.document.lineAt(cursorPosition.line).text);
	const numberedRegex = new RegExp(
		fixedNumberedListWithIndentRegexTemplate.replace('{0}', indentCount.toString())
	);
	const alphabetRegex = new RegExp(
		fixedAlphabetListWithIndentRegexTemplate.replace('{0}', indentCount.toString())
	);

	// If it contain number or bullet list
	if (fixedBulletedListRegex.exec(text) != null) {
		if (indentCount >= 4) {
			editor.edit(update => {
				update.delete(
					new vscode.Range(
						cursorPosition.with(cursorPosition.line, 0),
						cursorPosition.with(cursorPosition.line, 4)
					)
				);
			});
		} else if (indentCount < 4) {
			editor.edit(update => {
				update.delete(
					new vscode.Range(
						cursorPosition.with(cursorPosition.line, 0),
						cursorPosition.with(cursorPosition.line, endSelected.character)
					)
				);
			});
		}
	} else if (getNumberedLineWithRegex(numberedRegex, text) > 0) {
		if (indentCount >= 4) {
			const listObjectModel = createListObjectModel(editor);
			const previousOuterNumbered =
				listObjectModel.previousOuter != null ? listObjectModel.previousOuter.listNumber : 0;
			let previousNestedNumbered = startAlphabet.charCodeAt(0) - 1;
			let previousNestedListType = ListType.Alphabet;
			if (cursorPosition.line < editor.document.lineCount - 1) {
				const nextLineText = editor.document.lineAt(cursorPosition.line + 1).text;
				const nextListType = getListTypeOfNumberedList(nextLineText);
				if (CountIndent(nextLineText) === tabPattern.length && nextListType === ListType.Numbered) {
					previousNestedListType = ListType.Numbered;
					previousNestedNumbered = 0;
				}
			}

			const endInnerListedLine =
				listObjectModel.nextNested != null ? listObjectModel.nextNested.line : cursorPosition.line;
			const endOuterListedLine =
				listObjectModel.nextOuter != null ? listObjectModel.nextOuter.line : endInnerListedLine;
			const updatedListed = updateNumberedList(
				editor,
				cursorPosition.line,
				cursorPosition.line,
				previousOuterNumbered,
				tabPattern.repeat(indentCount / 4 - 1),
				true
			);
			const updatedInnerListed = updateNestedNumberedList(
				editor,
				cursorPosition.line + 1,
				endInnerListedLine,
				previousNestedNumbered,
				tabPattern.repeat(indentCount / 4),
				previousNestedListType
			);
			const updatedOuterListed = updateOrderedNumberedList(
				editor,
				endInnerListedLine + 1,
				endOuterListedLine,
				previousOuterNumbered,
				indentCount - tabPattern.length,
				ListType.Numbered
			);
			const updatedListedText =
				updatedListed.concat(updatedInnerListed).concat(updatedOuterListed).length > 0
					? updatedListed.concat(updatedInnerListed).concat(updatedOuterListed).join('\n')
					: '';
			editor.edit(update => {
				update.replace(
					new vscode.Range(
						cursorPosition.line,
						0,
						endOuterListedLine,
						editor.document.lineAt(endOuterListedLine).text.length
					),
					updatedListedText
				);
			});
			const cursorIndex =
				updatedListed.length > 0
					? updatedListed[0].indexOf('. ') + 2
					: cursorPosition.character - indentCount;
			common.setCursorPosition(editor, cursorPosition.line, cursorIndex);
		} else if (indentCount < 4) {
			let lineText = editor.document.lineAt(cursorPosition.line).text;
			lineText = lineText.substring(lineText.indexOf('.', 0) + 1, lineText.length).trim();
			let newNumberedLines = [lineText];
			const updatedOuterListed = updateOrderedNumberedList(
				editor,
				cursorPosition.line + 1,
				editor.document.lineCount - 1,
				0,
				0,
				ListType.Numbered
			);
			newNumberedLines = newNumberedLines.concat(updatedOuterListed);
			const endLine = cursorPosition.line + updatedOuterListed.length;
			const range: vscode.Range = new vscode.Range(
				cursorPosition.line,
				0,
				endLine,
				editor.document.lineAt(endLine).text.length
			);
			common.insertContentToEditor(editor, newNumberedLines.join('\n'), true, range);
			common.setSelectorPosition(editor, cursorPosition.line, 0, cursorPosition.line, 0);
		}
	} else if (getAlphabetLineWithRegex(alphabetRegex, text) > 0) {
		if (indentCount >= 4) {
			const listObjectModel = createListObjectModel(editor);
			let lineText = editor.document.lineAt(cursorPosition.line).text;
			lineText = lineText.substring(lineText.indexOf('.', 0) + 1, lineText.length).trim();
			const previousOuterNumbered =
				listObjectModel.previousOuter != null ? listObjectModel.previousOuter.listNumber : 0;
			const endInnerListedLine =
				listObjectModel.nextNested != null ? listObjectModel.nextNested.line : cursorPosition.line;
			const endOuterListedLine =
				listObjectModel.nextOuter != null ? listObjectModel.nextOuter.line : endInnerListedLine;
			const updatedListed = updateNumberedList(
				editor,
				cursorPosition.line,
				cursorPosition.line,
				previousOuterNumbered,
				tabPattern.repeat(indentCount / 4 - 1),
				true
			);
			const updatedInnerListed = updateNestedNumberedList(
				editor,
				cursorPosition.line + 1,
				endInnerListedLine,
				startAlphabet.charCodeAt(0) - 1,
				tabPattern.repeat(indentCount / 4),
				ListType.Alphabet
			);
			const updatedOuterListed = updateOrderedNumberedList(
				editor,
				endInnerListedLine + 1,
				endOuterListedLine,
				previousOuterNumbered,
				indentCount - 4,
				ListType.Numbered
			);
			const updatedListedText =
				updatedListed.concat(updatedInnerListed).concat(updatedOuterListed).length > 0
					? updatedListed.concat(updatedInnerListed).concat(updatedOuterListed).join('\n')
					: '';
			editor.edit(update => {
				update.replace(
					new vscode.Range(
						cursorPosition.line,
						0,
						endOuterListedLine,
						editor.document.lineAt(endOuterListedLine).text.length
					),
					updatedListedText
				);
			});

			const cursorIndex =
				updatedListed.length > 0
					? updatedListed[0].indexOf('. ') + 2
					: cursorPosition.character - indentCount;
			common.setCursorPosition(editor, cursorPosition.line, cursorIndex);
		} else if (indentCount < 4) {
			editor.edit(update => {
				update.delete(
					new vscode.Range(
						cursorPosition.with(cursorPosition.line, 0),
						cursorPosition.with(cursorPosition.line, endSelected.character)
					)
				);
			});
		}
	} else {
		// If selected text > 0
		if (Math.abs(endSelected.character - startSelected.character) > 0) {
			removeNestedListMultipleLine(editor);
		} else if (startSelected.character !== 0) {
			editor.edit(update => {
				update.delete(
					new vscode.Range(
						cursorPosition.with(cursorPosition.line, startSelected.character - 1),
						cursorPosition.with(cursorPosition.line, startSelected.character)
					)
				);
			});
		} else if (startSelected.character === 0) {
			if (startSelected.line !== 0) {
				const lineText = editor.document.lineAt(startSelected.line - 1).text;

				// Replace editor's text
				editor.edit(update => {
					update.replace(
						new vscode.Range(startSelected.line - 1, 0, endSelected.line, 0),
						lineText
					);
				});
			}
		}
	}
}

export function removeNestedListMultipleLine(editor: vscode.TextEditor) {
	const startSelected = editor.selection.start;
	const endSelected = editor.selection.end;
	const numberedListLines = [];
	const startLineNotSelectedText = editor.document
		.lineAt(startSelected.line)
		.text.substring(0, startSelected.character);
	const endLineNotSelectedText = editor.document
		.lineAt(endSelected.line)
		.text.substring(endSelected.character);
	if (startLineNotSelectedText.trim().length > 0 || endLineNotSelectedText.trim().length > 0) {
		numberedListLines.push(endLineNotSelectedText);
	}
	const endLine = endSelected.line;
	const range = new vscode.Range(
		startSelected.line,
		startSelected.character,
		endLine,
		editor.document.lineAt(endLine).text.length
	);
	common.insertContentToEditor(editor, numberedListLines.join('\n'), true, range);
	common.setCursorPosition(editor, startSelected.line, startSelected.character);
}

export function createListObjectModel(editor: vscode.TextEditor) {
	const startPosition = editor.selection.start;
	const endPosition = editor.selection.end;
	let startLine = startPosition.line;
	const listObjectModel = new ListObjectModel();
	let flag = true;
	while (--startLine >= 0) {
		const lineText = editor.document.lineAt(startLine).text;
		const indentCount = CountIndent(lineText);
		const listType = getListTypeOfNumberedList(lineText);
		if (lineText.trim() === '') {
			break;
		}
		if (indentCount === 0) {
			if (listType === ListType.Numbered) {
				listObjectModel.previousOuter = createLineObjectModel(editor, startLine);
			}
			break;
		}
		if (flag && indentCount === tabPattern.length) {
			if (listType === ListType.Numbered || listType === ListType.Alphabet) {
				listObjectModel.previousNested = createLineObjectModel(editor, startLine);
			}
			flag = false;
		}
	}
	let endLine = endPosition.line;
	flag = true;
	while (++endLine < editor.document.lineCount) {
		const lineText = editor.document.lineAt(endLine).text;
		const indentCount = CountIndent(lineText);
		if (lineText.trim() === '') {
			listObjectModel.nextOuter = createLineObjectModel(editor, endLine - 1);

			if (
				flag &&
				listObjectModel.nextNested == null &&
				CountIndent(editor.document.lineAt(endLine - 1).text) > 0
			) {
				listObjectModel.nextNested = createLineObjectModel(editor, endLine - 1);
			}
			break;
		} else if (endLine === editor.document.lineCount - 1) {
			listObjectModel.nextOuter = createLineObjectModel(editor, endLine);
			if (flag && listObjectModel.nextNested == null && indentCount > 0) {
				listObjectModel.nextNested = createLineObjectModel(editor, endLine);
			}
		} else if (flag && indentCount === 0) {
			if (CountIndent(editor.document.lineAt(endLine - 1).text) > 0) {
				listObjectModel.nextNested = createLineObjectModel(editor, endLine - 1);
			}
			flag = false;
		}
	}
	return listObjectModel;
}

export function createLineObjectModel(editor: vscode.TextEditor, line: number) {
	if (line < 0 || line >= editor.document.lineCount) {
		return null;
	}
	const lineText = editor.document.lineAt(line).text;
	const indent = ' '.repeat(CountIndent(lineText));
	const listType = getListTypeOfNumberedList(lineText);
	const listNumber =
		listType === ListType.Numbered
			? +getNumberTextOfNumberedList(lineText, listType)
			: getNumberTextOfNumberedList(lineText, listType).charCodeAt(0);
	const listText = getTextOfNumberedList(lineText, listType);
	return new LineObjectModel(line, indent, listType, listNumber, listText);
}

export function createNumberedListCaseType(editor: vscode.TextEditor, listType: ListType) {
	const startSelectedLine = editor.selection.start.line;
	const endSelectedLine = editor.selection.end.line;
	let isUnIndentNestedType = true;
	let isTextType = true;
	for (let line = startSelectedLine; line <= endSelectedLine; line++) {
		const lineText = editor.document.lineAt(line).text;
		if (lineText.trim() === '') {
			continue;
		}
		const lineCount = CountIndent(lineText);
		const lineListType = getListTypeOfNumberedList(lineText);
		switch (listType) {
			case ListType.Bulleted:
				if (lineCount > 0 || lineListType !== ListType.Bulleted) {
					isTextType = false;

					if (
						(lineCount === 0 && lineListType !== ListType.Bulleted) ||
						lineCount !== tabPattern.length ||
						lineListType !== ListType.Bulleted
					) {
						isUnIndentNestedType = false;
						line = endSelectedLine + 1;
					}
				}
				break;
			case ListType.Numbered:
				if (lineCount > 0 || lineListType !== ListType.Numbered) {
					isTextType = false;

					if (
						(lineCount === 0 && lineListType !== ListType.Numbered) ||
						lineCount !== tabPattern.length ||
						(lineListType !== ListType.Numbered && lineListType !== ListType.Alphabet)
					) {
						isUnIndentNestedType = false;
						line = endSelectedLine + 1;
					}
				}
				break;
		}
	}
	let caseType = CaseType.IndentType;
	if (isTextType) {
		caseType = CaseType.TextType;
	} else if (isUnIndentNestedType) {
		caseType = CaseType.UnIndentNestedType;
	}
	return caseType;
}

export enum CaseType {
	IndentType,
	UnIndentNestedType,
	TextType
}
