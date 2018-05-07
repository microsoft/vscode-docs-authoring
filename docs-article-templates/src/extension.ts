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

}

// this method is called when your extension is deactivated
export function deactivate() {
    // placeholder comment
}
