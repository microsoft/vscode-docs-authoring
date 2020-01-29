"use strict";

import * as fs from "fs";
import * as glob from "glob";
import * as path from "path";

import { commands, Selection, TextEditor, window, workspace, TextEdit } from "vscode";
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

type MetadataType = "author" | "ms.author" | "ms.date" | "ms.service" | "ms.subservice";

interface Replacement {
    selection: Selection;
    value: string;
}

type Replacements = Replacement[];

class ReplacementFormat {
    constructor(
        readonly type: MetadataType,
        private readonly value: string) {
    }

    public toReplacementString() {
        return `${this.type}: ${this.value}`;
    }
}

const authorRegex = /\Aauthor:\s*\b(.+?)$/mi;
const msAuthorRegex = /ms.author:\s*\b(.+?)$/mi;
const msDateRegex = /ms.date:\s*\b(.+?)$/mi;
const msServiceRegex = /ms.service:\s*\b(.+?)$/mi;
const msSubserviceRegex = /ms.subservice:\s*\b(.+?)$/mi;

const metadataExpressions: Map<MetadataType, RegExp> = new Map([
    ["author", authorRegex],
    ["ms.author", msAuthorRegex],
    ["ms.date", msDateRegex],
    ["ms.service", msServiceRegex],
    ["ms.subservice", msSubserviceRegex],
]);

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
        const replacementFormats = await getMetadataReplacements(editor);
        if (replacementFormats) {
            const replacements: Replacements = [];
            for (let i = 0; i < replacementFormats.length; ++i) {
                const replacementFormat = replacementFormats[i];
                if (replacementFormat) {
                    const expression = metadataExpressions.get(replacementFormat.type);
                    const replacement = findReplacement(editor, content, replacementFormat.toReplacementString(), expression);
                    if (replacement) {
                        replacements.push(replacement);
                    }
                }
            }

            applyReplacements(replacements, editor);
            saveAndSendTelemetry();
        }
    }
}

function findReplacement(editor: TextEditor, content: string, value: string, expression?: RegExp): Replacement | undefined {
    const result = expression ? expression.exec(content) : null;
    if (result !== null && result.length) {
        const match = result[0];
        if (match) {
            const index = result.index;
            const startPosition = editor.document.positionAt(index);
            const endPosition = editor.document.positionAt(index + match.length);
            const selection = new Selection(startPosition, endPosition);

            return { selection, value };
        }
    }

    return undefined;
}

function applyReplacements(replacements: Replacements, editor: TextEditor) {
    if (replacements) {
        replacements.forEach(async (replacement) => {
            await editor.edit((builder) => {
                builder.replace(
                    replacement.selection,
                    replacement.value);
            });
        });
    }
}

async function getMetadataReplacements(editor: TextEditor): Promise<ReplacementFormat[]> {
    const folder = workspace.getWorkspaceFolder(editor.document.uri);
    if (folder) {
        // Read the DocFX.json file, search for metadata defaults.
        const docFxJson = tryFindDocFxJsonFile(folder.uri.fsPath);
        if (!!docFxJson && fs.existsSync(docFxJson)) {
            const jsonBuffer = fs.readFileSync(docFxJson);
            const metadata = JSON.parse(jsonBuffer.toString()) as IDocFxMetadata;
            if (metadata && metadata.build && metadata.build.fileMetadata) {
                const replacements: ReplacementFormat[] = [];
                const fsPath = editor.document.uri.fsPath;
                const fileMetadata = metadata.build.fileMetadata;
                const tryAssignReplacement = (filePath: string, type: MetadataType, globs?: { [glob: string]: string }) => {
                    if (globs) {
                        const value = getReplacementValue(globs, filePath);
                        if (value) {
                            replacements.push(new ReplacementFormat(type, value));
                            return true;
                        }
                    }
                    return false;
                };

                // Fall back to templates config, if unable to find author and ms.author
                if (!tryAssignReplacement(fsPath, "author", fileMetadata.author)) {
                    const gitHubId = workspace.getConfiguration("docs.templates").githubid;
                    if (gitHubId) {
                        replacements.push(new ReplacementFormat("author", gitHubId));
                    }
                }
                if (!tryAssignReplacement(fsPath, "ms.author", fileMetadata["ms.author"])) {
                    const alias = workspace.getConfiguration("docs.templates").alias;
                    if (alias) {
                        replacements.push(new ReplacementFormat("ms.author", alias));
                    }
                }
                tryAssignReplacement(fsPath, "ms.service", fileMetadata["ms.service"]);
                tryAssignReplacement(fsPath, "ms.subservice", fileMetadata["ms.subservice"]);

                replacements.push(new ReplacementFormat("ms.date", toShortDate(new Date())));

                return replacements;
            }
        }
    }

    return [];
}

function getReplacementValue(globs: { [glob: string]: string }, fsPath: string): string | undefined {
    if (globs && fsPath) {
        let segments = fsPath.split(path.sep);
        const globKeys = Object.keys(globs).map((key) => ({ key, segments: key.split("/") }));
        const firstSegment = globKeys[0].segments[0];
        segments = segments.slice(segments.indexOf(firstSegment));
        const length = segments.length;
        for (let i = 0; i < globKeys.length; ++i) {
            const globKey = globKeys[i];
            if (length <= globKey.segments.length) {
                let equals = false;
                for (let f = 0; f < segments.length - 1; ++f) {
                    const left = segments[f];
                    const right = globKey.segments[f];
                    if (right.startsWith("*")) {
                        break;
                    }
                    equals = left.toLowerCase() === right.toLowerCase();
                }

                if (equals) {
                    return globs[globKey.key];
                }
            }
        }
    }

    return undefined;
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
        const replacement = findReplacement(editor, content, `ms.date: ${toShortDate(new Date())}`, msDateRegex);
        if (replacement) {
            applyReplacements([replacement], editor);
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
