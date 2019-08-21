"use strict";
import { Position, Selection, window } from "vscode";
import { insertContentToEditor, showWarningMessage } from "../helper/common";
import { showStatusMessage } from "../helper/common";

const indentSpacing = "    ";
const columnCursorSpacing = indentSpacing.repeat(2);
const columnOpenSyntax = ":::column:::";
const columnEndSyntax = ":::column-end:::";
const columnSpanSyntax = `:::column span="":::`;
const rowOpenSyntax = ":::row:::";
const rowEndSyntax = ":::row-end:::";
const columnRangeMessage = "The number of columns must be between 1 and 4.";
const insertRowStructureMessage = "Column structures can’t be inserted within rows or columns.";
const columnErrorMessage = "A column can’t be inserted within another column.";

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
${rowEndSyntax}
`;
    return rowStructure;
}

// insert row
export function createRow(columnNumber: number) {
    const editor = window.activeTextEditor;
    if (editor) {
        const startPosition = editor.selection.active.line;
        const totalLines = editor.document.lineCount;
        let i;
        let rowStartLineNumber;
        let rowEndLineNumber;
        const rowStartRegex = /^:{3}row:{3}/gm;
        const rowEndRegex = /^:{3}row-end:{3}/gm;
        try {
            for (i = startPosition; i < totalLines; i--) {
                var lineData = editor.document.lineAt(i);
                var lineText = lineData.text;
                if (lineText.match(rowStartRegex)) {
                    rowStartLineNumber = lineData.lineNumber;
                    break;
                }
                if (lineText.match(rowEndRegex)) {
                    rowEndLineNumber = lineData.lineNumber;
                }
            }
        } catch (error) {
            // no rows found before cursor
            // to-do: create promise
        }

        // found row start but no row end so assume that the cursor is at the beginning of the first/only row
        // throw error
        if (rowStartLineNumber && !rowEndLineNumber) {
            showWarningMessage(insertRowStructureMessage);
            showStatusMessage(insertRowStructureMessage);
        }
        // found a complete row
        // create row
        if (rowStartLineNumber && rowEndLineNumber) {
            if (rowStartLineNumber < startPosition && rowEndLineNumber < startPosition) {
                const newRow = buildRow(columnNumber);
                insertContentToEditor(editor, createRow.name, newRow);
                const newPosition = new Position(startPosition + 2, 8);
                const newSelection = new Selection(newPosition, newPosition);
                editor.selection = newSelection;
            }
        }
        // no previous rows
        // create row
        if (!rowStartLineNumber) {
            const newRow = buildRow(columnNumber);
            insertContentToEditor(editor, createRow.name, newRow);
            const newPosition = new Position(startPosition + 2, 8);
            const newSelection = new Selection(newPosition, newPosition);
            editor.selection = newSelection;
        }
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
        const startPosition = editor.selection.active.line;
        const cursorPosition = editor.selection.active.character;
        const totalLines = editor.document.lineCount;
        let i;
        let columnStartLineNumber;
        let columnEndLineNumber;
        let newPosition;
        let newSelection;
        const columnStartRegex = /^\s+:{3}(column|column\sspan=".*"):{3}/gm;
        const columnEndRegex = /^\s+:{3}column-end:{3}/gm;
        const rowStartRegex = /^:{3}row:{3}/gm;
        try {
            for (i = startPosition; i < totalLines; i--) {
                var lineData = editor.document.lineAt(i);
                var lineText = lineData.text;
                if (lineText.match(columnStartRegex)) {
                    columnStartLineNumber = lineData.lineNumber;
                    break;
                }
                if (lineText.match(columnEndRegex)) {
                    columnEndLineNumber = lineData.lineNumber;
                }
                if (lineText.match(rowStartRegex)) {
                }
            }
        } catch (error) {
            // no columns found before cursor
            // to-do: create promise for this
        }

        // found column start but no column end so assume that the cursor is at the beginning of the first/only column
        // throw error
        if (columnStartLineNumber && !columnEndLineNumber) {
            showWarningMessage(columnErrorMessage);
            showStatusMessage(columnErrorMessage);
        }
        // found a complete column
        // create column
        if (columnStartLineNumber && columnEndLineNumber) {
            if (columnStartLineNumber < startPosition && columnEndLineNumber < startPosition) {
                if (span && cursorPosition === 0) {
                    insertContentToEditor(editor, createRow.name, columnSpan);
                    newPosition = new Position(editor.selection.active.line, 20);
                    newSelection = new Selection(newPosition, newPosition);
                    editor.selection = newSelection;
                }
                if (!span && cursorPosition === 0) {
                    insertContentToEditor(editor, createRow.name, columnAdd);
                    newPosition = new Position(editor.selection.active.line + 1, 7);
                    newSelection = new Selection(newPosition, newPosition);
                    editor.selection = newSelection;
                }
                if (!span && cursorPosition === 8) {
                    insertIndentedColumn(columnAdd, 0);
                    newPosition = new Position(editor.selection.active.line + 1, 20);
                    newSelection = new Selection(newPosition, newPosition);
                    editor.selection = newSelection;
                }
                if (span && cursorPosition === 8) {
                    insertIndentedColumn(columnSpan, 0);
                    newPosition = new Position(editor.selection.active.line, 20);
                    newSelection = new Selection(newPosition, newPosition);
                    editor.selection = newSelection;
                }
            }
        }
    }
}

export function insertIndentedColumn(content: string, position: number) {
    const editor = window.activeTextEditor;
    if (editor) {
        const activeLine = editor.selection.active.line;
        editor.edit(editBuilder => {
            editBuilder.insert(new Position(activeLine, position), content);
        })
    }
}