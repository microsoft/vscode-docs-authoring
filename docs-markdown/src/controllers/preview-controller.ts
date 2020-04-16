"use strict";

import * as vscode from "vscode";
import { checkExtension, generateTimestamp, getOSPlatform, isMarkdownFileCheck, isValidEditor, noActiveEditorMessage } from "../helper/common";
import { sendTelemetryData } from "../helper/telemetry";

let telemetryCommand: string = "previewTopic";

export function previewTopicCommand() {
    const commands = [
        { command: previewTopic.name, callback: previewTopic },
        { command: seoPreview.name, callback: seoPreview },
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
    sendTelemetryData(telemetryCommand, "");
}

export function seoPreview() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    } else {
        if (!isValidEditor(editor, false, "preview seo")) {
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
                vscode.commands.executeCommand("markdown.seoPreview");
            } else {
                vscode.commands.executeCommand("docs.seoPreview");
            }
        }
    }
    telemetryCommand = "docs.seoPreview";
    sendTelemetryData(telemetryCommand, "");
}
