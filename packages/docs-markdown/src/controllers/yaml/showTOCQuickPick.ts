import { createEntry } from './createEntry';
import { readFileSync } from 'fs';
import { basename, dirname, join, relative } from 'path';
import { QuickPickItem, window, workspace } from 'vscode';
import { noActiveEditorMessage, postError, showStatusMessage } from '../../helper/common';
import { noHeadingSelected } from '../../constants/log-messages';
import { getHeadings } from '../../helper/getHeader';
import fg = require('fast-glob');

export async function showTOCQuickPick(options: boolean) {
	let folderPath: string = '';

	if (workspace.workspaceFolders) {
		folderPath = workspace.workspaceFolders[0].uri.fsPath;
	}

	const files = fg.sync(['**.md'], { dot: true, cwd: folderPath });
	const items: QuickPickItem[] = [];
	files.sort();
	files.forEach((file: any) => {
		items.push({ label: basename(file), description: dirname(file) });
	});

	// show the quick pick menu
	const selectionPick = await window.showQuickPick(items);

	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}

	if (!selectionPick) {
		return;
	}

	const fullPath = join(folderPath, selectionPick.description, selectionPick.label);
	const content = readFileSync(fullPath, 'utf8');
	const headings = getHeadings(content);

	if (!headings) {
		postError(`Could not find H1: ${fullPath}`);
		showStatusMessage(`Could not find H1: ${fullPath}`);
		return;
	}

	let headingName = headings[2].trim();
	const activeFilePath = editor.document.fileName;
	const href = relative(activeFilePath, fullPath);
	// format href: remove addtional leading segment (support windows, macos and linux), set path separators to standard
	const formattedHrefPath = href.replace('..\\', '').replace('../', '').replace(/\\/g, '/');
	const val = await window.showInputBox({
		value: headingName,
		valueSelection: [0, 0]
	});
	if (!val) {
		window.showInformationMessage(noHeadingSelected);
	}
	if (val) {
		headingName = val;
	}
	await createEntry(headingName, formattedHrefPath, options);
}

export async function launchTOCQuickPick(options: boolean) {
	if (!options) {
		await showTOCQuickPick(false);
	} else {
		await showTOCQuickPick(true);
	}
}
