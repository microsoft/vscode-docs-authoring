"use strict";

import * as vscode from "vscode";
import * as common from "../helper/common";
import * as log from "../helper/log";
import * as utilityHelper from "../helper/utility";
import { reporter } from "../telemetry/telemetry";

const telemetryCommand: string = "insertBookmark";
const markdownExtensionFilter = [".md"];

export const headingTextRegex = /^ {0,3}(#{1,6})(.*)/gm;
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
        common.noActiveEditorMessage();
        return;
    } else {
        const activeFileName = editor.document.fileName;
        const activeFilePath = path.dirname(activeFileName);

        // Check to see if the active file has been saved.  If it has not been saved, warn the user.
        // The user will still be allowed to add a link but it the relative path will not be resolved.
        const fileExists = require("file-exists");

        if (!fileExists(activeFileName)) {
            vscode.window.showWarningMessage(activeFilePath +
                " is not saved.  Cannot accurately resolve path to create link.");
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
                } else {
                    if (os.type() === "Windows_NT") {
                        fullPath = qpSelection.description + "\\" + qpSelection.label;
                    } else {
                        fullPath = qpSelection.description + "//" + qpSelection.label;
                    }

                    const content = fs.readFileSync(fullPath, "utf8");
                    const headings = content.match(headingTextRegex);
                    if (!headings) {
                        log.debug("InsertBookmarkExternal: No headings found in file " + fullPath);
                        vscode.window.showErrorMessage("No headings found in file, cannot insert bookmark!");
                        return;
                    }

                    const adjustedHeadings = utilityHelper.addbookmarkIdentifier(headings);
                    vscode.window.showQuickPick(adjustedHeadings).then((headingSelection) => {
                        if (!qpSelection.description) {
                            return;
                        } else {
                            if (path.resolve(activeFilePath) === path.resolve(qpSelection.description.split("\\").join("\\\\")) && path.basename(activeFileName) === qpSelection.label) {
                                bookmark = utilityHelper.bookmarkBuilder(editor.document.getText(editor.selection), headingSelection, "");
                            } else {
                                if (os.type() === "Windows_NT") {
                                    result = path.relative(activeFilePath, path.join
                                        (qpSelection.description, qpSelection.label).split("\\").join("\\\\"));
                                } else {
                                    result = path.relative(activeFilePath, path.join
                                        (qpSelection.description, qpSelection.label).split("//").join("//"));
                                }
                                bookmark = utilityHelper.bookmarkBuilder
                                    (editor.document.getText(editor.selection), headingSelection, result);
                            }
                            common.insertContentToEditor(editor, "InsertBookmarkExternal", bookmark, true, editor.selection);
                        }
                    });
                }
            });
        });
    }
}

/**
 * Creates a bookmark at the current cursor position
 */
export function insertBookmarkInternal() {
    reporter.sendTelemetryEvent("command", { command: telemetryCommand + ".internal" });
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    } else {
        const content = editor.document.getText();
        const items = content.match(headingTextRegex);
        if (!items) {
            log.debug("InsertBookmarkInternal: No headings found in file");
            vscode.window.showErrorMessage("No headings found in file, cannot insert bookmark!");
            return;
        }

        // put number to duplicate names in position order
        const adjustedItems = utilityHelper.addbookmarkIdentifier(items);
        vscode.window.showQuickPick(adjustedItems).then((qpSelection) => {
            log.debug("Inserting internal bookmark at line " + editor.selection.start.line
                + " and character " + editor.selection.start.character);
            const bookmark = utilityHelper.bookmarkBuilder(editor.document.getText(editor.selection), qpSelection, "");
            common.insertContentToEditor(editor, "InsertBookmarkInternal", bookmark, true, editor.selection);
        });
    }
}
