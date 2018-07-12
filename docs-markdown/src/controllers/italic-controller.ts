"use strict";

import * as vscode from "vscode";
import * as common from "../helper/common";
import { insertUnselectedText } from "../helper/format-logic-manager";
import { isBoldAndItalic, isItalic } from "../helper/format-styles";
import * as log from "../helper/log";
import { reporter } from "../telemetry/telemetry";

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
    reporter.sendTelemetryEvent("command", { command: telemetryCommand });

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common.noActiveEditorMessage();
        return;
    } else {
        if (!common.isValidEditor(editor, true, "format italic")) {
            return;
        }

        if (!common.isMarkdownFileCheck(editor, false)) {
            return;
        }

        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        let range;

        // if unselect text, add italic syntax without any text
        if (selectedText === "") {
            const cursorPosition = editor.selection.active;

            // assumes the range of italic syntax
            range = new vscode.Range(cursorPosition.with(cursorPosition.line,
                cursorPosition.character - 1 < 0 ? 0 : cursorPosition.character - 1),
                cursorPosition.with(cursorPosition.line, cursorPosition.character + 1));

            // calls formatter and returns selectedText as MD bold
            const formattedText = italicize(selectedText, range);
            insertUnselectedText(editor, formatItalic.name, formattedText, range);
        } else {
            log.debug("Found: " + selectedText);
            const cursorPosition = editor.selection.active;
            range = new vscode.Range(cursorPosition.with(cursorPosition.line,
                cursorPosition.character - 1 < 0 ? 0 : cursorPosition.character - 1),
                cursorPosition.with(cursorPosition.line, cursorPosition.character + 1));

            // calls formatter and returns selectedText as MD Italic
            const formattedText = italicize(selectedText, range);
            common.insertContentToEditor(editor, formatItalic.name, formattedText, true);
        }
    }
}

/**
 * Returns input string formatted MD Italic.
 * @param {string} content - selected text
 * @param {vscode.Range} range - If provided will get the text at the given range.
 */
export function italicize(content: string, range: vscode.Range) {
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
