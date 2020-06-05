'use strict';

import { window } from 'vscode';
import {
	insertContentToEditor,
	isMarkdownFileCheck,
	noActiveEditorMessage,
	setCursorPosition
} from '../../helper/common';
import { sendTelemetryData } from '../../helper/telemetry';
import { encodeSpecialXrefCharacters } from './utilities';
import { getXrefSelection, getXrefDisplayProperty } from './xref-helper';

const telemetryCommand: string = 'applyXref';

export function applyXrefCommand() {
	const commands = [{ command: applyXref.name, callback: applyXref }];
	return commands;
}

export async function applyXref() {
	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}
	if (!isMarkdownFileCheck(editor, false)) {
		return;
	}
	let xref = '';
	const selection = editor.selection;
	const selectedText = editor.document.getText(selection);
	// if theres no selected text, add xref syntax as <xref:...>
	const xrefSelection = await getXrefSelection();
	if (!xrefSelection) {
		return;
	}
	if (selectedText === '') {
		const displayProperty = await getXrefDisplayProperty();
		if (displayProperty && displayProperty.label !== 'none') {
			xrefSelection.label = `${xrefSelection.label}?displayProperty=${displayProperty.label}`;
		}
		xref = `<xref:${encodeSpecialXrefCharacters(xrefSelection.label)}>`;
	} else {
		xref = `[${selectedText}](xref:${xrefSelection.label})`;
	}
	await insertContentToEditor(editor, xref, true);
	// Gets the cursor position
	const position = editor.selection.active;
	const positionCharacter =
		applyXref.name === 'applyXref' ? position.character + xref.length : position.character + 1;
	// Makes the cursor position in between syntaxs
	setCursorPosition(editor, position.line, positionCharacter);
	sendTelemetryData(telemetryCommand, '');
}
