"use strict";

import * as fs from "fs";
import * as dir from "node-dir";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import * as common from "../helper/common";
import * as github from "../helper/github";
import * as metadata from "../helper/user-metadata";
import { reporter } from "../telemetry/telemetry";

const markdownExtensionFilter = [".md"];
const editor = vscode.window.activeTextEditor;
const telemetryCommand: string = "applyTemplate";

export function applyTemplateCommand() {
    const commands = [
        { command: applyTemplate.name, callback: applyTemplate },
    ];
    return commands;
}

export function applyTemplate() {
    // download copy of the template repo and generate current date/time for timestamp.
    github.downloadRepo();
    common.generateTimestamp();

    // create a new markdown file.
    const newFile = vscode.Uri.parse("untitled:" + "New-Topic.md");

    // parse the repo directory for markdown files, sort them and push them to the quick pick menu.
    vscode.workspace.openTextDocument(newFile).then((textDocument: vscode.TextDocument) => {
        vscode.window.showTextDocument(textDocument, 1, false).then((textEditor) => {
            dir.files(github.templateDirectory, (err: any, files: any) => {
                if (err) {
                    common.debug(err);
                    throw err;
                }

                const items: vscode.QuickPickItem[] = [];
                files.sort();

                {
                    files.filter((file: any) => markdownExtensionFilter.indexOf(path.extname(file.toLowerCase()))
                        !== -1).forEach((file: any) => {
                            if (path.basename(file).toLowerCase() !== "readme.md") {
                                items.push({ label: path.basename(file), description: path.dirname(file) });
                            }
                        });
                }
                vscode.window.showQuickPick(items).then((qpSelection) => {
                    if (!qpSelection) {
                        return;
                    } else {
                        const qpFullPath = path.join(qpSelection.description, qpSelection.label);
                        const content = fs.readFileSync(qpFullPath, "utf8");
                        textEditor.edit((edit) => {
                            let updatedContent;
                            const { msDateValue } = common.generateTimestamp();
                            // replace metadata placeholder values with user settings and dynamic values then write template content to new file.
                            if (!metadata.gitHubID && !metadata.alias) {
                                updatedContent = content.replace("{@date}", msDateValue).replace("{github-id}", metadata.missingValue).replace("{ms-alias}", metadata.missingValue);
                                edit.insert(new vscode.Position(0, 0), updatedContent);
                            } else if (!metadata.gitHubID) {
                                updatedContent = content.replace("{@date}", msDateValue).replace("{github-id}", metadata.missingValue).replace("{ms-alias}", metadata.alias);
                                edit.insert(new vscode.Position(0, 0), updatedContent);
                            } else if (!metadata.alias) {
                                updatedContent = content.replace("{@date}", msDateValue).replace("{github-id}", metadata.gitHubID).replace("{ms-alias}", metadata.missingValue);
                                edit.insert(new vscode.Position(0, 0), updatedContent);
                            } else {
                                updatedContent = content.replace("{@date}", msDateValue).replace("{github-id}", metadata.gitHubID).replace("{ms-alias}", metadata.alias);
                                edit.insert(new vscode.Position(0, 0), updatedContent);
                            }
                        });
                    }
                    reporter.sendTelemetryEvent("command", { command: telemetryCommand + "." + qpSelection.label});
                    github.cleanupDownloadFiles();
                });
            }, (error: any) => {
                vscode.window.showWarningMessage(error);
            });
        });
    });
}
