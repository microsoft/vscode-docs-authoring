"use strict";

import { window } from "vscode";
import { buildRow } from "../constants/rows-columns";
import { insertContentToEditor, isMarkdownFileCheck, noActiveEditorMessage, showWarningMessage } from "../helper/common";

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


        // let subCommand: string;

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
    showWarningMessage(`${newColumn} selected`);
}

export function insertNewColumnWithSpan() {
    showWarningMessage(`${newColumnWithSpan} selected`);
}

export function checkColumnRange(columnNumber: number) {
    if (columnNumber >= 1 && columnNumber <= 4) {
        createRow(columnNumber);
    } else {
        showWarningMessage(`The number of columns must be between 1 and 4.`);
        return;
    }
}

export function createRow(columnNumber: number) {
    const editor = window.activeTextEditor;
    if (editor) {
        const newRow = buildRow(columnNumber);
        insertContentToEditor(editor, createRow.name, newRow);
    }
}   