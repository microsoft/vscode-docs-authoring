import { updateMetadataDate } from '../controllers/metadata-controller';
import { workspace, window, Position, Range } from 'vscode';
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
		if (msDateReplacement && checkIfShortDate(msDateReplacement, editor)) {
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

function checkIfShortDate(msDateReplacement, editor) {
	const shortDay = new Date().getDate();
	const shortMonth = new Date().getMonth() + 1;
	const year = new Date().getFullYear();
	const month = shortMonth > 9 ? shortMonth : `0${shortMonth}`;
	const shortDayLongMonthDate = `${month}/${shortDay}/${year}`;
	const shortMonthDayDate = `${shortMonth}/${shortDay}/${year}`;
	const shortMonthDate = toShortDate(new Date()).substring(1);
	const selectedText = editor.document.getText(
		new Range(
			new Position(
				msDateReplacement.selection.start.line,
				msDateReplacement.selection.start.character
			),
			new Position(msDateReplacement.selection.end.line, msDateReplacement.selection.end.character)
		)
	);
	const msDateShortDayDate = `ms.date: ${shortDayLongMonthDate}`;
	const msDateShortMonthDayDate = `ms.date: ${shortMonthDayDate}`;
	const msDateShortMonthDate = `ms.date: ${shortMonthDate}`;
	if (
		selectedText === msDateShortMonthDate ||
		selectedText === msDateShortMonthDayDate ||
		selectedText === msDateShortDayDate
	) {
		return false;
	}
	return true;
}

export async function disableMetadataDateReminder() {
	const config = workspace.getConfiguration('markdown');
	await config.update('enableMetadataDateReminder', false);
}

export async function enableMetadataDateReminder() {
	const config = workspace.getConfiguration('markdown');
	await config.update('enableMetadataDateReminder', true);
}
