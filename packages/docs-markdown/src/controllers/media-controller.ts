/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

import { existsSync } from 'graceful-fs';
import * as recursive from 'recursive-readdir';
import * as vscode from 'vscode';
import { QuickPickItem, QuickPickOptions, window } from 'vscode';
import { insertBookmarkExternal, insertBookmarkInternal } from '../controllers/bookmark-controller';
import {
	getYmlTitle,
	hasValidWorkSpaceRootPath,
	ignoreFiles,
	insertContentToEditor,
	isMarkdownFileCheck,
	isValidEditor,
	isValidFileCheck,
	noActiveEditorMessage,
	postWarning,
	setCursorPosition,
	unsupportedFileMessage
} from '../helper/common';
import { sendTelemetryData } from '../helper/telemetry';
import { externalLinkBuilder, internalLinkBuilder, videoLinkBuilder } from '../helper/utility';
import { linkToDocsPageByUrl } from './links/linkToDocsPageByUrl';
import { basename, extname } from 'path';
const yaml = require('js-yaml');
const telemetryCommandMedia: string = 'insertMedia';
const telemetryCommandLink: string = 'insertLink';
let commandOption: string;

export function insertLinksAndMediaCommands() {
	const commands = [
		{ command: insertVideo.name, callback: insertVideo },
		{ command: insertURL.name, callback: insertURL },
		{ command: insertLink.name, callback: insertLink },
		{ command: selectLinkType.name, callback: selectLinkType },
		{ command: selectLinkTypeToolbar.name, callback: selectLinkTypeToolbar },
		{ command: selectMediaType.name, callback: selectMediaType }
	];
	return commands;
}

export const imageExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.bmp'];
export const markdownAndYmlExtensionFilter = ['.md', '.yml'];

export const h1TextRegex = /\n {0,3}(#{1,6})(.*)/;
export const yamlTextRegex = /^-{3}\s*\r?\n([\s\S]*?)-{3}\s*\r?\n([\s\S]*)/;

export enum MediaType {
	Link,
	ImageOrVideo,
	GrayBorderImage
}

export async function insertVideo() {
	commandOption = 'video';
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}
	const validateInput = (urlInput: string) => {
		const allowedHosts = [
			'https://channel9.msdn.com',
			'https://www.youtube.com/embed',
			'https://www.microsoft.com/en-us/videoplayer/embed'
		];
		const urlLowerCase = urlInput.toLowerCase();
		return allowedHosts.includes(urlLowerCase) && urlLowerCase.split('?')[0].endsWith('player')
			? ''
			: 'https://channel9.msdn.com, https://www.youtube.com/embed or https://www.microsoft.com/en-us/videoplayer/embed are required prefixes for video URLs. Link will not be added if prefix is not present.';
	};
	const val = await vscode.window.showInputBox({
		placeHolder: 'Enter URL; Begin typing to see the allowed video URL prefixes.',
		validateInput
	});
	// If the user adds a link that doesn't include the http(s) protocol, show a warning and don't add the link.
	if (val === undefined) {
		postWarning(
			'Incorrect link syntax. For YouTube videos, use the embed syntax, https://www.youtube.com/embed/<videoID>. For Channel9videos, use the player syntax, https://channel9.msdn.com/. For Red Tiger, use, https://www.microsoft.com/en-us/embed/<videoID>/player'
		);
		return;
	}
	const contentToInsert = videoLinkBuilder(val);
	await insertContentToEditor(editor, contentToInsert);
	sendTelemetryData(telemetryCommandMedia, commandOption);
}

/**
 * Creates an external URL with the current selection.
 */
export async function insertURL() {
	commandOption = 'external';
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}
	const selection = editor.selection;
	const selectedText = editor.document.getText(selection);

	const options: vscode.InputBoxOptions = {
		placeHolder: 'Enter URL',
		validateInput: urlInput =>
			urlInput.startsWith('http://') || urlInput.startsWith('https://')
				? ''
				: 'http:// or https:// is required for URLs. Link will not be added if prefix is not present.'
	};

	const linkTextOptions: vscode.InputBoxOptions = {
		placeHolder: 'Enter link text. If no text is entered, URL will be used.'
	};

	const val = await vscode.window.showInputBox(options);
	// If the user adds a link that doesn't include the http(s) protocol, show a warning and don't add the link.
	if (!val) {
		postWarning('Incorrect link syntax. Abandoning command.');
		return;
	}
	let contentToInsert = '';
	/* lgtm[js/regex/missing-regexp-anchor] */ if (!/^http(s)?:\/\/docs\.microsoft\.com/.test(val)) {
		// if user selected text, don't prompt for alt text
		contentToInsert = await buildLinkForWebURL(selectedText, val, selection, linkTextOptions);
	} else {
		const choice = await pickConversionChoice();
		if (choice === 'convert') {
			await linkToDocsPageByUrl(val);
			return;
		} else if (choice === 'insert without converting') {
			const docsRegexLang = new RegExp(/\/[A-Za-z]{2}-[A-Za-z]{2}\//);
			const urlWithoutLocal = val.replace(docsRegexLang, '/');
			contentToInsert = await buildLinkForWebURL(
				selectedText,
				urlWithoutLocal,
				selection,
				linkTextOptions
			);
		} else {
			return;
		}
	}
	insertContentToEditor(editor, contentToInsert, true);
	setCursorPosition(
		editor,
		selection.start.line,
		selection.start.character + contentToInsert.length
	);
	sendTelemetryData(telemetryCommandLink, commandOption);
}

async function buildLinkForWebURL(
	selectedText: string,
	val: string,
	selection: vscode.Selection,
	linkTextOptions: vscode.InputBoxOptions
) {
	let contentToInsert;
	if (selectedText) {
		contentToInsert = externalLinkBuilder(val, selectedText);
	}
	// if no content is selected, prompt for alt text
	// no alt text: use link
	if (selection.isEmpty) {
		const altText = await window.showInputBox(linkTextOptions);
		if (selection.isEmpty && !altText) {
			contentToInsert = externalLinkBuilder(val);
		}
		if (altText) {
			contentToInsert = externalLinkBuilder(val, altText);
		}
	}
	return contentToInsert;
}

export async function pickConversionChoice() {
	const opts: QuickPickOptions = {
		placeHolder:
			'Fully qualified links to Docs pages will be broken in isolated environments. Convert to a relative link?'
	};
	const items: QuickPickItem[] = [];
	items.push({
		description: '',
		label: 'Convert'
	});
	items.push({
		description: '',
		label: 'Insert without converting'
	});
	items.push({
		description: '',
		label: 'Cancel'
	});

	const selection: QuickPickItem = await window.showQuickPick(items, opts);
	if (!selection) {
		return;
	}
	const selectionWithoutIcon = selection.label.toLowerCase();
	switch (selectionWithoutIcon) {
		case 'convert':
			commandOption = 'convert';
			return 'convert';
		case 'insert without converting':
			commandOption = 'insert without converting';
			return 'insert without converting';
		case 'cancel':
			return '';
	}
}

/**
 * Inserts a link
 */
export function insertLink() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}

	const languageId = editor.document.languageId;
	const isMarkdown = languageId === 'markdown';
	const isYaml = languageId === 'yaml';

	if (!isMarkdown && !isYaml) {
		unsupportedFileMessage(languageId);
		return;
	}

	Insert(MediaType.Link, { languageId });
}

/**
 * Triggers the insert function and passes in the true value to signify it is an art insert.
 */
export function insertImage() {
	Insert(MediaType.ImageOrVideo);
}

export function getFilesShowQuickPick(mediaType: MediaType, altText: string, options?: any) {
	const path = require('path');
	const os = require('os');
	const fs = require('fs');

	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}
	const selection = editor.selection;
	let folderPath: string = '';
	let selectedText = editor.document.getText(selection);
	const activeFileDir = path.dirname(editor.document.fileName);

	if (vscode.workspace.workspaceFolders) {
		folderPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
	}

	// recursively get all the files from the root folder
	recursive(folderPath, ignoreFiles, (err: any, files: any) => {
		if (err) {
			vscode.window.showErrorMessage(err);
			throw err;
		}

		const items: vscode.QuickPickItem[] = [];
		files.sort();

		const isArt = mediaType !== MediaType.Link;
		if (isArt) {
			files
				.filter((file: any) => imageExtensions.indexOf(path.extname(file.toLowerCase())) !== -1)
				.forEach((file: any) => {
					items.push({ label: path.basename(file), description: path.dirname(file) });
				});
		} else {
			files
				.filter(
					(file: any) =>
						markdownAndYmlExtensionFilter.indexOf(path.extname(file.toLowerCase())) !== -1
				)
				.forEach((file: any) => {
					items.push({ label: path.basename(file), description: path.dirname(file) });
				});
		}

		// show the quick pick menu
		const selectionPick = vscode.window.showQuickPick(items);
		selectionPick.then(qpSelection => {
			if (!qpSelection) {
				return;
			} else {
				let result: string = '';
				const altTextFileName = qpSelection.label;
				// Gets the H1 content as default name if unselected text. Will filter undefinition H1, non-MD file.
				if (!isArt && selectedText === '') {
					// gets the content for chosen file with utf-8 format
					const fullPath = path.join(qpSelection.description, qpSelection.label);
					let content = fs.readFileSync(fullPath, 'utf8');
					// Separation yaml.
					const yamlMatch = content.match(yamlTextRegex);
					if (yamlMatch != null) {
						content = yamlMatch[2];
					}
					content = '\n' + content;
					const linkExtension = extname(fullPath);
					if (linkExtension === '.md') {
						const match = content.match(h1TextRegex);
						if (match != null) {
							selectedText = match[2].trim();
						}
					}
					if (linkExtension === '.yml') {
						const title = getYmlTitle(fullPath);
						if (title) {
							selectedText = title;
						} else {
							selectedText = basename(fullPath, '.yml');
						}
					}
				}

				const languageId = options ? options.languageId : undefined;
				// Construct and write out links
				if (isArt && altText) {
					if (altText.length > 250) {
						vscode.window.showWarningMessage('Alt text exceeds 250 characters!');
					} else {
						result = internalLinkBuilder(
							isArt,
							path.relative(
								activeFileDir,
								path.join(qpSelection.description, qpSelection.label).split('\\').join('\\\\')
							),
							altText,
							languageId
						);
					}
				} else if (isArt && altText === '') {
					result = internalLinkBuilder(
						isArt,
						path.relative(
							activeFileDir,
							path.join(qpSelection.description, qpSelection.label).split('\\').join('\\\\')
						),
						altTextFileName,
						languageId
					);
				} else if (!isArt) {
					result = internalLinkBuilder(
						isArt,
						path.relative(
							activeFileDir,
							path.join(qpSelection.description, qpSelection.label).split('\\').join('\\\\')
						),
						selectedText,
						languageId
					);
				}

				if (os.type() === 'Darwin') {
					if (isArt) {
						result = internalLinkBuilder(
							isArt,
							path.relative(
								activeFileDir,
								path.join(qpSelection.description, qpSelection.label).split('//').join('//')
							),
							altText,
							languageId
						);
					} else {
						result = internalLinkBuilder(
							isArt,
							path.relative(
								activeFileDir,
								path.join(qpSelection.description, qpSelection.label).split('//').join('//')
							),
							selectedText,
							languageId
						);
					}
				}

				if (!!result) {
					// Insert content into topic
					insertContentToEditor(editor, result, true);
					if (!isArt) {
						setCursorPosition(
							editor,
							selection.start.line,
							selection.start.character + result.length
						);
					}
				}
			}
		});
	});
}

/**
 * Inserts various media types.
 * @param {MediaType} mediaType - the media type to insert.
 * @param {IOptions} [options] - optionally specifies the language identifier of the target file.
 */
export async function Insert(mediaType: MediaType, options?: any) {
	let actionType: string = Insert.name;

	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	} else {
		const selectedText = editor.document.getText(editor.selection);

		// Determines the name to set in the ValidEditor check
		switch (mediaType) {
			case MediaType.ImageOrVideo:
				actionType = 'Art';
				commandOption = 'art';
				sendTelemetryData(telemetryCommandMedia, commandOption);
				break;
			case MediaType.Link:
				actionType = 'Link';
				commandOption = 'internal';
				sendTelemetryData(telemetryCommandLink, commandOption);
				break;
		}

		// Checks for valid environment
		if (!isValidEditor(editor, false, actionType)) {
			return;
		}

		// We have some cross-over functionality in both YAML and Markdown
		if (!isValidFileCheck(editor, ['markdown', 'yaml'])) {
			return;
		}

		if (!hasValidWorkSpaceRootPath(telemetryCommandLink)) {
			return;
		}

		// The active file should be used as the origin for relative links.
		// The path is split so the file type is not included when resolving the path.
		const activeFileName = editor.document.fileName;
		const pathDelimited = editor.document.fileName.split('.');
		const activeFilePath = pathDelimited[0];

		// Check to see if the active file has been saved.  If it has not been saved, warn the user.
		// The user will still be allowed to add a link but it the relative path will not be resolved.
		if (!existsSync(activeFileName)) {
			vscode.window.showWarningMessage(
				`${activeFilePath} is not saved. Cannot accurately resolve path to create link.`
			);
			return;
		}

		getFilesShowQuickPick(mediaType, selectedText, options);
	}
}

/**
 * Creates an entry point for creating an internal (link type) or external link (url type).
 */
export function selectLinkType() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	} else {
		if (!isValidEditor(editor, false, 'insert link')) {
			return;
		}

		if (!isMarkdownFileCheck(editor, false)) {
			return;
		}

		const linkTypes = ['Heading in this file', 'Heading in another file'];
		vscode.window.showQuickPick(linkTypes).then(qpSelection => {
			if (qpSelection === linkTypes[0]) {
				insertBookmarkInternal();
			} else if (qpSelection === linkTypes[1]) {
				insertBookmarkExternal();
			}
		});
	}
}

/**
 * Creates an entry point for creating an internal (link type) or external link (url type).
 */
export function selectLinkTypeToolbar(toolbar?: boolean) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}

	if (!isValidEditor(editor, false, 'insert link')) {
		return;
	}

	if (!isMarkdownFileCheck(editor, false)) {
		return;
	}

	const linkTypes = ['External', 'Internal', 'Bookmark in this file', 'Bookmark in another file'];
	vscode.window.showQuickPick(linkTypes).then(qpSelection => {
		if (qpSelection === linkTypes[0]) {
			insertURL();
		} else if (qpSelection === linkTypes[1]) {
			Insert(MediaType.Link);
		} else if (qpSelection === linkTypes[2]) {
			insertBookmarkInternal();
		} else if (qpSelection === linkTypes[3]) {
			insertBookmarkExternal();
		}
	});
}

/**
 * Creates an entry point for creating an internal (link type) or external link (url type).
 */
export function selectMediaType() {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	} else {
		if (!isValidEditor(editor, false, 'insert media')) {
			return;
		}

		if (!isMarkdownFileCheck(editor, false)) {
			return;
		}

		const mediaTypes = ['Image', 'Video'];
		vscode.window.showQuickPick(mediaTypes).then(qpSelection => {
			if (qpSelection === mediaTypes[0]) {
				Insert(MediaType.ImageOrVideo);
			} else if (qpSelection === mediaTypes[1]) {
				insertVideo();
			}
		});
	}
}
