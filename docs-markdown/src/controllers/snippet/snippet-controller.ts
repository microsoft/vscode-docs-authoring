'use strict';

import { window } from 'vscode';
import {
	hasValidWorkSpaceRootPath,
	isMarkdownFileCheck,
	isValidEditor,
	noActiveEditorMessage
} from '../../helper/common';
import { sendTelemetryData } from '../../helper/telemetry';
import { searchRepo } from './searchRepo';

const telemetryCommand: string = 'insertSnippet';

export function insertSnippetCommand() {
	const commands = [{ command: insertSnippet.name, callback: insertSnippet }];
	return commands;
}

/**
 * Creates a snippet at the current cursor position.
 */
export async function insertSnippet() {
	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}

	if (!isValidEditor(editor, false, insertSnippet.name)) {
		return;
	}

	if (!isMarkdownFileCheck(editor, false)) {
		return;
	}

	if (!hasValidWorkSpaceRootPath(telemetryCommand)) {
		return;
	}
	await searchRepo();
	sendTelemetryData(telemetryCommand, '');
}
