import { existsSync, promises } from 'graceful-fs';
import { basename, dirname, join, relative } from 'path';
import {
	commands,
	ProgressLocation,
	QuickPickItem,
	QuickPickOptions,
	RelativePattern,
	TextDocument,
	TextEditor,
	Uri,
	window,
	workspace
} from 'vscode';
import {
	checkExtension,
	noActiveEditorMessage,
	postInformation,
	postWarning
} from '../helper/common';
import { sendTelemetryData } from '../helper/telemetry';
import {
	applyReplacements,
	findReplacements,
	RegExpWithGroup,
	Replacements,
	findMatchesInText
} from '../helper/utility';
import { Command } from '../Command';
import { Insert, insertURL, MediaType, selectLinkType } from './media-controller';
import { applyXref } from './xref/xref-controller';
import { numberFormat } from '../constants/formatting';

export const linkControllerCommands: Command[] = [
	{
		callback: collapseRelativeLinks,
		command: collapseRelativeLinks.name
	},
	{
		callback: collapseRelativeLinksInFolder,
		command: collapseRelativeLinksInFolder.name
	}
];

const linkRegex: RegExpWithGroup = {
	expression: /\]\((?<path>\..\/[^http?|~].+?)(?<query>\?.+?)?(?<hash>#.+?)?\)/gm,
	groups: ['path', 'query', 'hash']
};
const telemetryCommand: string = 'insertLink';
let commandOption: string;

export async function collapseRelativeLinksInFolder(uri: Uri) {
	await window.withProgress(
		{
			cancellable: true,
			location: ProgressLocation.Notification,
			title: 'Collapsing links in folder'
		},
		async (progress, token) => {
			token.onCancellationRequested(() => {
				postInformation('Collapsing links operation canceled by user.');
			});

			const filePaths = await workspace.findFiles(new RelativePattern(uri.path, '**/*.md'));

			const length = filePaths.length;
			const isLongRunningOperation = length > 20;
			let message = `scanning ${numberFormat.format(length)} markdown files.${
				isLongRunningOperation ? ' This might take a while, please be patient.' : ''
			}`;

			progress.report({ increment: 0, message });
			const increment = 100 / length;
			let filesUpdated = 0;
			for (let i = 0; i < length; i++) {
				if (token.isCancellationRequested) {
					break;
				}

				const file = filePaths[i];
				let collapsedLinkCount = 0;

				// Only open the text document in the editor when 20 or less files are being worked on.
				if (isLongRunningOperation) {
					collapsedLinkCount = await collapseRelativeLinksForFile(file.fsPath);
				} else {
					const document = await workspace.openTextDocument(file);
					collapsedLinkCount = await collapseRelativeLinksForEditor(document, null);
				}

				if (collapsedLinkCount > 0) {
					filesUpdated++;
					message = `collapsed ${collapsedLinkCount} links in ${basename(file.fsPath)}`;
				}

				progress.report({ increment, message });
			}

			message = `Collapsed links in ${numberFormat.format(
				filesUpdated
			)} of the ${numberFormat.format(length)} files scanned.`;
			progress.report({ increment: 100, message });
			postInformation(message);
		}
	);
}

export async function collapseRelativeLinks() {
	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}

	await collapseRelativeLinksForEditor(editor.document, editor);
}

export async function collapseRelativeLinksForFile(
	filePath: string,
	saveOnReplace: boolean = true
): Promise<number> {
	if (existsSync(filePath)) {
		let content = (await promises.readFile(filePath)).toString('utf8');
		if (!content) {
			return 0;
		}

		const rangeValuePairs = findMatchesInText(content, linkRegex);
		if (!rangeValuePairs || !rangeValuePairs.length) {
			return 0;
		}

		const directory = dirname(filePath);
		const replacements: { originalValue: string; newValue: string }[] = [];
		// eslint-disable-next-line @typescript-eslint/prefer-for-of
		for (let i = 0; i < rangeValuePairs.length; i++) {
			const rangeValuePair = rangeValuePairs[i];
			const absolutePath = join(directory, rangeValuePair.value);
			if (rangeValuePair && existsSync(absolutePath)) {
				const relativePath = tryGetRelativePath(directory, absolutePath);
				if (relativePath !== rangeValuePair.value && `./${relativePath}` !== rangeValuePair.value) {
					replacements.push({
						originalValue: rangeValuePair.value,
						newValue: relativePath
					});
				}
			}
		}

		if (replacements.length === 0) {
			return 0;
		}

		replacements.forEach(replacement => {
			content = content.replace(replacement.originalValue, replacement.newValue);
		});

		// Parameter should only ever be false when running a unit test.
		if (saveOnReplace) {
			await promises.writeFile(filePath, content, 'utf8');
		}

		return replacements.length;
	}

	return 0;
}

export async function collapseRelativeLinksForEditor(
	document: TextDocument,
	editor: TextEditor
): Promise<number> {
	const content = document.getText();
	if (!content) {
		return;
	}

	const directory = dirname(document.fileName);
	const tempReplacements = findReplacements(document, content, null, linkRegex);
	if (!tempReplacements || tempReplacements.length === 0) {
		return 0;
	}

	const replacements: Replacements = [];
	// eslint-disable-next-line @typescript-eslint/prefer-for-of
	for (let i = 0; i < tempReplacements.length; i++) {
		const replacement = tempReplacements[i];
		const absolutePath = join(directory, replacement.value);
		if (replacement && existsSync(absolutePath)) {
			const relativePath = tryGetRelativePath(directory, absolutePath);
			if (relativePath !== replacement.value && `./${relativePath}` !== replacement.value) {
				replacements.push({
					selection: replacement.selection,
					value: relativePath
				});
			}
		}
	}

	if (replacements.length === 0) {
		return 0;
	}

	if (!editor) {
		editor = await window.showTextDocument(document);
	}

	await applyReplacements(replacements, editor);
	return replacements.length;
}

function tryGetRelativePath(directory: string, absolutePath: string): string {
	try {
		const relativePath = relative(directory, absolutePath);
		return !!relativePath ? relativePath.replace(/\\/g, '/') : null;
	} catch (error) {
		postWarning(error);
		return null;
	}
}

export function pickLinkType() {
	const opts: QuickPickOptions = { placeHolder: 'Select an Link type' };
	const items: QuickPickItem[] = [];
	items.push({
		description: '',
		label: '$(file-symlink-directory) Link to file in repo'
	});
	items.push({
		description: '',
		label: '$(globe) Link to web page'
	});
	items.push({
		description: '',
		label: '$(link) Link to heading'
	});
	items.push({
		description: '',
		label: '$(x) Link to Xref'
	});

	if (checkExtension('blackmist.LinkCheckMD')) {
		items.push({
			description: '',
			label: '$(check) Generate a link report'
		});
	}

	window.showQuickPick(items, opts).then(selection => {
		if (!selection) {
			return;
		}
		const selectionWithoutIcon = selection.label.toLowerCase().split(')')[1].trim();
		switch (selectionWithoutIcon) {
			case 'link to file in repo':
				Insert(MediaType.Link);
				commandOption = 'link to file in repo';
				break;
			case 'link to web page':
				insertURL();
				commandOption = 'link to web page';
				break;
			case 'link to heading':
				selectLinkType();
				commandOption = 'link to heading';
				break;
			case 'link to xref':
				applyXref();
				commandOption = 'link to Xref';
				break;
			case 'generate a link report':
				runLinkChecker();
				commandOption = 'generate a link report';
				break;
		}
		sendTelemetryData(telemetryCommand, commandOption);
	});
}

export function runLinkChecker() {
	commands.executeCommand('extension.generateLinkReport');
}
