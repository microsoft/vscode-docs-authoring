"use strict";

import * as glob from "glob";
import * as os from "os";
import * as path from "path";
import { QuickPickItem, window, workspace } from "vscode";
import { hasValidWorkSpaceRootPath, isMarkdownFileCheck, noActiveEditorMessage } from "../helper/common";
import { sendTelemetryData } from "../helper/telemetry";
import { includeBuilder } from "../helper/utility";

const telemetryCommand: string = "insertInclude";
const markdownExtension = ".md";

export function insertIncludeCommand() {
    const commands = [
        { command: insertInclude.name, callback: insertInclude },
    ];
    return commands;
}

/**
 * transforms the current selection into an include.
 */
export async function insertInclude() {
    const editor = window.activeTextEditor;

    if (!editor) {
        noActiveEditorMessage();
        return;
    }

    const activeFileDir = path.dirname(editor.document.fileName);
    let folderPath: string = "";

    if (workspace.workspaceFolders) {
        folderPath = workspace.workspaceFolders[0].uri.fsPath;
    }

    if (!isMarkdownFileCheck(editor, false)) {
        return;
    }

    if (!hasValidWorkSpaceRootPath(telemetryCommand)) {
        return;
    }

    if (!folderPath) {
        return;
    }

    await glob("**/includes/**/*.md", { cwd: folderPath, nocase: true, realpath: true }, async (er: any, files: string[]) => {
        const items: QuickPickItem[] = [];

        files.forEach((file: string) => items.push({
            description: path.dirname(file),
            label: path.basename(file),
        }));

        const descSelector = (item: QuickPickItem) => item && item.description || "";
        items.sort((a, b) => {
            const [aDesc, bDesc] = [descSelector(a), descSelector(b)];
            if (aDesc < bDesc) {
                return -1;
            }
            if (aDesc > bDesc) {
                return 1;
            }

            return 0;
        });

        // show the quick pick menu
        const qpSelection = await window.showQuickPick(items);

        // replace the selected text with the properly formatted link
        if (!qpSelection) {
            return;
        }

        let result: string;
        const position = editor.selection.active;

        // strip markdown extension from label text.
        const includeText = qpSelection.label.replace(markdownExtension, "");
        switch (os.type()) {
            case "Windows_NT":
                result = includeBuilder((path.relative(activeFileDir, path.join
                    (qpSelection.description || "Unknown", qpSelection.label).split("\\").join("\\\\"))), includeText);
                break;
            case "Darwin":
                result = includeBuilder((path.relative(activeFileDir, path.join
                    (qpSelection.description || "Unknown", qpSelection.label).split("//").join("//"))), includeText);
                break;
        }

        editor.edit((editBuilder) => {
            editBuilder.insert(position, result.replace(/\\/g, "/"));
        });
    });

    sendTelemetryData(telemetryCommand, "");
}
