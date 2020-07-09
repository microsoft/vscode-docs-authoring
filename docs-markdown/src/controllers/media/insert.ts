/* eslint-disable @typescript-eslint/no-var-requires */
'use strict';

import { existsSync } from 'graceful-fs';
import {
	hasValidWorkSpaceRootPath,
	isValidEditor,
	isValidFileCheck,
	noActiveEditorMessage,
	postWarning,
	insertContentToEditor,
	setCursorPosition,
	unsupportedFileMessage
} from '../../helper/common';
import { sendTelemetryData } from '../../helper/telemetry';
import { window, InputBoxOptions } from 'vscode';
import { videoLinkBuilder, externalLinkBuilder } from '../../helper/utility';
import { MediaType } from './MediaType';
import { getFilesShowQuickPick } from './getFilesShowQuickPick';
const telemetryCommandMedia: string = 'insertMedia';
const telemetryCommandLink: string = 'insertLink';
let commandOption: string;

/**
 * Inserts various media types.
 * @param {MediaType} mediaType - the media type to insert.
 * @param {IOptions} [options] - optionally specifies the language identifier of the target file.
 */
export async function Insert(mediaType: MediaType, options?: any) {
	let actionType: string = Insert.name;

	const editor = window.activeTextEditor;
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
			window.showWarningMessage(
				`${activeFilePath} is not saved. Cannot accurately resolve path to create link.`
			);
			return;
		}

		getFilesShowQuickPick(mediaType, selectedText, options);
	}
}

export async function insertVideo() {
	commandOption = 'video';
	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}
	const validateInput = (urlInput: string) => {
		const urlLowerCase = urlInput.toLowerCase();
		return (urlLowerCase.startsWith('https://channel9.msdn.com') &&
			urlLowerCase.split('?')[0].endsWith('player')) ||
			urlLowerCase.startsWith('https://www.youtube.com/embed') ||
			urlLowerCase.startsWith('https://www.microsoft.com/en-us/videoplayer/embed')
			? ''
			: 'https://channel9.msdn.com, https://www.youtube.com/embed or https://www.microsoft.com/en-us/videoplayer/embed are required prefixes for video URLs. Link will not be added if prefix is not present.';
	};
	const val = await window.showInputBox({
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
export function insertURL() {
	commandOption = 'external';
	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}
	const selection = editor.selection;
	const selectedText = editor.document.getText(selection);

	const options: InputBoxOptions = {
		placeHolder: 'Enter URL',
		validateInput: urlInput =>
			urlInput.startsWith('http://') || urlInput.startsWith('https://')
				? ''
				: 'http:// or https:// is required for URLs. Link will not be added if prefix is not present.'
	};

	const linkTextOptions: InputBoxOptions = {
		placeHolder: 'Enter link text. If no text is entered, url will be used.'
	};

	window.showInputBox(options).then(val => {
		let contentToInsert;
		// If the user adds a link that doesn't include the http(s) protocol, show a warning and don't add the link.
		if (val === undefined) {
			postWarning('Incorrect link syntax. Abandoning command.');
		} else {
			// if user selected text, don't prompt for alt text
			if (selectedText) {
				contentToInsert = externalLinkBuilder(val, selectedText);
				insertContentToEditor(editor, contentToInsert, true);
			}
			// if no content is selected, prompt for alt text
			// no alt text: use link
			if (selection.isEmpty) {
				window.showInputBox(linkTextOptions).then(altText => {
					if (selection.isEmpty && !altText) {
						contentToInsert = externalLinkBuilder(val);
						insertContentToEditor(editor, contentToInsert);
					}
					if (altText) {
						contentToInsert = externalLinkBuilder(val, altText);
						insertContentToEditor(editor, contentToInsert, true);
					}
					setCursorPosition(
						editor,
						selection.start.line,
						selection.start.character + contentToInsert.length
					);
				});
			}
		}
	});
	sendTelemetryData(telemetryCommandLink, commandOption);
}

/**
 * Inserts a link
 */
export function insertLink() {
	const editor = window.activeTextEditor;
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
