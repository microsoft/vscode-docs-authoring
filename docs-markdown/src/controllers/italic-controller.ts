"use strict";

import { Range, Selection, TextEditorEdit, window } from "vscode";
import { insertContentToEditor, isMarkdownFileCheck, isValidEditor, noActiveEditorMessage, postWarning, showStatusMessage } from "../helper/common";
import { insertUnselectedText } from "../helper/format-logic-manager";
import { isBoldAndItalic, isItalic } from "../helper/format-styles";
import { sendTelemetryData } from "../helper/telemetry";

const telemetryCommand: string = "formatItalic";

export function italicFormattingCommand() {
    const commands = [
        { command: formatItalic.name, callback: formatItalic },
    ];
    return commands;
}

/**
 * Replaces current selection with MD italic formated selection
 */
export function formatItalic() {
    const editor = window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    } else {
        if (!isValidEditor(editor, true, "format italic")) {
            return;
        }

        if (!isMarkdownFileCheck(editor, false)) {
            return;
        }

        // const selection = editor.selection;
        // const selectedText = editor.document.getText(selection);
        const selections: Selection[] = editor.selections;
        let range;

        // if unselect text, add italic syntax without any text
        if (selections.length === 0) {
            const cursorPosition = editor.selection.active;
            const selectedText = "";

            // assumes the range of italic syntax
            range = new Range(cursorPosition.with(cursorPosition.line,
                cursorPosition.character - 1 < 0 ? 0 : cursorPosition.character - 1),
                cursorPosition.with(cursorPosition.line, cursorPosition.character + 1));

            // calls formatter and returns selectedText as MD bold
            const formattedText = italicize(selectedText, range);
            insertUnselectedText(editor, formatItalic.name, formattedText, range);
        }

        // if only a selection is made with a single cursor
        if (selections.length === 1) {
            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);
            const cursorPosition = editor.selection.active;
            range = new Range(cursorPosition.with(cursorPosition.line,
                cursorPosition.character - 1 < 0 ? 0 : cursorPosition.character - 1),
                cursorPosition.with(cursorPosition.line, cursorPosition.character + 1));

            // calls formatter and returns selectedText as MD Italic
            const formattedText = italicize(selectedText, range);
            insertContentToEditor(editor, formatItalic.name, formattedText, true);
        }

        // if mulitple cursors were used to make selections
        if (selections.length > 1) {
            editor.edit((edit: TextEditorEdit): void => {
                selections.forEach((selection: Selection) => {
                    for (let i = selection.start.line; i <= selection.end.line; i++) {
                        const selectedText = editor.document.getText(selection);
                        const formattedText = italicize(selectedText);
                        edit.replace(selection, formattedText);
                    }
                });
            }).then((success) => {
                if (!success) {
                    postWarning("Could not format selections. Abandoning command.");
                    showStatusMessage("Could not format selections. Abandoning command.");
                    return;
                }
            });
        }
    }
    sendTelemetryData(telemetryCommand, "");
}

/**
 * Returns input string formatted MD Italic.
 * @param {string} content - selected text
 * @param {vscode.Range} range - If provided will get the text at the given range.
 */
export function italicize(content: string, range?: Range) {
    // Clean up string if it is already formatted
    const selectedText = content.trim();

    if (isBoldAndItalic(content) || isItalic(content)) {
        // removes italics
        return selectedText.substring(1, selectedText.length - 1);
    }

    // Set sytax for italic formatting and replace original string with formatted string
    const styleItalic = "*" + selectedText + "*";
    return styleItalic;
}
