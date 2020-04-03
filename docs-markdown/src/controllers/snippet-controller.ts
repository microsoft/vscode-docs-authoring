"use strict";

import { readdirSync, statSync } from "graceful-fs";
import { join, resolve } from "path";
import { QuickPickItem, window, workspace } from "vscode";
import { hasValidWorkSpaceRootPath, isMarkdownFileCheck, isValidEditor, noActiveEditorMessage } from "../helper/common";
import { sendTelemetryData } from "../helper/telemetry";
import { search } from "../helper/utility";
// tslint:disable: no-var-requires
const fs = require("fs").promises;
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

    window.showQuickPick(scopeOptions).then(async (selection) => {
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
                let subDirectories: string[] = [];
                subDirectories = getSubDirectories(folderPath, [".git", ".github", ".vscode", ".vs", "node_module", "media", "breadcrumb", "includes"], subDirectories);

                const dirOptions: QuickPickItem[] = [];

                subDirectories.forEach((subDir) => {
                    dirOptions.push({ label: subDir, description: "sub directory" });
                });

                window.showQuickPick(dirOptions).then((directory) => {
                    if (directory) {
                        search(editor, selected, directory.label);
                    }
                });
                break;
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
    const openPublishingFile = await readFile(openPublishingFilePath, "utf8");
    const openPublishingJson = JSON.parse(openPublishingFile);
    return openPublishingJson.dependent_repositories;
}
function getSubDirectories(dir: any, ignoreFiles: string[], fileList: string[]) {
    const files = readdirSync(dir);
    for (const file of files) {
        const stat = statSync(join(dir, file));
        if (stat.isDirectory()) {
            const filePath: string = join(dir, file);
            if (!ignoreFiles.some((ignore) => filePath.includes(ignore))) {
                fileList.push(filePath);
                fileList = getSubDirectories(join(dir, file), ignoreFiles, fileList);
            }
        }
    }
    return fileList;
}
