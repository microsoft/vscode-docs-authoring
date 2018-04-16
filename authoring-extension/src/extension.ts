"use strict";

/* The module 'vscode' contains the VS Code extensibility API
 The LoadToolbar function will populate items in the toolbar, but only when the extension loads the first time.
 The common file provides functions that are useful across all commands.
 Logging, Error Handling, VS Code window updates, etc.
*/

import * as vscode from "vscode";
import { insertAlertCommand } from "./controllers/alert-controller";
import { boldFormattingCommand } from "./controllers/bold-controller";
import { codeFormattingCommand } from "./controllers/code-controller";
import { insertIncludeCommand } from "./controllers/include-controller";
import { italicFormattingCommand } from "./controllers/italic-controller";
import { insertListsCommands } from "./controllers/list-controller";
import { insertLinksAndMediaCommands } from "./controllers/media-controller";
import { previewTopicCommand } from "./controllers/preview-controller";
import { quickPickMenuCommand } from "./controllers/quick-pick-menu-controller";
import { insertSnippetCommand } from "./controllers/snippet-controller";
import { insertTableCommand } from "./controllers/table-controller";
import * as log from "./helper/log";
import { UiHelper } from "./helper/ui";
import { Reporter } from "./telemetry/telemetry";

/**
 * Provides the commands to the extension. This method is called when extension is activated.
 * Extension is activated the very first time the command is executed.
 * preview commands -
 * formatting commands -
 *
 * param {vscode.ExtensionContext} the context the extension runs in, provided by vscode on activation of the extension.
 */
export function activate(context: vscode.ExtensionContext) {
    log.debug("Activating Markdown Authoring Extension.");

    // Places "Docs Markdown Authoring" into the Toolbar
    new UiHelper().LoadToolbar();

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

    // Telemetry
    context.subscriptions.push(new Reporter(context));

    // Attempts the registration of commands with VS Code and then add them to the extension context.
    try {
        AuthoringCommands.map((cmd: any) => {
            const commandName = cmd.command;
            const command = vscode.commands.registerCommand(commandName, cmd.callback);
            context.subscriptions.push(command);
        });
    } catch (error) {
        log.error("Error registering commands with vscode extension context: " + error);
    }

    log.debug("Registered commands with vscode extension context.");

    // if the user changes markdown.showToolbar in settings.json, display message telling them to reload.
    vscode.workspace.onDidChangeConfiguration((e: any) => {

        if (e.affectsConfiguration("markdown.showToolbar")) {

            vscode.window.showInformationMessage("Your updated configuration has been recorded, but you must reload to see its effects.", "Reload")
                .then((res) => {
                    if (res === "Reload") {
                        vscode.commands.executeCommand("workbench.action.reloadWindow");
                    }
                });
        }
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
    log.debug("Deactivating Authoring Extension.");
}
