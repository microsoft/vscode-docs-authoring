'use strict';

/* The module 'vscode' contains the VS Code extensibility API
 The LoadToolbar function will populate items in the toolbar, but only when the extension loads the first time.
 The common file provides functions that are useful across all commands.
 Logging, Error Handling, VS Code window updates, etc.
*/

import {
	CancellationToken,
	commands,
	CompletionItem,
	DocumentLink,
	ExtensionContext,
	languages,
	TextDocument,
	Uri,
	window,
	workspace
} from 'vscode';
import { insertAlertCommand } from './controllers/alert-controller';
import { boldFormattingCommand } from './controllers/bold-controller';
import {
	applyCleanupCommand,
	applyCleanupFile,
	applyCleanupFolder
} from './controllers/cleanup/cleanup-controller';
import { codeFormattingCommand } from './controllers/code-controller';
import { insertImageCommand } from './controllers/image-controller';
import { insertIncludeCommand } from './controllers/include-controller';
import { italicFormattingCommand } from './controllers/italic-controller';
import { linkControllerCommands } from './controllers/link-controller';
import { insertListsCommands } from './controllers/list-controller';
import { insertLinksAndMediaCommands } from './controllers/media-controller';
import { insertMetadataCommands } from './controllers/metadata-controller';
import { insertMonikerCommand } from './controllers/moniker-controller';
import {
	noLocCompletionItemsMarkdown,
	noLocCompletionItemsMarkdownYamlHeader,
	noLocCompletionItemsYaml,
	noLocTextCommand
} from './controllers/no-loc-controller';
import { previewTopicCommand } from './controllers/preview-controller';
import { quickPickMenuCommand } from './controllers/quick-pick-menu-controller';
import { getMasterRedirectionCommand } from './controllers/redirects/controller';
import { insertRowsAndColumnsCommand } from './controllers/row-columns-controller';
import { insertSnippetCommand } from './controllers/snippet/snippet-controller';
import { insertSortSelectionCommands } from './controllers/sort-controller';
import { insertTableCommand } from './controllers/table-controller';
import { applyXrefCommand } from './controllers/xref/xref-controller';
import { yamlCommands } from './controllers/yaml/yaml-controller';
import {
	checkExtension,
	extractDocumentLink,
	generateTimestamp,
	matchAll,
	noActiveEditorMessage
} from './helper/common';
import {
	insertLanguageCommands,
	markdownCodeActionProvider,
	markdownCompletionItemsProvider
} from './helper/highlight-langs';
import { output } from './helper/output';
import { Reporter } from './helper/telemetry';
import { tripleColonCompletionItemsProvider } from './helper/triple-colon-extensions';
import { UiHelper } from './helper/ui';
import { findAndReplaceTargetExpressions, checkVersion } from './helper/utility';
import { isCursorInsideYamlHeader } from './helper/yaml-metadata';
import { Command } from './Command';
import { AllowList } from './helper/AllowList';
import {
	msProdCompletionItemsProvider,
	msServiceCompletionItemsProvider,
	msTechnologyCompletionItemsProvider,
	msSubServiceCompletionItemsProvider
} from './helper/metadata-completion';

export let extensionPath: string;
type Commands = Command[];

/**
 * Provides the commands to the extension. This method is called when extension is activated.
 * Extension is activated the very first time the command is executed.
 * preview commands -
 * formatting commands -
 *
 * param {vscode.ExtensionContext} the context the extension runs in, provided by vscode on activation of the extension.
 */
export async function activate(context: ExtensionContext) {
	extensionPath = context.extensionPath;
	context.subscriptions.push(new Reporter(context));
	const { msTimeValue } = generateTimestamp();
	output.appendLine(`[${msTimeValue}] - Activating docs markdown extension.`);
	const allowList = new AllowList(context);
	const shouldUpdate = checkVersion(context);
	if (shouldUpdate) {
		await allowList.forceRefreshAllowList();
	} else {
		await allowList.getAllowList();
	}
	// Places "Docs Markdown Authoring" into the Toolbar
	new UiHelper().LoadToolbar();

	// check for docs extensions
	installedExtensionsCheck();

	// Creates an array of commands from each command file.
	const authoringCommands: Commands = [
		...linkControllerCommands,
		...insertImageCommand,
		...quickPickMenuCommand
	];
	insertAlertCommand().forEach(cmd => authoringCommands.push(cmd));
	insertMonikerCommand().forEach(cmd => authoringCommands.push(cmd));
	insertIncludeCommand().forEach(cmd => authoringCommands.push(cmd));
	insertLinksAndMediaCommands().forEach(cmd => authoringCommands.push(cmd));
	insertListsCommands().forEach(cmd => authoringCommands.push(cmd));
	insertSnippetCommand().forEach(cmd => authoringCommands.push(cmd));
	insertTableCommand().forEach(cmd => authoringCommands.push(cmd));
	boldFormattingCommand().forEach(cmd => authoringCommands.push(cmd));
	codeFormattingCommand().forEach(cmd => authoringCommands.push(cmd));
	italicFormattingCommand().forEach(cmd => authoringCommands.push(cmd));
	previewTopicCommand().forEach(cmd => authoringCommands.push(cmd));
	getMasterRedirectionCommand().forEach(cmd => authoringCommands.push(cmd));
	applyCleanupCommand().forEach(cmd => authoringCommands.push(cmd));
	applyXrefCommand().forEach(cmd => authoringCommands.push(cmd));
	yamlCommands().forEach(cmd => authoringCommands.push(cmd));
	noLocTextCommand().forEach(cmd => authoringCommands.push(cmd));
	insertRowsAndColumnsCommand().forEach(cmd => authoringCommands.push(cmd));
	insertMetadataCommands().forEach(cmd => authoringCommands.push(cmd));
	insertSortSelectionCommands().forEach(cmd => authoringCommands.push(cmd));
	insertLanguageCommands().forEach(cmd => authoringCommands.push(cmd));

	// Autocomplete
	context.subscriptions.push(setupAutoComplete());
	languages.registerDocumentLinkProvider(
		{ language: 'markdown' },
		{
			provideDocumentLinks(document: TextDocument, token: CancellationToken) {
				const IMAGE_SOURCE_RE = /source="(.*?)"/gm;
				const text = document.getText();
				const results: DocumentLink[] = [];
				for (const match of matchAll(IMAGE_SOURCE_RE, text)) {
					const matchLink = extractDocumentLink(document, match[1], match.index);
					if (matchLink) {
						results.push(matchLink);
					}
				}
				return results;
			}
		}
	);

	languages.registerCompletionItemProvider(
		'markdown',
		msSubServiceCompletionItemsProvider(context),
		':'
	);
	languages.registerCompletionItemProvider(
		'markdown',
		msTechnologyCompletionItemsProvider(context),
		':'
	);
	languages.registerCompletionItemProvider(
		'markdown',
		msServiceCompletionItemsProvider(context),
		':'
	);
	languages.registerCompletionItemProvider('markdown', msProdCompletionItemsProvider(context), ':');
	languages.registerCompletionItemProvider('markdown', tripleColonCompletionItemsProvider, ':');
	languages.registerCompletionItemProvider('markdown', markdownCompletionItemsProvider, '`');
	languages.registerCodeActionsProvider('markdown', markdownCodeActionProvider);

	// When the document changes, find and replace target expressions (for example, smart quotes).
	workspace.onDidChangeTextDocument(findAndReplaceTargetExpressions);

	// Telemetry
	context.subscriptions.push(new Reporter(context));

	// Attempts the registration of commands with VS Code and then add them to the extension context.
	try {
		commands.registerCommand('cleanupFile', async (uri: Uri) => await applyCleanupFile(uri));
		commands.registerCommand('cleanupInFolder', async (uri: Uri) => await applyCleanupFolder(uri));
		authoringCommands.map((cmd: Command) => {
			const command = commands.registerCommand(cmd.command, () => cmd.callback(context));
			context.subscriptions.push(command);
		});
	} catch (error) {
		output.appendLine(
			`[${msTimeValue}] - Error registering commands with vscode extension context: + ${error}`
		);
	}

	output.appendLine(`[${msTimeValue}] - Registered commands with vscode extension context.`);

	// if the user changes markdown.showToolbar in settings.json, display message telling them to reload.
	workspace.onDidChangeConfiguration((e: any) => {
		if (e.affectsConfiguration('markdown.showToolbar')) {
			window
				.showInformationMessage(
					'Your updated configuration has been recorded, but you must reload to see its effects.',
					'Reload'
				)
				.then(res => {
					if (res === 'Reload') {
						commands.executeCommand('workbench.action.reloadWindow');
					}
				});
		}
	});
}

export function installedExtensionsCheck() {
	const { msTimeValue } = generateTimestamp();
	// create a list to house docs extension names, loop through
	const docsExtensions = ['docsmsft.docs-article-templates', 'docsmsft.docs-preview'];
	docsExtensions.forEach(extensionName => {
		const friendlyName = extensionName.split('.').reverse()[0];
		const inactiveMessage = `[${msTimeValue}] - The ${friendlyName} extension is not installed.`;
		checkExtension(extensionName, inactiveMessage);
	});
}

export function setupAutoComplete() {
	let completionItemsMarkdownYamlHeader: CompletionItem[] = [];
	completionItemsMarkdownYamlHeader = completionItemsMarkdownYamlHeader.concat(
		noLocCompletionItemsMarkdownYamlHeader()
	);

	let completionItemsMarkdown: CompletionItem[] = [];
	completionItemsMarkdown = completionItemsMarkdown.concat(noLocCompletionItemsMarkdown());

	let completionItemsYaml: CompletionItem[] = [];
	completionItemsYaml = completionItemsYaml.concat(noLocCompletionItemsYaml());

	return languages.registerCompletionItemProvider('*', {
		provideCompletionItems(document: TextDocument) {
			const editor = window.activeTextEditor;
			if (!editor) {
				noActiveEditorMessage();
				return;
			}

			if (document.languageId === 'markdown') {
				if (isCursorInsideYamlHeader(editor)) {
					return completionItemsMarkdownYamlHeader;
				} else {
					return completionItemsMarkdown;
				}
			} else {
				return completionItemsYaml;
			}
		}
	});
}

// this method is called when your extension is deactivated
export function deactivate() {
	output.appendLine('Deactivating extension.');
}
