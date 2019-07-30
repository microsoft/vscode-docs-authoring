"use strict";
import { window } from "vscode";
import { insertContentToEditor, showWarningMessage } from "../helper/common";

export const columnStructure =
    `
    :::column:::
    
    :::column-end:::
    `
    ;

export function checkColumnRange(columnNumber: number) {
    if (columnNumber >= 1 && columnNumber <= 4) {
        createRow(columnNumber);
    } else {
        showWarningMessage(`The number of columns must be between 1 and 4.`);
        return;
    }
}

export function buildRow(columnNumber: number) {
    const columns = columnStructure.repeat(columnNumber);
    const rowStructure =
        `
:::row:::
    ${columns}
:::row-end:::`;
    return rowStructure;
}

export function createRow(columnNumber: number) {
    const editor = window.activeTextEditor;
    if (editor) {
        const newRow = buildRow(columnNumber);
        insertContentToEditor(editor, createRow.name, newRow);
    }
}

export function addNewColumn() {
    const editor = window.activeTextEditor;
    if (editor) {
        insertContentToEditor(editor, createRow.name, columnStructure);
    }
}