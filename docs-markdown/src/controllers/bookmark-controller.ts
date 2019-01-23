"use strict";

import * as vscode from "vscode";
import { insertContentToEditor, noActiveEditorMessage } from "../helper/common";
import { addbookmarkIdentifier, bookmarkBuilder } from "../helper/utility";
import { reporter } from "../telemetry/telemetry";

const telemetryCommand: string = "insertBookmark";
const markdownExtensionFilter = [".md"];

export const headingTextRegex = /^ {0,3}(#{2,6})(.*)/gm;
export const yamlTextRegex = /^-{3}\s*\r?\n([\s\S]*?)-{3}\s*\r?\n([\s\S]*)/;

export function insertBookmarkCommands() {
    const commands = [
        { command: insertBookmarkExternal.name, callback: insertBookmarkExternal },
        { command: insertBookmarkInternal.name, callback: insertBookmarkInternal },
    ];
    return commands;
}

/**
 * Creates a bookmark to another file at the cursor position
 */
export function insertBookmarkExternal() {
    reporter.sendTelemetryEvent("command", { command: telemetryCommand + ".external" });

    // Modules used to access file system
    const path = require("path");
    const dir = require("node-dir");
    const os = require("os");
    const fs = require("fs");

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }
    const activeFileName = editor.document.fileName;
    const activeFilePath = path.dirname(activeFileName);

    // Check to see if the active file has been saved.  If it has not been saved, warn the user.
    // The user will still be allowed to add a link but it the relative path will not be resolved.
    const fileExists = require("file-exists");

    if (!fileExists(activeFileName)) {
        vscode.window.showWarningMessage(`${activeFilePath} is not saved.  Cannot accurately resolve path to create link.`);
        return;
    }
    const folderPath = vscode.workspace.rootPath;

    // recursively get all the files from the root folder
    dir.files(folderPath, (err: any, files: any) => {
        if (err) {
            vscode.window.showErrorMessage(err);
            throw err;
        }

        const items: vscode.QuickPickItem[] = [];
        files.sort();
        files.filter((file: any) => markdownExtensionFilter.indexOf(path.extname
            (file.toLowerCase())) !== -1).forEach((file: any) => {
                items.push({ label: path.basename(file), description: path.dirname(file) });
            });

        // show the quick pick menu
        const selectionPick = vscode.window.showQuickPick(items);
        selectionPick.then((qpSelection) => {
            let result = "";
            let bookmark = "";

            // gets the content for chosen file with utf-8 format
            let fullPath;

            if (!qpSelection) {
                return;
            }

            if (os.type() === "Windows_NT") {
                fullPath = qpSelection.description + "\\" + qpSelection.label;
            } else {
                fullPath = qpSelection.description + "//" + qpSelection.label;
            }

            const content = fs.readFileSync(fullPath, "utf8");
            const headings = content.match(headingTextRegex);

            if (!headings) {
                vscode.window.showErrorMessage("No headings found in file, cannot insert bookmark!");
                return;
            }

            const adjustedHeadingsItems: vscode.QuickPickItem[] = [];
            const adjustedHeadings = addbookmarkIdentifier(headings);
            adjustedHeadings.forEach((adjustedHeading: string) => {
                adjustedHeadingsItems.push({ label: adjustedHeading, detail: " " });
            });

            vscode.window.showQuickPick(adjustedHeadingsItems).then((headingSelection) => {
                if (!headingSelection) {
                    return;
                }
                if (path.resolve(activeFilePath) === path.resolve(qpSelection.label.split("\\").join("\\\\")) && path.basename(activeFileName) === qpSelection.label) {
                    bookmark = bookmarkBuilder(editor.document.getText(editor.selection), headingSelection.label, "");
                } else {
                    if (os.type() === "Windows_NT") {
                        result = path.relative(activeFilePath, path.join
                            (qpSelection.description, qpSelection.label).split("\\").join("\\\\"));
                    } else {
                        result = path.relative(activeFilePath, path.join
                            (qpSelection.description, qpSelection.label).split("//").join("//"));
                    }
                    bookmark = bookmarkBuilder
                        (editor.document.getText(editor.selection), headingSelection.label, result);
                }
                insertContentToEditor(editor, "InsertBookmarkExternal", bookmark, true, editor.selection);

            });
        });
    });
}

/**
 * Creates a bookmark at the current cursor position
 */
export function insertBookmarkInternal() {
    reporter.sendTelemetryEvent("command", { command: telemetryCommand + ".internal" });
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const content = editor.document.getText();
    const headings = content.match(headingTextRegex);
    if (!headings) {
        vscode.window.showErrorMessage("No headings found in file, cannot insert bookmark!");
        return;
    }

    // put number to duplicate names in position order
    const adjustedHeadings = addbookmarkIdentifier(headings);
    const adjustedHeadingsItems: vscode.QuickPickItem[] = [];
    adjustedHeadings.forEach((heading: string) => {
        adjustedHeadingsItems.push({ label: heading, detail: " " });
    });

    vscode.window.showQuickPick(adjustedHeadingsItems).then((headingSelection) => {
        if (!headingSelection) {
            return;
        }
        const bookmark = bookmarkBuilder(editor.document.getText(editor.selection), headingSelection.label, "");
        insertContentToEditor(editor, "InsertBookmarkInternal", bookmark, true, editor.selection);
    });
}
