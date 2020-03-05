"use strict";

import * as dir from "node-dir";
import * as vscode from "vscode";
import { hasValidWorkSpaceRootPath, isMarkdownFileCheck, isValidEditor, noActiveEditorMessage } from "../helper/common";
import { sendTelemetryData } from "../helper/telemetry";
import { search } from "../helper/utility";
import { workspace } from "vscode";
import { resolve } from "path";
const fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);

const telemetryCommand: string = "insertSnippet";

export function insertSnippetCommand() {
    const commands = [
        { command: insertSnippet.name, callback: insertSnippet },
    ];
    return commands;
}

/**
 * Creates a snippet at the current cursor position.
 */
export function insertSnippet() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }

    if (!isValidEditor(editor, false, insertSnippet.name)) {
        return;
    }

    if (!isMarkdownFileCheck(editor, false)) {
        return;
    }

    if (!hasValidWorkSpaceRootPath(telemetryCommand)) {
        return;
    }
    searchRepo();
    sendTelemetryData(telemetryCommand, "");
}
// finds the directories to search, passes this and the search term to the search function.
export function searchRepo() {
    const editor = vscode.window.activeTextEditor;
    let folderPath: string = "";

    if (!editor) {
        noActiveEditorMessage();
        return;
    }

    if (workspace.workspaceFolders) {
        folderPath = workspace.workspaceFolders[0].uri.fsPath;
    }

    const selected = editor.selection;
    // There are two kinds of repo searching, whole repo, and scoped folder (both recursive)
    const scopeOptions: vscode.QuickPickItem[] = [];

    scopeOptions.push({ label: "Full Search", description: "Look in all directories for snippet" });
    scopeOptions.push({ label: "Scoped Search", description: "Look in specific directories for snippet" });
    scopeOptions.push({ label: "Cross-Repository Reference", description: "Reference GitHub repository" });

    vscode.window.showQuickPick(scopeOptions).then(async function searchType(selection) {
        if (!selection) {
            return;
        }
        const searchSelection = selection.label;

        switch (searchSelection) {
            case "Full Search":
                search(editor, selected, folderPath);
                break;
            case "Scoped Search":
                // gets all subdirectories to populate the scope search function.
                dir.subdirs(folderPath, (err: any, subdirs: any) => {
                    if (err) {
                        vscode.window.showErrorMessage(err);
                        throw err;
                    }

                    const dirOptions: vscode.QuickPickItem[] = [];

                    for (const folders in subdirs) {
                        if (subdirs.hasOwnProperty(folders)) {
                            dirOptions.push({ label: subdirs[folders], description: "sub directory" });
                        }
                    }

                    vscode.window.showQuickPick(dirOptions).then((directory) => {
                        if (directory) {
                            search(editor, selected, directory.label)
                        }
                    });
                });
            default:
                if (workspace) {
                    if (workspace.workspaceFolders) {
                        const repoRoot = workspace.workspaceFolders[0].uri.fsPath;
                        // get openpublishing.json at root
                        const openPublishingRepos = await getOpenPublishingFile(repoRoot);
                        if (openPublishingRepos) {
                            const openPublishingOptions: vscode.QuickPickItem[] = [];

                            openPublishingRepos.map((repo: { path_to_root: string; url: string; }) => {
                                openPublishingOptions.push({ label: repo.path_to_root, description: repo.url })
                            });
                            vscode.window.showQuickPick(openPublishingOptions).then((repo) => {
                                if (repo) {
                                    search(editor, selected, "", "", repo.label)
                                }
                            });
                        }
                    }
                }
                break;

        }
    });
}

async function getOpenPublishingFile(repoRoot: string) {
    const openPublishingFilePath = resolve(repoRoot, ".openpublishing.publish.config.json");
    const openPublishingFile = await readFile(openPublishingFilePath, "utf8");
    // filePath = filePath.replace(ROOTPATH_RE, repoRoot);
    const openPublishingJson = JSON.parse(openPublishingFile);
    return openPublishingJson.dependent_repositories;
}
