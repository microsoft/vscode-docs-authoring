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
        checkForRow();
        /* insertContentToEditor(editor, createRow.name, columnAdd);
        const newPosition = new Position(editor.selection.active.line + 1, 7);
        const newSelection = new Selection(newPosition, newPosition);
        editor.selection = newSelection; */
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

export function checkForRow() {
    const editor = window.activeTextEditor;
    if (editor) {
        const rowEnd = ":::row-end:::";
        let i = editor.selection.active.line;
        let contentBelowCursor = [];
        for (i; i >= 0; i++) {
            let lineContent = editor.document.lineAt(i);
            contentBelowCursor.push(lineContent.text);
            console.log(contentBelowCursor);
            if (contentBelowCursor.indexOf(rowEnd)) {
                insertContentToEditor(editor, createRow.name, columnAdd);
                const newPosition = new Position(editor.selection.active.line + 1, 7);
                const newSelection = new Selection(newPosition, newPosition);
                editor.selection = newSelection;
            }
            if (!contentBelowCursor.indexOf(rowEnd)) {
                showWarningMessage(`Not in a row.`);
            }
            /* if (lineContent.text.startsWith(rowEnd)) {
                insertContentToEditor(editor, createRow.name, columnAdd);
                const newPosition = new Position(editor.selection.active.line + 1, 7);
                const newSelection = new Selection(newPosition, newPosition);
                editor.selection = newSelection;
            }
            if (!lineContent.text.startsWith(rowEnd)) {
                contentBelowCursor.push(lineContent.text);
                console.log(contentBelowCursor);
                if (!contentBelowCursor.includes(rowEnd)) {
                    showWarningMessage(`Not in a row`);
                }
            } */
        }
    }
}