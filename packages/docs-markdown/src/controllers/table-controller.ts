'use strict';

import * as vscode from 'vscode';
import {
	insertContentToEditor,
	isMarkdownFileCheck,
	isValidEditor,
	noActiveEditorMessage,
	postWarning
} from '../helper/common';
import { FormatOptions, MarkdownTable } from '../helper/markdown-table';
import { output } from '../helper/output';
import { sendTelemetryData } from '../helper/telemetry';
import { tableBuilder, validateTableRowAndColumnCount } from '../helper/utility';

const telemetryCommand: string = 'insertTable';
let commandOption: string;

export function insertTableCommand() {
	return [
		{ command: consolidateTable.name, callback: consolidateTable },
		{ command: distributeTable.name, callback: distributeTable },
		{ command: insertTable.name, callback: insertTable }
	];
}

export async function consolidateTable() {
	await reformatTable(FormatOptions.Consolidate);
}

export async function distributeTable() {
	await reformatTable(FormatOptions.Distribute);
}

async function reformatTable(formatOptions: FormatOptions) {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}
	const selection = editor.selection;
	if (!selection) {
		postWarning('You must select a markdown table first.');
		return;
	}

	const table = MarkdownTable.parse(selection, editor.document);
	if (table) {
		await table.reformat(editor, formatOptions);
	}
}

export function insertTable() {
	let logTableMessage: string;
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}
	if (!isValidEditor(editor, false, insertTable.name)) {
		return;
	}

	if (!isMarkdownFileCheck(editor, false)) {
		return;
	}

	const tableInput = vscode.window.showInputBox({
		prompt: 'Input the number of columns and rows as C:R'
	});

	// gets the users input on number of columns and rows
	tableInput.then(val => {
		if (!val) {
			return;
		} else {
			const size = val.split(':');

			/// check valid value and exceed 4*4
			if (validateTableRowAndColumnCount(size.length, size[0], size[1])) {
				const col = Number.parseInt(size[0], undefined);
				const row = Number.parseInt(size[1], undefined);
				const str = tableBuilder(col, row);
				insertContentToEditor(editor, str);
				logTableMessage = col + ':' + row;
			} else {
				output.appendLine('Table insert failed.');
			}
			commandOption = logTableMessage;
			sendTelemetryData(telemetryCommand, commandOption);
		}
	});
}
