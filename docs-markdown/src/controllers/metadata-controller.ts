"use strict";

import * as fs from "fs";
import * as path from "path";
import * as glob from "glob";

import { commands, Selection, TextEditor, window, workspace } from "vscode";
import { isMarkdownFileCheck, noActiveEditorMessage, sendTelemetryData } from "../helper/common";

export function insertMetadataCommands() {
    return [
        { command: updateMetadataDate.name, callback: updateMetadataDate },
        { command: updateAllMetadataValues.name, callback: updateAllMetadataValues },
    ];
}

interface IDocFxMetadata {
    build: {
        fileMetadata?: {
            "author"?: {
                [glob: string]: string,
            };
            "ms.author"?: {
                [glob: string]: string,
            };
            "ms.service"?: {
                [glob: string]: string,
            };
            "ms.subservice"?: {
                [glob: string]: string,
            };
        };
    };
}

interface ReplacementFormat {
    format: string;
    value: string;
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
        const replacements = await getMetadataReplacements(editor);
        if (replacements) {
            metadataExpressions.forEach((exp) => {
                if (exp) {
                    global.console.log(exp);
                }
            });
        }
    }
}

async function getMetadataReplacements(editor: TextEditor): Promise<ReplacementFormat[]> {
    const folder = workspace.getWorkspaceFolder(editor.document.uri);
    if (folder) {
        const docFxJson = tryFindDocFxJsonFile(folder.uri.fsPath);
        if (!!docFxJson && fs.existsSync(docFxJson)) {
            const jsonBuffer = fs.readFileSync(docFxJson);
            const metadata = JSON.parse(jsonBuffer.toString()) as IDocFxMetadata;
            if (metadata && metadata.build && metadata.build.fileMetadata) {
                return [];
            }
        }
    }
    // const fileName = editor.document.fileName;

    return [];
}

function tryFindDocFxJsonFile(rootPath: string) {
    const docFxJson = path.resolve(rootPath, "docfx.json");
    const exists = fs.existsSync(docFxJson);
    if (exists) {
        return docFxJson;
    } else {
        const files = glob.sync("**/docfx.json", {
            cwd: rootPath,
        });

        if (files && files.length === 1) {
            return path.join(rootPath, files[0]);
        }
    }

    return undefined;
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
        let wasEdited = false;
        if (result !== null && result.length) {
            const match = result[0];
            if (match) {
                const index = result.index;
                wasEdited = await editor.edit((builder) => {
                    const startPosition = editor.document.positionAt(index);
                    const endPosition = editor.document.positionAt(index + match.length);
                    const selection = new Selection(startPosition, endPosition);

                    builder.replace(
                        selection,
                        `ms.date: ${toShortDate(new Date())}`);
                });
            }
        }

        if (wasEdited) {
            saveAndSendTelemetry();
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
