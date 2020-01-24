"use strict";

import * as vscode from "vscode";
import { insertContentToEditor, isMarkdownFileCheck, noActiveEditorMessage, sendTelemetryData } from "../helper/common";
import { insertUnselectedText } from "../helper/format-logic-manager";
import { isBold, isBoldAndItalic } from "../helper/format-styles";
import { reporter } from "../helper/telemetry";

const telemetryCommand: string = "formatBold";

export function boldFormattingCommand() {
    const commands = [
        { command: formatBold.name, callback: formatBold },
    ];
    return commands;
}

/**
 * Replaces current selection with MD bold formated selection
 */
export function formatBold() {
    reporter.sendTelemetryEvent(`${telemetryCommand}`);
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    } else {
        if (!isMarkdownFileCheck(editor, false)) {
            return;
        }

        const selections = editor.selections;
        let range;

        // if unselect text, add bold syntax without any text
        if (selections.length == 0) {
            const cursorPosition = editor.selection.active;
            const selectedText = "";
            // assumes the range of bold syntax
            range = new vscode.Range(cursorPosition.with(cursorPosition.line,
                cursorPosition.character - 2 < 0 ? 0 : cursorPosition.character - 2),
                cursorPosition.with(cursorPosition.line, cursorPosition.character + 2));
            // calls formatter and returns selectedText as MD bold
            const formattedText = bold(selectedText);
            insertUnselectedText(editor, formatBold.name, formattedText, range);
        }

        // if only a selection is made with a single cursor
        if (selections.length == 1) {
            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);
            const cursorPosition = editor.selection.active;
            range = new vscode.Range(cursorPosition.with(cursorPosition.line,
                cursorPosition.character - 2 < 0 ? 0 : cursorPosition.character - 2),
                cursorPosition.with(cursorPosition.line, cursorPosition.character + 2));
            // calls formatter and returns selectedText as MD Bold
            const formattedText = bold(selectedText);
            insertContentToEditor(editor, formatBold.name, formattedText, true);
        }

        // if mulitple cursors were used to make selections
        if (selections.length > 1) {
            selections.forEach(function (selectedItem) {
                let selectedText = editor.document.getText(selectedItem);
                let cursorPosition = editor.selection.active;
                range = new vscode.Range(cursorPosition.with(cursorPosition.line,
                    cursorPosition.character - 2 < 0 ? 0 : cursorPosition.character - 2),
                    cursorPosition.with(cursorPosition.line, cursorPosition.character + 2));
                let formattedText = bold(selectedText);
                console.log(formattedText);
                insertContentToEditor(editor, formatBold.name, formattedText, true);
            });
        }
    }
    sendTelemetryData(telemetryCommand, "");
}

/**
 * Returns input string formatted MD Bold.
 * @param {string} content - selected text
 * @param {vscode.Range} range - If provided will get the text at the given range.
 */
export function bold(content: string, range?: vscode.Range) {
    // Clean up string if it is already formatted
    const selectedText = content.trim();

    if (isBold(content) || isBoldAndItalic(content)) {

        return selectedText.substring(2, selectedText.length - 2);
    }

    // Set sytax for bold formatting and replace original string with formatted string
    const styleBold = `**${selectedText}**`;
    return styleBold;
}