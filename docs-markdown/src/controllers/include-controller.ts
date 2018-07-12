"use strict";

import * as vscode from "vscode";
import * as common from "../helper/common";
import * as utilityHelper from "../helper/utility";
import { reporter } from "../telemetry/telemetry";

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
    reporter.sendTelemetryEvent("command", { command: telemetryCommand });

    const path = require("path");
    const dir = require("node-dir");
    const os = require("os");
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common.noActiveEditorMessage();
        return;
    } else {
        const activeFileDir = path.dirname(editor.document.fileName);
        const folderPath = vscode.workspace.rootPath;

        if (!common.isMarkdownFileCheck(editor, false)) {
            return;
        }

        if (!common.hasValidWorkSpaceRootPath(telemetryCommand)) {
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
                } else {
                    // Strip markdown extension from label text.
                    const includeText = qpSelection.label.replace(".md", "");
                    if (os.type() === "Windows_NT") {
                        result = utilityHelper.includeBuilder((path.relative(activeFileDir, path.join
                            (qpSelection.description, qpSelection.label).split("\\").join("\\\\"))), includeText);
                    }
                    if (os.type() === "Darwin") {
                        result = utilityHelper.includeBuilder((path.relative(activeFileDir, path.join
                            (qpSelection.description, qpSelection.label).split("//").join("//"))), includeText);
                    }
                }

                editor.edit((editBuilder) => {
                    editBuilder.insert(position, result.replace(/\\/g, "/"));
                });
            });
        });
    }
}
