"use strict";

import { window } from "vscode";
import { isMarkdownFileCheck, noActiveEditorMessage } from "../helper/common";
import { addNewColumn, addNewColumnWithSpan, createRow } from "../helper/rows-columns";
import { sendTelemetryData } from "../helper/telemetry";

const rowWithColumns = "Two-column structure";
const newColumn = "New column";
const newColumnWithSpan = "New column with span";

const telemetryCommand: string = "insertColumn";
let commandOption: string;

export function insertRowsAndColumnsCommand() {
    const commands = [
        { command: insertRowsAndColumns.name, callback: insertRowsAndColumns },
    ];
    return commands;
}

export function insertRowsAndColumns() {
    const editor = window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    } else {
        if (!isMarkdownFileCheck(editor, false)) {
            return;
        }

        const commandOptions = [
            rowWithColumns,
            newColumn,
            newColumnWithSpan,
        ];
        window.showQuickPick(commandOptions).then((qpSelection) => {
            if (!qpSelection) {
                return;
            }
            switch (qpSelection) {
                case rowWithColumns:
                    insertRowsWithColumns();
                    break;
                case newColumn:
                    insertNewColumn();
                    break;
                case newColumnWithSpan:
                    insertNewColumnWithSpan();
                    break;
            }
        });
    }
}

export function insertRowsWithColumns() {
    createRow(2);
    commandOption = "row";
    sendTelemetryData(telemetryCommand, commandOption);
}

export function insertNewColumn() {
    addNewColumn();
    commandOption = "column";
    sendTelemetryData(telemetryCommand, commandOption);
}

export function insertNewColumnWithSpan() {
    addNewColumnWithSpan();
    commandOption = "column-with-span";
    sendTelemetryData(telemetryCommand, commandOption);
}
