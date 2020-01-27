"use strict";

import { commands, Selection, window } from "vscode";
import { isMarkdownFileCheck, noActiveEditorMessage, sendTelemetryData } from "../helper/common";

export function insertMetadataCommands() {
    return [
        { command: updateMetadataDate.name, callback: updateMetadataDate },
    ];
}

const authorRegex = /\Aauthor:\s*\b(.+?)$/mi;
const msAuthorRegex = /ms.author:\s*\b(.+?)$/mi;
const msDateRegex = /ms.date:\s*\b(.+?)$/mi;
const msServiceRegex = /ms.service:\s*\b(.+?)$/mi;
const msSubserviceRegex = /ms.subservice:\s*\b(.+?)$/mi;
const metadataExpressions = [
    authorRegex,
    msAuthorRegex,
    msDateRegex,
    msServiceRegex,
    msSubserviceRegex,
];

export async function updateAllMetadataValues() {
    const editor = window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }

    if (!isMarkdownFileCheck(editor, false)) {
        return;
    }

    const content = editor.document.getText();
    if (content) {
        metadataExpressions.forEach((exp) => {

        });
    }
}



export async function updateMetadataDate() {
    const editor = window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }

    if (!isMarkdownFileCheck(editor, false)) {
        return;
    }

    const content = editor.document.getText();
    if (content) {
        const result = msDateRegex.exec(content);
        if (result !== null && result.length) {
            const match = result[0];
            if (match) {
                const index = result.index;
                const wasEdited = await editor.edit((builder) => {
                    const startPosition = editor.document.positionAt(index);
                    const endPosition = editor.document.positionAt(index + match.length);
                    const selection = new Selection(startPosition, endPosition);

                    builder.replace(
                        selection,
                        `ms.date: ${toShortDate(new Date())}`);
                });

                if (wasEdited) {
                    saveAndSendTelemetry();
                }
            }
        }
    }
}

async function saveAndSendTelemetry() {
    await commands.executeCommand("workbench.action.files.save");

    const telemetryCommand = "updateMetadata";
    sendTelemetryData(telemetryCommand, updateMetadataDate.name);
}

function toShortDate(date: Date) {
    const year = date.getFullYear();
    const month = (1 + date.getMonth()).toString();
    const monthStr = month.length > 1 ? month : `0${month}`;
    const day = date.getDate().toString();
    const dayStr = day.length > 1 ? day : `0${day}`;

    return `${monthStr}/${dayStr}/${year}`;
}
