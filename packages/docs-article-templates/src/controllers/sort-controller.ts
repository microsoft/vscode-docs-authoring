import { Range, window } from 'vscode';
import { naturalLanguageCompare, noActiveEditorMessage } from '../helper/common';
import { sendTelemetryData } from '../helper/telemetry';

const telemetryCommandLink: string = 'sortSelection';

export function insertSortSelectionCommands() {
	return [
		{ command: sortSelectionAscending.name, callback: sortSelectionAscending },
		{ command: sortSelectionDescending.name, callback: sortSelectionDescending }
	];
}

export function sortSelectionAscending(): Thenable<boolean> | undefined {
	return sortLines(true);
}

export function sortSelectionDescending(): Thenable<boolean> | undefined {
	return sortLines(false);
}

function sortLines(ascending: boolean = true) {
	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return undefined;
	}

	const selection = editor.selection;
	if (selection.isEmpty || selection.isSingleLine) {
		return undefined;
	}

	const startLine = selection.start.line;
	const endLine = selection.end.line;
	const lines: string[] = [];
	for (let i = startLine; i <= endLine; ++i) {
		lines.push(editor.document.lineAt(i).text);
	}

	lines.sort(naturalLanguageCompare);
	if (!ascending) {
		lines.reverse();
	}

	sendTelemetryData(telemetryCommandLink, ascending ? 'sortAscending' : 'sortDescending');

	return editor.edit(builder => {
		const range = new Range(startLine, 0, endLine, editor.document.lineAt(endLine).text.length);
		builder.replace(range, lines.join('\n'));
	});
}
