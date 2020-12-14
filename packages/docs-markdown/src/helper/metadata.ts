import { updateMetadataDate } from '../controllers/metadata-controller';
import { workspace, window } from 'vscode';
import { noActiveEditorMessage, toShortDate, isMarkdownFileCheck } from './common';
import { findReplacement } from './utility';

const blacklist: string[] = [];

export function insertMetadataHelperCommands() {
	return [
		{ command: disableMetadataDateReminder.name, callback: disableMetadataDateReminder },
		{ command: enableMetadataDateReminder.name, callback: enableMetadataDateReminder }
	];
}

export async function metadataDateReminder() {
	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}

	if (!isMarkdownFileCheck(editor, false)) {
		return;
	}

	const config = workspace.getConfiguration('markdown');
	if (!config.get<boolean>('enableMetadataDateReminder')) {
		return;
	}

	const fileName = editor.document.fileName;
	// skip files that have already been saved
	if (blacklist.indexOf(fileName) > -1 === true) {
		return;
	}
	blacklist.push(fileName);

	const content = editor.document.getText();
	if (content) {
		const msDateRegex = /ms.date:\s*\b(.+?)$/im;
		const msDateReplacement = findReplacement(
			editor.document,
			content,
			`ms.date: ${toShortDate(new Date())}`,
			msDateRegex
		);
		if (msDateReplacement) {
			const syncDate = await window.showInformationMessage(
				"Would you like to update ms.date to today's date?",
				'Update'
			);
			if (syncDate !== undefined) {
				await updateMetadataDate();
			}
		}
	}
}

export async function disableMetadataDateReminder() {
	const config = workspace.getConfiguration('markdown');
	await config.update('enableMetadataDateReminder', false);
}

export async function enableMetadataDateReminder() {
	const config = workspace.getConfiguration('markdown');
	await config.update('enableMetadataDateReminder', true);
}
