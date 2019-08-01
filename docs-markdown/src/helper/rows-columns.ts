"use strict";
import { Position, Selection, window } from "vscode";
import { insertContentToEditor, showWarningMessage } from "../helper/common";

const indentSpacing = "    ";
const columnCursorSpacing = indentSpacing.repeat(2);
const columnOpenSyntax = ":::column:::";
const columnEndSyntax = ":::column-end:::";
const columnSpanSyntax = `:::column span="":::`;
const rowOpenSyntax = ":::row:::";
const rowEndSyntax = ":::row-end:::";
const incorrectSyntaxMessage = "Incorrect column sytax. Abandoning command.";
const columnRangeMessage = "The number of columns must be between 1 and 4.";

const columnRow = `
${indentSpacing}${columnOpenSyntax}
${columnCursorSpacing}
${indentSpacing}${columnEndSyntax}`;

const columnAdd = `${indentSpacing}${columnOpenSyntax}
${columnCursorSpacing}
${indentSpacing}${columnEndSyntax}`;

const columnSpan = `${indentSpacing}${columnSpanSyntax}
${columnCursorSpacing}
${indentSpacing}${columnEndSyntax}`;

// range should be between 1 and 4
export function checkColumnRange(columnNumber: number) {
    if (columnNumber >= 1 && columnNumber <= 4) {
        createRow(columnNumber);
    } else {
        showWarningMessage(columnRangeMessage);
        return;
    }
}

// row structure
export function buildRow(columnNumber: number) {
    const columns = columnRow.repeat(columnNumber);
    const rowStructure = `${rowOpenSyntax}${columns}
${rowEndSyntax}`;
    return rowStructure;
}

// insert row
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

// add a new column to existing row
export function addNewColumn() {
    const editor = window.activeTextEditor;
    if (editor) {
        validatePosition();
    }
}

// add a new column with span to existing row
export function addNewColumnWithSpan() {
    const editor = window.activeTextEditor;
    if (editor) {
        validatePosition(true);
    }
}

// determine if cursor position is within a row by looking up for either row open or column-end
// if no row or column-end is found, assume that cursor is not in a row
export function validatePosition(span?: boolean) {
    const editor = window.activeTextEditor;
    if (editor) {
        let newPosition;
        const previousLine = editor.selection.active.line - 1;
        const previousLineContent = editor.document.lineAt(previousLine);
        if (editor.selection.active.line === 0) {
            showWarningMessage(incorrectSyntaxMessage);
            return;
        }
        if (previousLineContent.text.startsWith(rowOpenSyntax) || previousLineContent.text.includes(columnEndSyntax)) {
            if (span) {
                insertContentToEditor(editor, createRow.name, columnSpan);
                newPosition = new Position(editor.selection.active.line, 20);
            } else {
                insertContentToEditor(editor, createRow.name, columnAdd);
                newPosition = new Position(editor.selection.active.line + 1, 7);
            }
            if (newPosition) {
                const newSelection = new Selection(newPosition, newPosition);
                editor.selection = newSelection;
            }

        } else {
            showWarningMessage(incorrectSyntaxMessage);
            return;
        }
    }
}