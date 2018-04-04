"use strict";

import * as vscode from "vscode";
import * as common from "../helper/common";
import { reporter } from "../telemetry/telemetry";

const telemetryCommand: string = "previewTopic";

export function previewTopicCommand() {
    const commands = [
        { command: previewTopic.name, callback: previewTopic },
    ];
    return commands;
}

export function previewTopic() {
    reporter.sendTelemetryEvent("command", { command: telemetryCommand });

    const editor = vscode.window.activeTextEditor;

    if (!common.isValidEditor(editor, false, "preview topic")) {
        return;
    }

    if (!common.isMarkdownFileCheck(editor, false)) {
        return;
    }

    const osPlatform = common.getOSPlatform();
    if (osPlatform === "win32") {
        vscode.commands.executeCommand("DocFX.showDfmPreviewToSide").then(
            // tslint:disable-next-line:no-console
            (result) => console.log("preview launched."),
            (err) => vscode.window.showErrorMessage("DocFX preview extension not installed or disabled."));
    } else {
        vscode.commands.executeCommand('markdown.showPreviewToSide');
    }

}
