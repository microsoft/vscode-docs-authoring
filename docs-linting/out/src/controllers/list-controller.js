"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const list_type_1 = require("../constants/list-type");
const extension_1 = require("../extension");
const common_1 = require("../helper/common");
const list_1 = require("../helper/list");
const telemetryCommand = "insertList";
let commandOption;
function insertListsCommands() {
    const commands = [
        { command: automaticList.name, callback: automaticList },
        { command: insertBulletedList.name, callback: insertBulletedList },
        { command: insertNestedList.name, callback: insertNestedList },
        { command: insertNumberedList.name, callback: insertNumberedList },
        { command: removeNestedList.name, callback: removeNestedList },
    ];
    return commands;
}
exports.insertListsCommands = insertListsCommands;
/**
 * Creates a numbered (numerical) list in the vscode editor.
 */
function insertNumberedList() {
    commandOption = "numbered";
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    else {
        if (!common_1.isValidEditor(editor, false, "insert numbered list")) {
            return;
        }
        if (!common_1.isMarkdownFileCheck(editor, false)) {
            return;
        }
        if (list_1.checkEmptyLine(editor) || list_1.checkEmptySelection(editor)) {
            list_1.insertList(editor, list_type_1.ListType.Numbered);
        }
        else {
            list_1.createNumberedListFromText(editor);
        }
        common_1.sendTelemetryData(telemetryCommand, commandOption);
    }
}
exports.insertNumberedList = insertNumberedList;
/**
 * Creates a bulleted (dash) list in the vscode editor.
 */
function insertBulletedList() {
    commandOption = "bulleted";
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    else {
        if (!common_1.isValidEditor(editor, false, "insert bulleted list")) {
            return;
        }
        if (!common_1.isMarkdownFileCheck(editor, false)) {
            return;
        }
        try {
            if (list_1.checkEmptyLine(editor)) {
                list_1.insertList(editor, list_type_1.ListType.Bulleted);
            }
            else {
                list_1.createBulletedListFromText(editor);
            }
        }
        catch (error) {
            extension_1.output.appendLine(error);
        }
        common_1.sendTelemetryData(telemetryCommand, commandOption);
    }
}
exports.insertBulletedList = insertBulletedList;
/**
 * Adds the next list item automatically. Either bulleted or numbered, includes indentation.
 */
function automaticList() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    else {
        try {
            if (!common_1.isValidEditor(editor, false, "automatic list")) {
                return;
            }
            if (!common_1.isMarkdownFileCheck(editor, false)) {
                return;
            }
            const cursorPosition = editor.selection.active;
            const numbered = list_1.getNumberedLine(editor.document.lineAt(cursorPosition.line)
                .text.substring(0, cursorPosition.character));
            const alphabet = list_1.getAlphabetLine(editor.document.lineAt(cursorPosition.line)
                .text.substring(0, cursorPosition.character));
            if (numbered > 0) {
                list_1.autolistNumbered(editor, cursorPosition, numbered);
            }
            else if (alphabet > 0) {
                list_1.autolistAlpha(editor, cursorPosition, alphabet);
            }
            else if (list_1.isBulletedLine(editor.document.lineAt(cursorPosition.line).text.trim())
                && !cursorPosition.isEqual(cursorPosition.with(cursorPosition.line, 0))) {
                // Check if the line is a bulleted line
                const strLine = editor.document.lineAt(cursorPosition.line).text;
                let insertText = "";
                const indent = list_1.addIndent(editor.document.lineAt(cursorPosition.line).text);
                if (strLine.trim() === "-" && (strLine.indexOf("-") === strLine.length - 1)) {
                    insertText = " \n" + indent + "- ";
                }
                else {
                    insertText = "\n" + indent + "- ";
                }
                common_1.insertContentToEditor(editor, automaticList.name, insertText, false);
            }
            else {
                // default case
                const defaultText = "\n";
                common_1.insertContentToEditor(editor, automaticList.name, defaultText, false);
            }
        }
        catch (Exception) {
            const exceptionText = "\n";
            common_1.insertContentToEditor(editor, automaticList.name + ": catch exception handling", exceptionText, false);
        }
    }
}
exports.automaticList = automaticList;
/**
 * Creates indentation in an existing list.
 */
function insertNestedList() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    else {
        const cursorPosition = editor.selection.active;
        if (!common_1.isValidEditor(editor, false, "insert nested list")) {
            return;
        }
        if (!common_1.isMarkdownFileCheck(editor, false)) {
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
                selectedLines.push(list_1.tabPattern + lineText);
            }
            // Replace editor's text
            const range = new vscode.Range(startSelected.line, 0, endSelected.line, editor.document.lineAt(endSelected.line).text.length);
            const updateText = selectedLines.join("\n");
            common_1.insertContentToEditor(editor, insertNestedList.name, updateText, true, range);
        }
        else if (!list_1.checkEmptyLine(editor)) {
            const text = editor.document.getText(new vscode.Range(cursorPosition.with(cursorPosition.line, 0), cursorPosition.with(cursorPosition.line, editor.selection.end.character)));
            const indentCount = list_1.CountIndent(editor.document.lineAt(cursorPosition.line).text);
            const numberedRegex = new RegExp(list_1.fixedNumberedListWithIndentRegexTemplate.replace("{0}", indentCount.toString()));
            // Handle nested list of bullet
            if (list_1.fixedBulletedListRegex.exec(text) != null) {
                editor.edit((update) => {
                    update.insert(cursorPosition.with(cursorPosition.line, 0), list_1.tabPattern);
                });
            }
            else if (list_1.getNumberedLineWithRegex(numberedRegex, text) > 0) {
                list_1.nestedNumberedList(editor, cursorPosition, indentCount);
                common_1.insertContentToEditor(editor, insertNestedList.name, list_1.tabPattern, false);
            }
            else {
                common_1.insertContentToEditor(editor, insertNestedList.name, list_1.tabPattern, false);
            }
        }
        else {
            common_1.insertContentToEditor(editor, insertNestedList.name, list_1.tabPattern, false);
        }
    }
}
exports.insertNestedList = insertNestedList;
/**
 *  Removes indentation from a nested list.
 */
function removeNestedList() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    else {
        if (!common_1.isMarkdownFileCheck(editor, false)) {
            return;
        }
        // Check user selected multiple line
        if (!editor.selection.isSingleLine) {
            // Delete multiple line
            list_1.removeNestedListMultipleLine(editor);
        }
        else {
            list_1.removeNestedListSingleLine(editor);
        }
    }
}
exports.removeNestedList = removeNestedList;
//# sourceMappingURL=list-controller.js.map