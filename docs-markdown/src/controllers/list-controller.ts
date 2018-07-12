"use strict";

import * as vscode from "vscode";
import { ListType } from "../constants/list-type";
import * as common from "../helper/common";
import * as listHelper from "../helper/list";
import * as log from "../helper/log";
import { reporter } from "../telemetry/telemetry";

const telemetryCommand: string = "insertList";

export function insertListsCommands() {
    const commands = [
        { command: automaticList.name, callback: automaticList },
        { command: insertBulletedList.name, callback: insertBulletedList },
        { command: insertNestedList.name, callback: insertNestedList },
        { command: insertNumberedList.name, callback: insertNumberedList },
        { command: removeNestedList.name, callback: removeNestedList },
    ];
    return commands;
}

/**
 * Creates a numbered (numerical) list in the vscode editor.
 */
export function insertNumberedList() {
    reporter.sendTelemetryEvent("command", { command: telemetryCommand + ".numbered" });

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common.noActiveEditorMessage();
        return;
    } else {
        if (!common.isValidEditor(editor, false, "insert numbered list")) {
            return;
        }

        if (!common.isMarkdownFileCheck(editor, false)) {
            return;
        }

        if (listHelper.checkEmptyLine(editor) || listHelper.checkEmptySelection(editor)) {
            listHelper.insertList(editor, ListType.Numbered);
        } else {
            listHelper.createNumberedListFromText(editor);
        }
    }
}

/**
 * Creates a bulleted (dash) list in the vscode editor.
 */
export function insertBulletedList() {
    reporter.sendTelemetryEvent("command", { command: telemetryCommand + ".bulleted" });

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common.noActiveEditorMessage();
        return;
    } else {
        if (!common.isValidEditor(editor, false, "insert bulleted list")) {
            return;
        }

        if (!common.isMarkdownFileCheck(editor, false)) {
            return;
        }

        try {
            if (listHelper.checkEmptyLine(editor)) {
                listHelper.insertList(editor, ListType.Bulleted);
            } else {
                listHelper.createBulletedListFromText(editor);
            }
        } catch (error) {
            log.debug(error);
        }
    }
}

/**
 * Adds the next list item automatically. Either bulleted or numbered, includes indentation.
 */
export function automaticList() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common.noActiveEditorMessage();
        return;
    } else {
        try {
            if (!common.isValidEditor(editor, false, "automatic list")) {
                return;
            }

            if (!common.isMarkdownFileCheck(editor, false)) {
                return;
            }

            const cursorPosition = editor.selection.active;
            const numbered = listHelper.getNumberedLine(editor.document.lineAt(cursorPosition.line)
                .text.substring(0, cursorPosition.character));
            const alphabet = listHelper.getAlphabetLine(editor.document.lineAt(cursorPosition.line)
                .text.substring(0, cursorPosition.character));

            if (numbered > 0) {
                listHelper.autolistNumbered(editor, cursorPosition, numbered);
            } else if (alphabet > 0) {
                listHelper.autolistAlpha(editor, cursorPosition, alphabet);
            } else if (listHelper.isBulletedLine(editor.document.lineAt(cursorPosition.line).text.trim())
                && !cursorPosition.isEqual(cursorPosition.with(cursorPosition.line, 0))) {
                // Check if the line is a bulleted line
                const strLine = editor.document.lineAt(cursorPosition.line).text;
                let insertText = "";
                const indent = listHelper.addIndent(editor.document.lineAt(cursorPosition.line).text);
                if (strLine.trim() === "-" && (strLine.indexOf("-") === strLine.length - 1)) {
                    insertText = " \n" + indent + "- ";
                } else {
                    insertText = "\n" + indent + "- ";
                }
                common.insertContentToEditor(editor, automaticList.name, insertText, false);
            } else {
                // default case
                const defaultText = "\n";
                common.insertContentToEditor(editor, automaticList.name, defaultText, false);
            }
        } catch (Exception) {
            const exceptionText = "\n";
            common.insertContentToEditor(editor, automaticList.name + ": catch exception handling",
                exceptionText, false);
        }
    }
}

/**
 * Creates indentation in an existing list.
 */
export function insertNestedList() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common.noActiveEditorMessage();
        return;
    } else {
        const cursorPosition = editor.selection.active;

        if (!common.isValidEditor(editor, false, "insert nested list")) {
            return;
        }

        if (!common.isMarkdownFileCheck(editor, false)) {
            return;
        }

        // Check user selected multiple line (Still not support automatic nested list for multiple line)
        if (!editor.selection.isSingleLine) {
            const startSelected = editor.selection.start;
            const endSelected = editor.selection.end;
            const selectedLines = [];

            // Insert tab to multiple line
            for (let i = startSelected.line; i <= endSelected.line; i++) {
                const lineText = editor.document.lineAt(i).text;

                selectedLines.push(listHelper.tabPattern + lineText);
            }

            // Replace editor's text
            const range: vscode.Range = new vscode.Range(startSelected.line, 0,
                endSelected.line, editor.document.lineAt(endSelected.line).text.length);
            const updateText =
                selectedLines.join("\n");
            common.insertContentToEditor(editor, insertNestedList.name, updateText, true, range);
        } else if (!listHelper.checkEmptyLine(editor)) {
            const text = editor.document.getText(new vscode.Range(cursorPosition.with(cursorPosition.line, 0),
                cursorPosition.with(cursorPosition.line, editor.selection.end.character)));
            const indentCount = listHelper.CountIndent(editor.document.lineAt(cursorPosition.line).text);
            const numberedRegex = new RegExp(listHelper.fixedNumberedListWithIndentRegexTemplate.replace("{0}"
                , indentCount.toString()));

            // Handle nested list of bullet
            if (listHelper.fixedBulletedListRegex.exec(text) != null) {
                editor.edit((update) => {
                    update.insert(cursorPosition.with(cursorPosition.line, 0),
                        listHelper.tabPattern);
                });
            } else if (listHelper.getNumberedLineWithRegex(numberedRegex, text) > 0) {
                listHelper.nestedNumberedList(editor, cursorPosition, indentCount);
                common.insertContentToEditor(editor, insertNestedList.name, listHelper.tabPattern, false);
            } else {
                common.insertContentToEditor(editor, insertNestedList.name, listHelper.tabPattern, false);
            }
        } else {
            common.insertContentToEditor(editor, insertNestedList.name, listHelper.tabPattern, false);
        }
    }
}

/**
 *  Removes indentation from a nested list.
 */
export function removeNestedList() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common.noActiveEditorMessage();
        return;
    } else {
        if (!common.isMarkdownFileCheck(editor, false)) {
            return;
        }

        // Check user selected multiple line
        if (!editor.selection.isSingleLine) {

            // Delete multiple line
            listHelper.removeNestedListMultipleLine(editor);

        } else {
            listHelper.removeNestedListSingleLine(editor);
        }
    }
}
