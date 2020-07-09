/* eslint-disable @typescript-eslint/no-var-requires */
import { MediaType } from './MediaType';
import { window, workspace, QuickPickItem } from 'vscode';
import * as recursive from 'recursive-readdir';
import {
	ignoreFiles,
	insertContentToEditor,
	noActiveEditorMessage,
	setCursorPosition,
	imageExtensions,
	markdownExtensionFilter
} from '../../helper/common';
import { internalLinkBuilder } from '../../helper/utility';

export const h1TextRegex = /\n {0,3}(#{1,6})(.*)/;
export const headingTextRegex = /^(#+)[\s](.*)[\r]?[\n]/gm;
export const yamlTextRegex = /^-{3}\s*\r?\n([\s\S]*?)-{3}\s*\r?\n([\s\S]*)/;

export function getFilesShowQuickPick(mediaType: MediaType, altText: string, options?: any) {
	const path = require('path');
	const os = require('os');
	const fs = require('fs');

	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}
	const selection = editor.selection;
	let folderPath: string = '';
	let selectedText = editor.document.getText(selection);
	const activeFileDir = path.dirname(editor.document.fileName);

	if (workspace.workspaceFolders) {
		folderPath = workspace.workspaceFolders[0].uri.fsPath;
	}

	// recursively get all the files from the root folder
	recursive(folderPath, ignoreFiles, async (err: any, files: any) => {
		if (err) {
			window.showErrorMessage(err);
			throw err;
		}

		const items: QuickPickItem[] = [];
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
					(file: any) => markdownExtensionFilter.indexOf(path.extname(file.toLowerCase())) !== -1
				)
				.forEach((file: any) => {
					items.push({ label: path.basename(file), description: path.dirname(file) });
				});
		}

		// show the quick pick menu
		const qpSelection = await window.showQuickPick(items);
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
				const match = content.match(h1TextRegex);
				if (match != null) {
					selectedText = match[2].trim();
				}
			}

			const languageId = options ? options.languageId : undefined;
			// Construct and write out links
			if (isArt && altText) {
				if (altText.length > 250) {
					window.showWarningMessage('Alt text exceeds 250 characters!');
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
				await insertContentToEditor(editor, result, true);
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
}
