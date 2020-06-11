import { createEntry } from './createEntry';
import { readFileSync } from 'fs';
import * as recursive from 'recursive-readdir';
import { basename, dirname, extname, join, relative } from 'path';
import { QuickPickItem, window, workspace } from 'vscode';
import { ignoreFiles, noActiveEditorMessage } from '../../helper/common';
import { noHeadingSelected } from '../../constants/log-messages';

export async function showTOCQuickPick(options: boolean) {
	const markdownExtensionFilter = ['.md'];
	const headingTextRegex = /^(# )(.*)/gm;
	let folderPath: string = '';
	let fullPath: string = '';

	if (workspace.workspaceFolders) {
		folderPath = workspace.workspaceFolders[0].uri.fsPath;
	}

	const files = await recursive(folderPath, ignoreFiles);

	const items: QuickPickItem[] = [];
	files.sort();
	files
		.filter((file: any) => markdownExtensionFilter.indexOf(extname(file.toLowerCase())) !== -1)
		.forEach((file: any) => {
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

	if (selectionPick.description) {
		fullPath = join(selectionPick.description, selectionPick.label);
	}

	const content = readFileSync(fullPath, 'utf8');
	const headings = content.match(headingTextRegex);

	if (!headings) {
		window.showErrorMessage(headings[0]);
		return;
	}
	let headingName = headings.toString().replace('# ', '');
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
