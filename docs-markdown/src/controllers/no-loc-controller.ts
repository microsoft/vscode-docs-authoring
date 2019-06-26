"use strict";

import { output } from "../extension";
import { isMarkdownFileCheck, noActiveEditorMessage, insertContentToEditor } from "../helper/common";
import { window, TextEditor, Selection, Position, Range } from "vscode";
import { isCursorInsideYamlHeader } from "../helper/yaml-metadata";


/**
 * Inserts non-localizable text
 */
export function noLocText() {

    const editor = window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }

    // is this a markdown file or yaml?
    if (isMarkdownFileCheck(editor, false)) {
        // if markdown, is the user's cursor in the yaml header?
        if (isCursorInsideYamlHeader(editor)) {
            insertYamlNoLocEntry(editor);
        } else {

        }
    } else {
        // do yaml stuff
    }
}

function insertYamlNoLocEntry(editor: TextEditor) {
    if (isContentOnCurrentLine(editor)) {
        window.showErrorMessage("The no-loc metadata must be inserted on a new line.");
        return;
    }

    let insertText = "no-loc: []";
    insertContentToEditor(editor, insertYamlNoLocEntry.name, insertText, false);
    const newPosition = new Position(editor.selection.active.line, insertText.indexOf("]"));
    const newSelection = new Selection(newPosition, newPosition);
    editor.selection = newSelection;
}

function isContentOnCurrentLine(editor: TextEditor): boolean {
    const range = new Range(editor.selection.active.line, 0, editor.selection.active.line, 1000);
    const lineText = editor.document.getText(range);
    if (lineText === "") { return false; }
    return !(/^\s+$/.test(lineText));
}