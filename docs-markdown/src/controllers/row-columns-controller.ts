"use strict";

import { window } from "vscode";
import { isMarkdownFileCheck, noActiveEditorMessage, showWarningMessage } from "../helper/common";
import { addNewColumn, addNewColumnWithSpan, checkColumnRange, createRow } from "../helper/rows-columns";

const rowWithColumns = "Two-column structure";
const newColumn = "New column";
const newColumnWithSpan = "New column with span";

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
            newColumnWithSpan
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
}

export function insertNewColumn() {
    addNewColumn();
}

export function insertNewColumnWithSpan() {
    addNewColumnWithSpan();
}

