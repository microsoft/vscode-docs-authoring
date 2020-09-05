import { insertContentToEditor, showStatusMessage } from '../../helper/common';
import { sendTelemetryData } from '../../helper/telemetry';
import { window } from 'vscode';
import { insertedTocEntry } from '../../constants/log-messages';
const telemetryCommand: string = 'updateTOC';
let commandOption: string;

export async function createEntry(name: string, href: string, options: boolean) {
	const editor = window.activeTextEditor;
	if (!editor) {
		return;
	}
	const position = editor.selection.active;
	const cursorPosition = position.character;
	const attributeSpace = ' ';

	if (cursorPosition === 0 && !options) {
		const tocEntryLineStart = `- name: ${name}
  href: ${href}`;
		await insertContentToEditor(editor, tocEntryLineStart);
	}

	if (cursorPosition > 0 && !options) {
		const currentPosition = editor.selection.active.character;
		const tocEntryIndented = `- name: ${name}
  ${attributeSpace.repeat(currentPosition)}href: ${href}`;
		await insertContentToEditor(editor, tocEntryIndented);
	}

	if (cursorPosition === 0 && options) {
		const tocEntryWithOptions = `- name: ${name}
  displayName: #optional string for searching TOC
  href: ${href}
  uid: #optional string
  expanded: #true or false, false is default`;
		await insertContentToEditor(editor, tocEntryWithOptions);
	}

	if (cursorPosition > 0 && options) {
		const currentPosition = editor.selection.active.character;
		const tocEntryWithOptionsIndented = `- name: ${name}
  ${attributeSpace.repeat(currentPosition)}displayName: #optional string for searching TOC
  ${attributeSpace.repeat(currentPosition)}href: ${href}
  ${attributeSpace.repeat(currentPosition)}uid: #optional string
  ${attributeSpace.repeat(currentPosition)}expanded: #true or false, false is default`;
		await insertContentToEditor(editor, tocEntryWithOptionsIndented);
	}
	showStatusMessage(insertedTocEntry);
	sendTelemetryData(telemetryCommand, commandOption);
}
