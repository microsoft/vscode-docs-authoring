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
    const extensionName = "docsmsft.docs-preview";
    const { msTimeValue } = common.generateTimestamp();
    const friendlyName = "docsmsft.docs-preview".split(".").reverse()[0];
    const inactiveMessage = `[${msTimeValue}] - The ${friendlyName} extension is not installed.`;
    if (common.checkExtension(extensionName, inactiveMessage)) {
        if (osPlatform === "win32") {
            vscode.commands.executeCommand("docs.showPreviewToSide");
        } else {
            vscode.commands.executeCommand("markdown.showPreviewToSide");
        }
    }
}
