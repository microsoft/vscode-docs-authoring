"use strict";

import { commands, ExtensionContext, window, workspace } from "vscode";
import { applyTemplateCommand } from "./controllers/template-controller";
import { showStatusMessage } from "./helper/common";
import { Reporter } from "./helper/telemetry";

export const output = window.createOutputChannel("docs-article-templates");
export let extensionPath: string;

export function activate(context: ExtensionContext) {
    extensionPath = context.extensionPath;
    context.subscriptions.push(new Reporter(context));
    // Creates an array of commands from each command file.
    const TemplateCommands: any = [];
    applyTemplateCommand().forEach((cmd) => TemplateCommands.push(cmd));

    try {
        TemplateCommands.map((cmd: any) => {
            const commandName = cmd.command;
            const command = commands.registerCommand(commandName, cmd.callback);
            context.subscriptions.push(command);
        });
    } catch (error) {
        showStatusMessage(`Error registering commands with vscode extension context: ${error}`);
    }
    // if the user changes markdown.showToolbar in settings.json, display message telling them to reload.
    workspace.onDidChangeConfiguration((e: any) => {

        if (e.affectsConfiguration("docs.templates.githubID" || "docs.templates.alias" || "docs.templates.learn_repo_id" || "docs.templates.learn_product"
            || "docs.templates.learn_level" || "docs.templates.learn_role")) {

            window.showInformationMessage("Your updated configuration has been recorded, but you must reload to see its effects.", "Reload")
                .then((res) => {
                    if (res === "Reload") {
                        commands.executeCommand("workbench.action.reloadWindow");
                    }
                });
        }
    });
}

// this method is called when your extension is deactivated
export function deactivate() {
    showStatusMessage("Deactivating extension.");
}
