"use strict";

import * as vscode from "vscode";
import { output } from "../extension";
import { insertContentToEditor, isMarkdownFileCheck, isValidEditor, noActiveEditorMessage } from "../helper/common";
import { reporter } from "../helper/telemetry";
import { tableBuilder, validateTableRowAndColumnCount } from "../helper/utility";

const telemetryCommand: string = "insertTable";

export function insertTableCommand() {
    const commands = [
        { command: insertTable.name, callback: insertTable },
    ];
    return commands;
}

export function insertTable() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }
    if (!isValidEditor(editor, false, insertTable.name)) {
        return;
    }

    if (!isMarkdownFileCheck(editor, false)) {
        return;
    }

    const tableInput = vscode.window.showInputBox({ prompt: "Input the number of columns and rows as C:R" });

    // gets the users input on number of columns and rows
    tableInput.then((val) => {

        if (!val) {
            return;
        } else {
            const size = val.split(":");

            /// check valid value and exceed 4*4
            if (validateTableRowAndColumnCount(size.length, size[0], size[1])) {
                const col = Number.parseInt(size[0]);
                const row = Number.parseInt(size[1]);
                const str = tableBuilder(col, row);
                const logTableMessage = "." + col + ":" + row;
                reporter.sendTelemetryEvent(`${telemetryCommand}${logTableMessage}`);

                insertContentToEditor(editor, insertTable.name, str);
            } else {
                output.appendLine("Table insert failed.");
            }
        }
    });
}
