"use strict";

/* The module 'vscode' contains the VS Code extensibility API
 The LoadToolbar function will populate items in the toolbar, but only when the extension loads the first time.
 The common file provides functions that are useful across all commands.
 Logging, Error Handling, VS Code window updates, etc.
*/

import { CancellationToken, commands, CompletionItem, ConfigurationTarget, ExtensionContext, languages, TextDocument, window, workspace, Uri } from "vscode";
import * as vscode from "vscode";
import { insertAlertCommand } from "./controllers/alert-controller";
import { boldFormattingCommand } from "./controllers/bold-controller";
import { applyCleanupCommand, applyCleanupFile, applyCleanupFolder } from "./controllers/cleanup/cleanup-controller";
import { codeFormattingCommand } from "./controllers/code-controller";
import { insertImageCommand } from "./controllers/image-controller";
import { insertIncludeCommand } from "./controllers/include-controller";
import { italicFormattingCommand } from "./controllers/italic-controller";
import { addFrontMatterTitle } from "./controllers/lint-config-controller";
import { insertListsCommands } from "./controllers/list-controller";
import { getMasterRedirectionCommand } from "./controllers/master-redirect-controller";
import { insertLinksAndMediaCommands } from "./controllers/media-controller";
import { insertMetadataCommands } from "./controllers/metadata-controller";
import { noLocCompletionItemsMarkdown, noLocCompletionItemsMarkdownYamlHeader, noLocCompletionItemsYaml, noLocTextCommand } from "./controllers/no-loc-controller";
import { previewTopicCommand } from "./controllers/preview-controller";
import { quickPickMenuCommand } from "./controllers/quick-pick-menu-controller";
import { insertRowsAndColumnsCommand } from "./controllers/row-columns-controller";
import { insertSnippetCommand } from "./controllers/snippet-controller";
import { insertTableCommand } from "./controllers/table-controller";
import { applyXrefCommand } from "./controllers/xref-controller";
import { yamlCommands } from "./controllers/yaml-controller";
import { checkExtension, extractDocumentLink, generateTimestamp, matchAll, noActiveEditorMessage } from "./helper/common";
import { insertLanguageCommands, markdownCodeActionProvider, markdownCompletionItemsProvider } from "./helper/highlight-langs";
import { Reporter } from "./helper/telemetry";
import { UiHelper } from "./helper/ui";
import { isCursorInsideYamlHeader } from "./helper/yaml-metadata";
import { insertSortSelectionCommands } from "./controllers/sort-controller";
import { replaceSmartQuotes } from "./helper/utility";

export const output = window.createOutputChannel("docs-markdown");
export let extensionPath: string;

/**
 * Provides the commands to the extension. This method is called when extension is activated.
 * Extension is activated the very first time the command is executed.
 * preview commands -
 * formatting commands -
 *
 * param {vscode.ExtensionContext} the context the extension runs in, provided by vscode on activation of the extension.
 */
export function activate(context: ExtensionContext) {
    extensionPath = context.extensionPath;
    context.subscriptions.push(new Reporter(context));
    const { msTimeValue } = generateTimestamp();
    output.appendLine(`[${msTimeValue}] - Activating docs markdown extension.`);

    // Places "Docs Markdown Authoring" into the Toolbar
    new UiHelper().LoadToolbar();

    // check for docs extensions
    installedExtensionsCheck();

    // Markdownlint custom rule check
    checkMarkdownlintCustomProperty();

    // Update markdownlint.config to fix MD025 issue
    addFrontMatterTitle();

    // Creates an array of commands from each command file.
    const AuthoringCommands: any = [];
    insertAlertCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    insertIncludeCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    insertLinksAndMediaCommands().forEach((cmd) => AuthoringCommands.push(cmd));
    insertListsCommands().forEach((cmd) => AuthoringCommands.push(cmd));
    insertSnippetCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    insertTableCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    boldFormattingCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    codeFormattingCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    italicFormattingCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    quickPickMenuCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    previewTopicCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    getMasterRedirectionCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    applyCleanupCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    applyXrefCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    yamlCommands().forEach((cmd) => AuthoringCommands.push(cmd));
    noLocTextCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    insertRowsAndColumnsCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    insertImageCommand().forEach((cmd) => AuthoringCommands.push(cmd));
    insertMetadataCommands().forEach((cmd) => AuthoringCommands.push(cmd));
    insertSortSelectionCommands().forEach((cmd) => AuthoringCommands.push(cmd));
    insertLanguageCommands().forEach((cmd) => AuthoringCommands.push(cmd));
    // Autocomplete
    context.subscriptions.push(setupAutoComplete());
    vscode.languages.registerDocumentLinkProvider({ language: "markdown" }, {
        provideDocumentLinks(document: TextDocument, token: CancellationToken) {
            const IMAGE_SOURCE_RE = /source="(.*?)"/gm;
            const text = document.getText();
            const results: vscode.DocumentLink[] = [];
            for (const match of matchAll(IMAGE_SOURCE_RE, text)) {
                const matchLink = extractDocumentLink(document, match[1], match.index);
                if (matchLink) {
                    results.push(matchLink);
                }
            }
            return results;
        },
    });

    vscode.languages.registerCompletionItemProvider("markdown", markdownCompletionItemsProvider, "`");
    vscode.languages.registerCodeActionsProvider("markdown", markdownCodeActionProvider);

    // When the document changes, search and replace smart quotes if found.
    vscode.workspace.onDidChangeTextDocument(replaceSmartQuotes);

    // Telemetry
    context.subscriptions.push(new Reporter(context));

    // Attempts the registration of commands with VS Code and then add them to the extension context.
    try {
        vscode.commands.registerCommand("cleanupFile", async (uri: Uri) => {
            await applyCleanupFile(uri);
        });
        vscode.commands.registerCommand("cleanupInFolder", async (uri: Uri) => {
            await applyCleanupFolder(uri);
        });
        AuthoringCommands.map((cmd: any) => {
            const commandName = cmd.command;
            const command = commands.registerCommand(commandName, cmd.callback);
            context.subscriptions.push(command);
        });
    } catch (error) {
        output.appendLine(`[${msTimeValue}] - Error registering commands with vscode extension context: + ${error}`);
    }

    output.appendLine(`[${msTimeValue}] - Registered commands with vscode extension context.`);

    // if the user changes markdown.showToolbar in settings.json, display message telling them to reload.
    workspace.onDidChangeConfiguration((e: any) => {
        if (e.affectsConfiguration("markdown.showToolbar")) {
            window.showInformationMessage("Your updated configuration has been recorded, but you must reload to see its effects.", "Reload")
                .then((res) => {
                    if (res === "Reload") {
                        commands.executeCommand("workbench.action.reloadWindow");
                    }
                });
        }
    });
}

export function installedExtensionsCheck() {
    const { msTimeValue } = generateTimestamp();
    // create a list to house docs extension names, loop through
    const docsExtensions = [
        "docsmsft.docs-article-templates",
        "docsmsft.docs-preview",
    ];
    docsExtensions.forEach((extensionName) => {
        const friendlyName = extensionName.split(".").reverse()[0];
        const inactiveMessage = `[${msTimeValue}] - The ${friendlyName} extension is not installed.`;
        checkExtension(extensionName, inactiveMessage);
    });
}

/**
 * Method to check for the docs custom markdownlint value.
 * Checks for markdownlint.customRules property.  If markdownlint isn't installed, do nothing.  If markdownlint is installed, check for custom property values.
 */
export function checkMarkdownlintCustomProperty() {
    const { msTimeValue } = generateTimestamp();
    const customProperty = "markdownlint.customRules";
    const customRuleset = "{docsmsft.docs-markdown}/markdownlint-custom-rules/rules.js";
    const customPropertyData: any = workspace.getConfiguration().inspect(customProperty);
    // new list for string comparison and updating.
    const existingUserSettings: string[] = [];
    if (customPropertyData) {
        // if the markdownlint.customRules property exists, pull the global values (user settings) into a string.
        if (customPropertyData.globalValue) {
            const valuesToString = customPropertyData.globalValue.toString();
            const individualValues = valuesToString.split(",");
            individualValues.forEach((setting: string) => {
                existingUserSettings.push(setting);
            });
            // if the customRuleset already exist, write a notification to the output window and continue.
            if (existingUserSettings.indexOf(customRuleset) > -1) {
                output.appendLine(`[${msTimeValue}] - Docs custom markdownlint ruleset is already set at a global level.`);
            } else {
                // if the customRuleset does not exists, append it to the other values in the list if there are any or add it as the only value.
                existingUserSettings.push(customRuleset);
                // update the user settings with new/updated values and notify user.
                // if a user has specific workspace settings for customRules, vscode will use those. this is done so we don't override non-docs repos.
                workspace.getConfiguration().update(customProperty, existingUserSettings, ConfigurationTarget.Global);
                output.appendLine(`[${msTimeValue}] - Docs custom markdownlint ruleset added to user settings.`);
            }
        }
        // if no custom rules exist, create array and add docs custom ruleset.
        if (customPropertyData.globalValue === undefined) {
            const customPropertyValue = [customRuleset];
            workspace.getConfiguration().update(customProperty, customPropertyValue, ConfigurationTarget.Global);
            output.appendLine(`[${msTimeValue}] - Docs custom markdownlint ruleset added to user settings.`);
        }
    }
}

function setupAutoComplete() {
    let completionItemsMarkdownYamlHeader: CompletionItem[] = [];
    completionItemsMarkdownYamlHeader = completionItemsMarkdownYamlHeader.concat(noLocCompletionItemsMarkdownYamlHeader());

    let completionItemsMarkdown: CompletionItem[] = [];
    completionItemsMarkdown = completionItemsMarkdown.concat(
        noLocCompletionItemsMarkdown());

    let completionItemsYaml: CompletionItem[] = [];
    completionItemsYaml = completionItemsYaml.concat(noLocCompletionItemsYaml());

    return languages.registerCompletionItemProvider("*", {
        provideCompletionItems(document: TextDocument) {
            const editor = window.activeTextEditor;
            if (!editor) {
                noActiveEditorMessage();
                return;
            }

            if (document.languageId === "markdown") {
                if (isCursorInsideYamlHeader(editor)) {
                    return completionItemsMarkdownYamlHeader;
                } else {
                    return completionItemsMarkdown;
                }
            } else {
                return completionItemsYaml;
            }
        },
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
    output.appendLine("Deactivating extension.");
}
