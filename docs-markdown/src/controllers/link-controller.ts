import { existsSync } from 'fs';
import { basename, dirname, join, relative } from 'path';
import {
	commands,
	ProgressLocation,
	QuickPickItem,
	QuickPickOptions,
	RelativePattern,
	TextEditor,
	Uri,
	window,
	workspace
} from 'vscode';
import { checkExtension, noActiveEditorMessage, postInformation } from '../helper/common';
import { sendTelemetryData } from '../helper/telemetry';
import {
	applyReplacements,
	findReplacements,
	RegExpWithGroup,
	Replacements
} from '../helper/utility';
import { Command } from '../Command';
import { Insert, insertURL, MediaType, selectLinkType } from './media-controller';
import { applyXref } from './xref/xref-controller';

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
			let message = `scanning ${length} markdown files.${
				length > 100 ? ' This might take a while, please be patient.' : ''
			}`;
			progress.report({ increment: 0, message });
			const increment = 100 / length;
			let filesUpdated = 0;
			for (let i = 0; i < length; i++) {
				if (token.isCancellationRequested) {
					break;
				}
				const file = filePaths[i];
				const document = await workspace.openTextDocument(file);
				const editor = await window.showTextDocument(document);
				const collapsedLinkCount = await collapseRelativeLinksForEditor(editor);
				if (collapsedLinkCount > 0) {
					filesUpdated++;
					message = `collapsed ${collapsedLinkCount} links in ${basename(file.fsPath)}`;
				}

				progress.report({ increment, message });
			}

			progress.report({ increment: 100, message: `Collapsed links in ${length} files.` });
		}
	);
}

export async function collapseRelativeLinks() {
	await collapseRelativeLinksForEditor(window.activeTextEditor);
}

export async function collapseRelativeLinksForEditor(editor: TextEditor): Promise<number> {
	if (!editor) {
		noActiveEditorMessage();
		return;
	}

	const content = editor.document.getText();
	if (!content) {
		return;
	}

	const directory = dirname(editor.document.fileName);
	const tempReplacements = findReplacements(editor.document, content, null, linkRegex);
	const replacements: Replacements = [];
	if (tempReplacements) {
		// eslint-disable-next-line @typescript-eslint/prefer-for-of
		for (let i = 0; i < tempReplacements.length; i++) {
			const replacement = tempReplacements[i];
			const absolutePath = join(directory, replacement.value);
			if (replacement && existsSync(absolutePath)) {
				const relativePath = relative(directory, absolutePath).replace(/\\/g, '/');
				if (relativePath !== replacement.value && `./${relativePath}` !== replacement.value) {
					replacements.push({
						selection: replacement.selection,
						value: relativePath
					});
				}
			}
		}
	}

	await applyReplacements(replacements, editor);
	return replacements.length;
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
