"use strict";

import { window } from "vscode";
import { isMarkdownFileCheck, noActiveEditorMessage, showWarningMessage } from "../helper/common";
import { addNewColumn, checkColumnRange } from "../helper/rows-columns";

const rowWithColumns = "Row with columns";
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
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);

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
    const getNumberOfColumns = window.showInputBox(
        { prompt: "Input the number of columns (min=1, max=4)" }
    )
    getNumberOfColumns.then((val) => {
        if (!val) {
            showWarningMessage(`Number of columns was not provided.  Abandoning command.`);
            return;
        }
        const columnNumber = parseInt(val);
        if (columnNumber) {
            checkColumnRange(columnNumber);
        } else {
            showWarningMessage(`Input is not a number. Abandoning command.`);
        }
    });
}

export function insertNewColumn() {
    addNewColumn();
}

export function insertNewColumnWithSpan() {
    showWarningMessage(`${newColumnWithSpan} selected`);
}

