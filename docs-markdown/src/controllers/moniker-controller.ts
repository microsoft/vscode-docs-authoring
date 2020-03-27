"use strict";

import { Position, Range, Selection, TextEditor, window } from "vscode";
import { insertContentToEditor, isMarkdownFileCheck, noActiveEditorMessage } from "../helper/common";
import { isCursorInsideYamlHeader } from "../helper/yaml-metadata";
import { sendTelemetryData } from "../helper/telemetry";

const telemetryCommand: string = "insertMoniker";
let cursorPosition: string;
let sign: string;

export function insertMonikerCommand() {
    const commands = [
        { command: insertMoniker.name, callback: insertMoniker },
    ];
    return commands;
}

export function insertMoniker() {
    const editor = window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }

    if (!isMarkdownFileCheck(editor, false)) {
        return;
    }

    const moniker_options = [
        "range equals",
        "range greater than or equal",
        "range less than or equal",
    ];

    window.showQuickPick(moniker_options).then((qpSelection) => {
        if (!qpSelection) {
            return;
        }
        if (qpSelection == moniker_options[0]) {
            sign = "";

        }
        if (qpSelection == moniker_options[1]) {
            sign = ">=";
        }
        if (qpSelection == moniker_options[2]) {
            sign = "<=";
        }
        // is this a markdown file or yaml?
        if (isMarkdownFileCheck(editor, false)) {
            // if markdown, is the user's cursor in the yaml header?
            if (isCursorInsideYamlHeader(editor)) {
                insertYamlMoniker(editor, sign);
            } else {
                insertMarkdownMoniker(editor, sign);
            }
        } else {
            insertYamlMoniker(editor, sign);
        }


    });
}


// cursor is in the YAML metadata block
function insertYamlMoniker(editor: TextEditor, sign: string) {

    cursorPosition = "yaml-header-entry"
    sendTelemetryData(telemetryCommand, cursorPosition);
    let insertText: string = `monikerRange: '${sign}'`;

    if (isContentOnCurrentLine(editor)) {
        window.showErrorMessage("Moniker must be inserted on a new line.");
        return;
    }

    const cursorIndex = insertText.indexOf("'") + sign.length + 1;
    if (isMarkdownFileCheck(editor, false)) {
        insertContentToEditor(editor, insertYamlMoniker.name, insertText, false);
        const newPosition = new Position(editor.selection.active.line, cursorIndex);
        const newSelection = new Selection(newPosition, newPosition);
        editor.selection = newSelection;

    }
    return cursorIndex;
}


//cursor is in the Markdown body of the file
function insertMarkdownMoniker(editor: TextEditor, sign: string) {
    cursorPosition = "markdown-body-entry"
    sendTelemetryData(telemetryCommand, cursorPosition);
    let insertText: string = `::: moniker range="${sign}"\n\n::: moniker-end`;

    if (isContentOnCurrentLine(editor)) {
        window.showErrorMessage("Moniker must be inserted on a new line.");
        return;
    }

    insertContentToEditor(editor, insertMarkdownMoniker.name, insertText, false);
    const cursorIndex = insertText.indexOf(`"`) + sign.length + 1
    const newPosition = new Position(editor.selection.active.line, cursorIndex);
    const newSelection = new Selection(newPosition, newPosition);
    editor.selection = newSelection;
    return cursorIndex;

}

function isContentOnCurrentLine(editor: TextEditor): boolean {
    const range = new Range(editor.selection.active.line, 0, editor.selection.active.line, 1000);
    const lineText = editor.document.getText(range);
    if (lineText === "") { return false; }
    return !(/^\s+$/.test(lineText));
}
