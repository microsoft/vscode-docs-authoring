import { updateMetadataDate } from '../controllers/metadata-controller';
import { workspace, window } from 'vscode';
import { noActiveEditorMessage, toShortDate, isMarkdownFileCheck } from './common';
import { findReplacement } from './utility';

const blacklist: string[] = [];

export async function nag() {
	if (workspace.getConfiguration('markdown').metadataNag === false) {
		return;
	}
	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}

	if (!isMarkdownFileCheck(editor, false)) {
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
