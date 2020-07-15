/* eslint-disable @typescript-eslint/no-non-null-assertion */
'use-strict';

import * as glob from 'glob';
import * as os from 'os';
import * as vscode from 'vscode';

import { existsSync } from 'fs';
import { extname, join, resolve } from 'path';
import { output } from './output';

export const ignoreFiles = ['.git', '.github', '.vscode', '.vs', 'node_module'];

export function tryFindFile(rootPath: string, fileName: string) {
	try {
		const fullPath = resolve(rootPath, fileName);
		const exists = existsSync(fullPath);
		if (exists) {
			return fullPath;
		} else {
			const files = glob.sync(`**/${fileName}`, {
				cwd: rootPath
			});

			if (files && files.length === 1) {
				return join(rootPath, files[0]);
			}
		}
	} catch (error) {
		postError(error.toString());
	}

	postWarning(`Unable to find a file named "${fileName}", recursively at root "${rootPath}".`);
	return undefined;
}

/**
 * Provide current os platform
 */
export function getOSPlatform(this: any) {
	if (this.osPlatform == null) {
		this.osPlatform = os.platform();
		this.osPlatform = this.osPlatform;
	}
	return this.osPlatform;
}

/**
 * Create a posted warning message and applies the message to the log
 * @param {string} message - the message to post to the editor as an warning.
 */
export function postWarning(message: string) {
	vscode.window.showWarningMessage(message);
}

/**
 * Create a posted information message and applies the message to the log
 * @param {string} message - the message to post to the editor as an information.
 */
export function postInformation(message: string) {
	vscode.window.showInformationMessage(message);
}

/**
 * Create a posted information message and applies the message to the log
 * @param {string} message - the message to post to the editor as an information.
 */
export function postError(message: string) {
	vscode.window.showErrorMessage(message);
}

/**
 * Checks that there is a document open, and the document has selected text.
 * Displays warning to users if error is caught.
 * @param {vscode.TextEditor} editor - the activeTextEditor in the vscode window
 * @param {boolean} testSelection - test to see if the selection includes text in addition to testing a editor is open.
 * @param {string} senderName - the name of the command running the test.
 */
export function isValidEditor(
	editor: vscode.TextEditor,
	testSelection: boolean,
	senderName: string
) {
	if (editor === undefined) {
		output.appendLine('Please open a document to apply ' + senderName + ' to.');
		return false;
	}

	if (testSelection && editor.selection.isEmpty) {
		if (
			senderName === 'format bold' ||
			senderName === 'format italic' ||
			senderName === 'format code'
		) {
			output.appendLine(
				'VS Code active editor has valid configuration to apply ' + senderName + ' to.'
			);
			return true;
		}
		output.appendLine('No text selected, cannot apply ' + senderName + '.');
		return false;
	}

	output.appendLine(
		'VS Code active editor has valid configuration to apply ' + senderName + ' to.'
	);
	return true;
}

export function noActiveEditorMessage() {
	postWarning('No active editor. Abandoning command.');
}

export function unsupportedFileMessage(languageId: string) {
	postWarning(`Command is not support for "${languageId}". Abandoning command.`);
}

export function hasValidWorkSpaceRootPath(senderName: string) {
	let folderPath: string = '';

	if (folderPath == null) {
		postWarning(
			'The ' +
				senderName +
				' command requires an active workspace. Please open VS Code from the root of your clone to continue.'
		);
		return false;
	}

	if (vscode.workspace.workspaceFolders) {
		folderPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
	}

	return true;
}

/**
 * Inserts or Replaces text at the current selection in the editor.
 * If overwrite is set the content will replace current selection.
 * @param {vscode.TextEditor} editor - the active editor in vs code.
 * @param {string} senderName - the name of the function that is calling this function
 * which is used to provide traceability in logging.
 * @param {string} string - the content to insert.
 * @param {boolean} overwrite - if true replaces current selection.
 * @param {vscode.Range} selection - if null uses the current selection for the insert or update.
 * If provided will insert or update at the given range.
 */

export async function insertContentToEditor(
	editor: vscode.TextEditor,
	content: string,
	overwrite: boolean = false,
	selection: vscode.Range = null!
) {
	if (selection == null) {
		selection = editor.selection;
	}

	try {
		if (overwrite) {
			await editor.edit(update => {
				update.replace(selection, content);
			});
		} else {
			// Gets the cursor position
			const position = editor.selection.active;

			await editor.edit(selected => {
				selected.insert(position, content);
			});
		}
	} catch (error) {
		output.appendLine('Could not write content to active editor window: ' + error);
	}
}

/**
 * Set the cursor to a new position, based on X and Y coordinates.
 * @param {vscode.TextEditor} editor -
 * @param {number} line -
 * @param {number} character -
 */
export function setCursorPosition(editor: vscode.TextEditor, line: number, character: number) {
	const cursorPosition = editor.selection.active;
	const newPosition = cursorPosition.with(line, character);
	const newSelection = new vscode.Selection(newPosition, newPosition);
	editor.selection = newSelection;
}

export function setSelectorPosition(
	editor: vscode.TextEditor,
	fromLine: number,
	fromCharacter: number,
	toLine: number,
	toCharacter: number
) {
	const cursorPosition = editor.selection.active;
	const fromPosition = cursorPosition.with(fromLine, fromCharacter);
	const toPosition = cursorPosition.with(toLine, toCharacter);
	const newSelection = new vscode.Selection(fromPosition, toPosition);
	editor.selection = newSelection;
}

/**
 *  Function does trim from the right on the the string. It removes specified characters.
 *  @param {string} str - string to trim.
 *  @param {string} chr - searched characters to trim.
 */
export function rtrim(str: string, chr: string) {
	const rgxtrim = !chr ? new RegExp('\\s+$') : new RegExp(chr + '+$');
	return str.replace(rgxtrim, '');
}

/**
 * Checks to see if the active file is markdown.
 * Commands should only run on markdown files.
 * @param {vscode.TextEditor} editor - the active editor in vs code.
 */
export function isMarkdownFileCheck(editor: vscode.TextEditor, languageId: boolean) {
	if (editor.document.languageId !== 'markdown') {
		if (editor.document.languageId !== 'yaml') {
			postInformation('The docs-markdown extension only works on Markdown files.');
		}
		return false;
	} else {
		return true;
	}
}

export function isMarkdownFileCheckWithoutNotification(editor: vscode.TextEditor) {
	if (editor.document.languageId !== 'markdown') {
		return false;
	} else {
		return true;
	}
}

export function isValidFileCheck(editor: vscode.TextEditor, languageIds: string[]) {
	return languageIds.some(id => editor.document.languageId === id);
}

/**
 * Telemetry or Trace Log Type
 */
export enum LogType {
	Telemetry,
	Trace
}

/**
 * Create timestamp
 */
export function generateTimestamp() {
	const date = new Date(Date.now());
	return {
		msDateValue: date.toLocaleDateString('en-us'),
		msTimeValue: date.toLocaleTimeString([], { hour12: false })
	};
}

/**
 * Check for active extensions
 */
export function checkExtension(extensionName: string, notInstalledMessage?: string) {
	const extensionValue = vscode.extensions.getExtension(extensionName);
	if (!extensionValue) {
		if (notInstalledMessage) {
			output.appendLine(notInstalledMessage);
		}
		return false;
	}
	return extensionValue.isActive;
}

/**
 * Output message with timestamp
 * @param message
 */
export function showStatusMessage(message: string) {
	const { msTimeValue } = generateTimestamp();
	output.appendLine(`[${msTimeValue}] - ${message}`);
}

export function detectFileExtension(filePath: string) {
	const fileExtension = extname(filePath);
	return fileExtension;
}

/**
 * Create a posted error message and applies the message to the log
 * @param {string} message - the message to post to the editor as an error.
 */
export async function showWarningMessage(message: string) {
	vscode.window.showWarningMessage(message);
}

export function matchAll(pattern: RegExp, text: string): RegExpMatchArray[] {
	const out: RegExpMatchArray[] = [];
	pattern.lastIndex = 0;
	let match: RegExpMatchArray | null = pattern.exec(text);
	while (match) {
		if (match) {
			// This is necessary to avoid infinite loops with zero-width matches
			if (match.index === pattern.lastIndex) {
				pattern.lastIndex++;
			}

			out.push(match);
		}

		match = pattern.exec(text);
	}
	return out;
}

export function extractDocumentLink(
	document: vscode.TextDocument,
	link: string,
	matchIndex: number | undefined
): vscode.DocumentLink | undefined {
	const offset = (matchIndex || 0) + 8;
	const linkStart = document.positionAt(offset);
	const linkEnd = document.positionAt(offset + link.length);
	const text = document.getText(new vscode.Range(linkStart, linkEnd));
	try {
		const httpMatch = text.match(/^(http|https):\/\//);
		if (httpMatch) {
			const documentLink = new vscode.DocumentLink(
				new vscode.Range(linkStart, linkEnd),
				vscode.Uri.parse(link)
			);
			return documentLink;
		} else {
			const filePath = document.fileName.split('\\').slice(0, -1).join('\\');

			const documentLink = new vscode.DocumentLink(
				new vscode.Range(linkStart, linkEnd),
				vscode.Uri.file(resolve(filePath, link))
			);
			return documentLink;
		}
	} catch (e) {
		return undefined;
	}
}

export const naturalLanguageCompare = (a: string, b: string) => {
	return !!a && !!b ? a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }) : 0;
};

export function escapeRegExp(content: string) {
	return content.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

export function splice(insertAsPosition: number, content: string, insertStr: string) {
	return content.slice(0, insertAsPosition) + insertStr + content.slice(insertAsPosition);
}

export function toShortDate(date: Date) {
	const year = date.getFullYear();
	const month = (1 + date.getMonth()).toString();
	const monthStr = month.length > 1 ? month : `0${month}`;
	const day = date.getDate().toString();
	const dayStr = day.length > 1 ? day : `0${day}`;

	return `${monthStr}/${dayStr}/${year}`;
}
