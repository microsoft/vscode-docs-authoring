"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const common_1 = require("../helper/common");
const format_logic_manager_1 = require("../helper/format-logic-manager");
const format_styles_1 = require("../helper/format-styles");
const telemetry_1 = require("../helper/telemetry");
const telemetryCommand = "formatBold";
function boldFormattingCommand() {
    const commands = [
        { command: formatBold.name, callback: formatBold },
    ];
    return commands;
}
exports.boldFormattingCommand = boldFormattingCommand;
/**
 * Replaces current selection with MD bold formated selection
 */
function formatBold() {
    telemetry_1.reporter.sendTelemetryEvent(`${telemetryCommand}`);
    const editor = vscode_1.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    else {
        if (!common_1.isMarkdownFileCheck(editor, false)) {
            return;
        }
        let selections = editor.selections;
        let range;
        // if unselect text, add bold syntax without any text
        if (selections.length == 0) {
            const cursorPosition = editor.selection.active;
            const selectedText = "";
            // assumes the range of bold syntax
            range = new vscode_1.Range(cursorPosition.with(cursorPosition.line, cursorPosition.character - 2 < 0 ? 0 : cursorPosition.character - 2), cursorPosition.with(cursorPosition.line, cursorPosition.character + 2));
            // calls formatter and returns selectedText as MD bold
            const formattedText = bold(selectedText);
            format_logic_manager_1.insertUnselectedText(editor, formatBold.name, formattedText, range);
        }
        // if only a selection is made with a single cursor
        if (selections.length == 1) {
            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);
            const cursorPosition = editor.selection.active;
            range = new vscode_1.Range(cursorPosition.with(cursorPosition.line, cursorPosition.character - 2 < 0 ? 0 : cursorPosition.character - 2), cursorPosition.with(cursorPosition.line, cursorPosition.character + 2));
            // calls formatter and returns selectedText as MD Bold
            const formattedText = bold(selectedText);
            common_1.insertContentToEditor(editor, formatBold.name, formattedText, true);
        }
        // if mulitple cursors were used to make selections
        if (selections.length > 1) {
            editor.edit(function (edit) {
                selections.forEach((selection) => {
                    for (let i = selection.start.line; i <= selection.end.line; i++) {
                        let selectedText = editor.document.getText(selection);
                        let formattedText = bold(selectedText);
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
exports.formatBold = formatBold;
/**
 * Returns input string formatted MD Bold.
 * @param {string} content - selected text
 * @param {vscode.Range} range - If provided will get the text at the given range.
 */
function bold(content, range) {
    // Clean up string if it is already formatted
    const selectedText = content.trim();
    if (format_styles_1.isBold(content) || format_styles_1.isBoldAndItalic(content)) {
        return selectedText.substring(2, selectedText.length - 2);
    }
    // Set sytax for bold formatting and replace original string with formatted string
    const styleBold = `**${selectedText}**`;
    return styleBold;
}
exports.bold = bold;
//# sourceMappingURL=bold-controller.js.map