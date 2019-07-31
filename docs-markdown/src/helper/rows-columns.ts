"use strict";
import { Position, Selection, window } from "vscode";
import { insertContentToEditor, showWarningMessage } from "../helper/common";

const indentSpacing = "    ";
const columnCursorSpacing = indentSpacing.repeat(2);

// new column
const columnRow = `
${indentSpacing}:::column:::
${columnCursorSpacing}
${indentSpacing}:::column-end:::`;

// new column
const columnAdd = `${indentSpacing}:::column:::
${columnCursorSpacing}
${indentSpacing}:::column-end:::`;

// new column with span
const columnSpan = `
${indentSpacing}:::column span"":::

${indentSpacing}:::column-end:::`;


export function checkColumnRange(columnNumber: number) {
    if (columnNumber >= 1 && columnNumber <= 4) {
        createRow(columnNumber);
    } else {
        showWarningMessage(`The number of columns must be between 1 and 4.`);
        return;
    }
}

export function buildRow(columnNumber: number) {
    const columns = columnRow.repeat(columnNumber);
    const rowStructure = `:::row:::${columns}
:::row-end:::`;
    return rowStructure;
}

export function createRow(columnNumber: number) {
    const editor = window.activeTextEditor;
    if (editor) {
        const newRow = buildRow(columnNumber);
        insertContentToEditor(editor, createRow.name, newRow);
        const newPosition = new Position(editor.selection.active.line + 2, 7);
        const newSelection = new Selection(newPosition, newPosition);
        editor.selection = newSelection;
    }
}

export function addNewColumn() {
    const editor = window.activeTextEditor;
    if (editor) {
        insertContentToEditor(editor, createRow.name, columnAdd);
        const newPosition = new Position(editor.selection.active.line + 1, 7);
        const newSelection = new Selection(newPosition, newPosition);
        editor.selection = newSelection;
    }
}

export function addNewColumnWithSpan() {
    const editor = window.activeTextEditor;
    if (editor) {
        insertContentToEditor(editor, createRow.name, columnSpan);
        const newPosition = new Position(editor.selection.active.line, 19);
        const newSelection = new Selection(newPosition, newPosition);
        editor.selection = newSelection;
    }
}
