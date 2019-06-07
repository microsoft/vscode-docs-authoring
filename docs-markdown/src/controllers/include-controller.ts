"use strict";

import * as vscode from "vscode";
import { hasValidWorkSpaceRootPath, isMarkdownFileCheck, noActiveEditorMessage, sendTelemetryData } from "../helper/common";
import { includeBuilder } from "../helper/utility";

const telemetryCommand: string = "insertInclude";
const markdownExtensionFilter = [".md"];

export function insertIncludeCommand() {
    const commands = [
        { command: insertInclude.name, callback: insertInclude },
    ];
    return commands;
}

/**
 * transforms the current selection into an include.
 */
export function insertInclude() {
    const path = require("path");
    const dir = require("node-dir");
    const os = require("os");
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }
    const activeFileDir = path.dirname(editor.document.fileName);
    const folderPath = vscode.workspace.rootPath;

    if (!isMarkdownFileCheck(editor, false)) {
        return;
    }

    if (!hasValidWorkSpaceRootPath(telemetryCommand)) {
        return;
    }

    if (folderPath == null) {
        return;
    }

    // recursively get all the files from the root folder
    dir.files(folderPath, (err: any, files: any) => {
        if (err) {
            throw err;
        }

        const items: vscode.QuickPickItem[] = [];
        files.sort();

        {
            files.filter((file: any) => markdownExtensionFilter.indexOf(path.extname(file.toLowerCase()))
                !== -1).forEach((file: any) => {
                    items.push({ label: path.basename(file), description: path.dirname(file) });
                });
        }

        // show the quick pick menu
        vscode.window.showQuickPick(items).then((qpSelection) => {
            let result: string;
            const position = editor.selection.active;

            // replace the selected text with the properly formatted link
            if (!qpSelection) {
                return;
            }
            // Strip markdown extension from label text.
            const includeText = qpSelection.label.replace(".md", "");
            if (os.type() === "Windows_NT") {
                result = includeBuilder((path.relative(activeFileDir, path.join
                    (qpSelection.description, qpSelection.label).split("\\").join("\\\\"))), includeText);
            }
            if (os.type() === "Darwin") {
                result = includeBuilder((path.relative(activeFileDir, path.join
                    (qpSelection.description, qpSelection.label).split("//").join("//"))), includeText);
            }

            editor.edit((editBuilder) => {
                editBuilder.insert(position, result.replace(/\\/g, "/"));
            });
        });
    });
    sendTelemetryData(telemetryCommand, "");
}
