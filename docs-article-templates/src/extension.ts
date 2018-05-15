"use strict";

import * as vscode from "vscode";
import { applyTemplateCommand } from "./controllers/template-controller";
import { postError } from "./helper/common";
import { Reporter } from "./telemetry/telemetry";

export function activate(context: vscode.ExtensionContext) {
    // Creates an array of commands from each command file.
    const TemplateCommands: any = [];
    applyTemplateCommand().forEach((cmd) => TemplateCommands.push(cmd));

    // Telemetry
    context.subscriptions.push(new Reporter(context));

    try {
        TemplateCommands.map((cmd: any) => {
            const commandName = cmd.command;
            const command = vscode.commands.registerCommand(commandName, cmd.callback);
            context.subscriptions.push(command);
        });
    } catch (error) {
        // tslint:disable-next-line:no-console
        console.log("Error registering commands with vscode extension context: " + error);
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
    // tslint:disable-next-line:no-console
    console.log("Deactivating extension.");
}
