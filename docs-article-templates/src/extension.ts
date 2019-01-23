"use strict";

import * as vscode from "vscode";
import { applyTemplateCommand } from "./controllers/template-controller";
import { postError } from "./helper/common";

export const output = vscode.window.createOutputChannel("docs-article-templates");

export function activate(context: vscode.ExtensionContext) {
    // Creates an array of commands from each command file.
    const TemplateCommands: any = [];
    applyTemplateCommand().forEach((cmd) => TemplateCommands.push(cmd));

    try {
        TemplateCommands.map((cmd: any) => {
            const commandName = cmd.command;
            const command = vscode.commands.registerCommand(commandName, cmd.callback);
            context.subscriptions.push(command);
        });
    } catch (error) {
        output.appendLine("Error registering commands with vscode extension context: " + error);
    }
    // if the user changes markdown.showToolbar in settings.json, display message telling them to reload.
    vscode.workspace.onDidChangeConfiguration((e: any) => {

        if (e.affectsConfiguration("docs.templates.githubID" || "docs.templates.alias")) {

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
    output.appendLine("Deactivating extension.");
}
