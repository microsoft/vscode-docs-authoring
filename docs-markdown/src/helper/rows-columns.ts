"use strict";
import { Position, Selection, window } from "vscode";
import { insertContentToEditor, showStatusMessage, showWarningMessage } from "../helper/common";

// strings
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
const columnOutsideRowMessage = "A column can't be inserted outside of a row.";

// regex
const rowStartRegex = /^:{3}row:{3}/gm;
const rowEndRegex = /^:{3}row-end:{3}/gm;
const columnStartRegex = /^\s+:{3}(column|column\sspan=".*"):{3}/gm;
const columnEndRegex = /^\s+:{3}column-end:{3}/gm;

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
        try {
            for (i = startPosition; i < totalLines; i--) {
                const lineData = editor.document.lineAt(i);
                const lineText = lineData.text;
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
        checkForValidRow();
    }
}

// add a new column with span to existing row
export function addNewColumnWithSpan() {
    const editor = window.activeTextEditor;
    if (editor) {
        checkForValidRow(true);
    }
}

// determine if cursor position is within a row by looking up for either row open or column-end
// if no row or column-end is found, assume that cursor is not in a row
export function validatePosition(span?: boolean) {
    const editor = window.activeTextEditor;
    if (editor) {
        const startPosition = editor.selection.active.line;
        const totalLines = editor.document.lineCount;
        let i;
        let columnStartLineNumber;
        let columnEndLineNumber;
        let rowStartLineNumber;
        try {
            for (i = startPosition; i < totalLines; i--) {
                const lineData = editor.document.lineAt(i);
                const lineText = lineData.text;
                if (lineText.match(columnStartRegex)) {
                    columnStartLineNumber = lineData.lineNumber;
                    break;
                }
                if (lineText.match(columnEndRegex)) {
                    columnEndLineNumber = lineData.lineNumber;
                }
                if (lineText.match(rowStartRegex)) {
                    rowStartLineNumber = lineData.lineNumber;
                }
            }
        } catch (error) {
            showWarningMessage(error);
            showStatusMessage(error);
        }

        // found column start but no column end so assume that the cursor is at the beginning of the first/only column
        // throw error
        if (columnStartLineNumber && !columnEndLineNumber) {
            showWarningMessage(columnErrorMessage);
            showStatusMessage(columnErrorMessage);
        }

        // if the new column is directly under a row
        if (rowStartLineNumber) {
            if (!columnStartLineNumber && !columnEndLineNumber) {
                if (span) {
                    insertColumn(true);
                } else {
                    insertColumn();
                }
            }
        }

        // found a complete column
        // create column
        if (columnStartLineNumber && columnEndLineNumber) {
            if (columnStartLineNumber < startPosition && columnEndLineNumber < startPosition) {
                if (span) {
                    insertColumn(true);
                } else {
                    insertColumn();
                }
            }
        }
    }
}

export function insertIndentedColumn(content: string, position: number) {
    const editor = window.activeTextEditor;
    if (editor) {
        const activeLine = editor.selection.active.line;
        editor.edit((editBuilder) => {
            editBuilder.insert(new Position(activeLine, position), content);
        });
    }
}

export function insertColumn(span?: boolean) {
    const editor = window.activeTextEditor;
    if (editor) {
        const cursorPosition = editor.selection.active.character;
        let newPosition;
        let newSelection;
        if (span && cursorPosition === 0) {
            insertContentToEditor(editor, createRow.name, columnSpan);
            newPosition = new Position(editor.selection.active.line, 20);
            newSelection = new Selection(newPosition, newPosition);
            editor.selection = newSelection;
        }
        if (!span && cursorPosition === 0) {
            insertContentToEditor(editor, createRow.name, columnAdd);
            newPosition = new Position(editor.selection.active.line, 7);
            newSelection = new Selection(newPosition, newPosition);
            editor.selection = newSelection;
        }
        if (!span && cursorPosition % 4 === 0) {
            insertIndentedColumn(columnAdd, 0);
            newPosition = new Position(editor.selection.active.line + 1, 20);
            newSelection = new Selection(newPosition, newPosition);
            editor.selection = newSelection;
        }
        if (span && cursorPosition % 4 === 0) {
            insertIndentedColumn(columnSpan, 0);
            newPosition = new Position(editor.selection.active.line, 20);
            newSelection = new Selection(newPosition, newPosition);
            editor.selection = newSelection;
        }
    }
}

export function checkForValidRow(span?: boolean) {
    const editor = window.activeTextEditor;
    let rowStartLineNumber: number = 0;
    let rowEndLineNumber: number = 0;
    let nextRowStartLineNumber: number = 0;
    if (editor) {
        const startPosition = editor.selection.active.line;
        const cursorPosition = editor.selection.active.character;
        const totalLines = editor.document.lineCount;
        let i;
        try {
            for (i = startPosition; i < totalLines; i--) {
                const lineData = editor.document.lineAt(i);
                const lineText = lineData.text;
                if (lineText.match(rowStartRegex)) {
                    rowStartLineNumber = lineData.lineNumber;
                    break;
                }

            }
            for (i = startPosition; i < totalLines; i++) {
                const lineData = editor.document.lineAt(i);
                const lineText = lineData.text;
                if (lineText.match(rowEndRegex)) {
                    rowEndLineNumber = lineData.lineNumber;
                    break;
                }
                if (lineText.match(rowStartRegex)) {
                    nextRowStartLineNumber = lineData.lineNumber;
                }
            }
        } catch (error) {
            showStatusMessage(error);
        }

        // valid row if cursor is below row start and above next row end
        if (rowStartLineNumber && rowEndLineNumber) {
            // check for a row start in between cursor and row end
            if (nextRowStartLineNumber) {
                if (nextRowStartLineNumber > cursorPosition) {
                    showWarningMessage(columnOutsideRowMessage);
                    showStatusMessage(columnOutsideRowMessage);
                }
            }
            // if there aren't any rows below the cursor should be in a valid row
            if (!nextRowStartLineNumber) {
                if (span) {
                    validatePosition(true);
                } else {
                    validatePosition();
                }
            }
        } else {
            showWarningMessage(columnOutsideRowMessage);
            showStatusMessage(columnOutsideRowMessage);
        }
    }
}
