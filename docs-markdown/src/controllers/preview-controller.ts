"use strict";

import * as vscode from "vscode";
import { checkExtension, generateTimestamp, getOSPlatform, getRepoName, isMarkdownFileCheck, isValidEditor, noActiveEditorMessage } from "../helper/common";
import { reporter } from "../helper/telemetry";

const telemetryCommand: string = "previewTopic";

export function previewTopicCommand() {
    const commands = [
        { command: previewTopic.name, callback: previewTopic },
    ];
    return commands;
}

export function previewTopic() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    } else {
        if (!isValidEditor(editor, false, "preview topic")) {
            return;
        }

        if (!isMarkdownFileCheck(editor, false)) {
            return;
        }

        const osPlatform = getOSPlatform();
        const extensionName = "docsmsft.docs-preview";
        const { msTimeValue } = generateTimestamp();
        const friendlyName = "docsmsft.docs-preview".split(".").reverse()[0];
        const inactiveMessage = `[${msTimeValue}] - The ${friendlyName} extension is not installed.`;
        if (checkExtension(extensionName, inactiveMessage)) {
            if (osPlatform === "linux") {
                vscode.commands.executeCommand("markdown.showPreviewToSide");
            } else {
                vscode.commands.executeCommand("docs.showPreviewToSide");
            }
        }
    }
    const workspaceUri = editor.document.uri;
    const activeRepo = getRepoName(workspaceUri);
    const telemetryProperties = activeRepo ? { repo_name: activeRepo } : { repo_name: "" };
    reporter.sendTelemetryEvent(telemetryCommand, telemetryProperties);
}
