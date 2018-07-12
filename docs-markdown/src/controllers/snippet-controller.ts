"use strict";

import * as dir from "node-dir";
import * as vscode from "vscode";
import * as common from "../helper/common";
import * as utilityHelper from "../helper/utility";
import { reporter } from "../telemetry/telemetry";

const telemetryCommand: string = "insertSnippet";
// let dir = require("node-dir");

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
    reporter.sendTelemetryEvent("command", { command: telemetryCommand });

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common.noActiveEditorMessage();
        return;
    } else {
        if (!common.isValidEditor(editor, false, insertSnippet.name)) {
            return;
        }

        if (!common.isMarkdownFileCheck(editor, false)) {
            return;
        }

        if (!common.hasValidWorkSpaceRootPath(telemetryCommand)) {
            return;
        }
    }

    vscode.window.showInputBox({ prompt: "Enter snippet search terms." }).then(searchRepo);
}
// finds the directories to search, passes this and the search term to the search function.
export function searchRepo(searchTerm: any) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common.noActiveEditorMessage();
        return;
    } else {
        const folderPath: any = vscode.workspace.rootPath;
        const selected = editor.selection;
        // There are two kinds of repo searching, whole repo, and scoped folder (both recursive)
        const scopeOptions: vscode.QuickPickItem[] = [];

        scopeOptions.push({ label: "Full Search", description: "Look in all directories for snippet" });
        scopeOptions.push({ label: "Scoped Search", description: "Look in specific directories for snippet" });

        vscode.window.showQuickPick(scopeOptions).then(function searchType(selection) {
            if (!selection) {
                return;
            } else {
                const searchSelection = selection.label;

                if (searchSelection === "Full Search") {
                    utilityHelper.search(editor, selected, searchTerm, folderPath);
                } else {

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
                    });
                }
            }
        });
    }
}
