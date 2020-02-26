"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const common_1 = require("../helper/common");
const format_logic_manager_1 = require("../helper/format-logic-manager");
const format_styles_1 = require("../helper/format-styles");
const telemetryCommand = "formatItalic";
function italicFormattingCommand() {
    const commands = [
        { command: formatItalic.name, callback: formatItalic },
    ];
    return commands;
}
exports.italicFormattingCommand = italicFormattingCommand;
/**
 * Replaces current selection with MD italic formated selection
 */
function formatItalic() {
    const editor = vscode_1.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    else {
        if (!common_1.isValidEditor(editor, true, "format italic")) {
            return;
        }
        if (!common_1.isMarkdownFileCheck(editor, false)) {
            return;
        }
        // const selection = editor.selection;
        // const selectedText = editor.document.getText(selection);
        let selections = editor.selections;
        let range;
        // if unselect text, add italic syntax without any text
        if (selections.length == 0) {
            const cursorPosition = editor.selection.active;
            const selectedText = "";
            // assumes the range of italic syntax
            range = new vscode_1.Range(cursorPosition.with(cursorPosition.line, cursorPosition.character - 1 < 0 ? 0 : cursorPosition.character - 1), cursorPosition.with(cursorPosition.line, cursorPosition.character + 1));
            // calls formatter and returns selectedText as MD bold
            const formattedText = italicize(selectedText, range);
            format_logic_manager_1.insertUnselectedText(editor, formatItalic.name, formattedText, range);
        }
        // if only a selection is made with a single cursor
        if (selections.length == 1) {
            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);
            const cursorPosition = editor.selection.active;
            range = new vscode_1.Range(cursorPosition.with(cursorPosition.line, cursorPosition.character - 1 < 0 ? 0 : cursorPosition.character - 1), cursorPosition.with(cursorPosition.line, cursorPosition.character + 1));
            // calls formatter and returns selectedText as MD Italic
            const formattedText = italicize(selectedText, range);
            common_1.insertContentToEditor(editor, formatItalic.name, formattedText, true);
        }
        // if mulitple cursors were used to make selections
        if (selections.length > 1) {
            editor.edit(function (edit) {
                selections.forEach((selection) => {
                    for (let i = selection.start.line; i <= selection.end.line; i++) {
                        let selectedText = editor.document.getText(selection);
                        let formattedText = italicize(selectedText);
                        edit.replace(selection, formattedText);
                    }
                });
            }).then(success => {
                if (!success) {
                    common_1.postWarning("Could not format selections. Abandoning command.");
                    common_1.showStatusMessage("Could not format selections. Abandoning command.");
                    return;
                }
            });
        }
    }
    common_1.sendTelemetryData(telemetryCommand, "");
}
exports.formatItalic = formatItalic;
/**
 * Returns input string formatted MD Italic.
 * @param {string} content - selected text
 * @param {vscode.Range} range - If provided will get the text at the given range.
 */
function italicize(content, range) {
    // Clean up string if it is already formatted
    const selectedText = content.trim();
    if (format_styles_1.isBoldAndItalic(content) || format_styles_1.isItalic(content)) {
        // removes italics
        return selectedText.substring(1, selectedText.length - 1);
    }
    // Set sytax for italic formatting and replace original string with formatted string
    const styleItalic = "*" + selectedText + "*";
    return styleItalic;
}
exports.italicize = italicize;
//# sourceMappingURL=italic-controller.js.map