"use strict";

import { readFile } from "fs";
import { subdirs } from "node-dir";
import { resolve } from "path";
import { promisify } from "util";
import { QuickPickItem, window, workspace } from "vscode";
import { hasValidWorkSpaceRootPath, isMarkdownFileCheck, isValidEditor, noActiveEditorMessage } from "../helper/common";
import { sendTelemetryData } from "../helper/telemetry";
import { search } from "../helper/utility";

const fileContent = promisify(readFile);
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
    const editor = window.activeTextEditor;
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
    const editor = window.activeTextEditor;
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
    const scopeOptions: QuickPickItem[] = [];

    scopeOptions.push({ label: "Full Search", description: "Look in all directories for snippet" });
    scopeOptions.push({ label: "Scoped Search", description: "Look in specific directories for snippet" });
    scopeOptions.push({ label: "Cross-Repository Reference", description: "Reference GitHub repository" });

    window.showQuickPick(scopeOptions).then(async function searchType(selection) {
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
                subdirs(folderPath, (err: any, subDirs: any) => {
                    if (err) {
                        window.showErrorMessage(err);
                        throw err;
                    }

                    const dirOptions: QuickPickItem[] = [];

                    for (const folders in subDirs) {
                        if (subDirs.hasOwnProperty(folders)) {
                            dirOptions.push({ label: subDirs[folders], description: "sub directory" });
                        }
                    }

                    window.showQuickPick(dirOptions).then((directory) => {
                        if (directory) {
                            search(editor, selected, directory.label);
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
                            const openPublishingOptions: QuickPickItem[] = [];

                            openPublishingRepos.map((repo: { path_to_root: string; url: string; }) => {
                                openPublishingOptions.push({ label: repo.path_to_root, description: repo.url });
                            });
                            window.showQuickPick(openPublishingOptions).then((repo) => {
                                if (repo) {
                                    search(editor, selected, "", "", repo.label);
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
    const openPublishingFile = await fileContent(openPublishingFilePath, "utf8");
    const openPublishingJson = JSON.parse(openPublishingFile);
    return openPublishingJson.dependent_repositories;
}
