"use strict";

import * as vscode from "vscode";
import { reporter } from "../telemetry/telemetry";

const telemetryCommand: string = "applyTemplate";

export function applyTemplateCommand() {
    const commands = [
        { command: applyTemplate.name, callback: applyTemplate },
    ];
    return commands;
}

export function applyTemplate() {
    reporter.sendTelemetryEvent("command", { command: telemetryCommand });
    vscode.commands.executeCommand("applyTemplate").then(
        (err) => vscode.window.showErrorMessage("Docs-article-templates extension is not installed or disabled."));
}
