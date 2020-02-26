"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const common_1 = require("../helper/common");
const yaml_metadata_1 = require("../helper/yaml-metadata");
const telemetryCommand = "applyNoLoc";
let commandOption;
function noLocTextCommand() {
    const commands = [
        { command: noLocText.name, callback: noLocText },
    ];
    return commands;
}
exports.noLocTextCommand = noLocTextCommand;
function noLocCompletionItemsMarkdownYamlHeader() {
    return [new vscode_1.CompletionItem(`no-loc: []`)];
}
exports.noLocCompletionItemsMarkdownYamlHeader = noLocCompletionItemsMarkdownYamlHeader;
function noLocCompletionItemsMarkdown() {
    return [new vscode_1.CompletionItem(`:::no-loc text="":::`)];
}
exports.noLocCompletionItemsMarkdown = noLocCompletionItemsMarkdown;
function noLocCompletionItemsYaml() {
    return [new vscode_1.CompletionItem(`no-loc:\n- `)];
}
exports.noLocCompletionItemsYaml = noLocCompletionItemsYaml;
/**
 * Inserts non-localizable text
 */
function noLocText() {
    const editor = vscode_1.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    // is this a markdown file or yaml?
    if (common_1.isMarkdownFileCheck(editor, false)) {
        // if markdown, is the user's cursor in the yaml header?
        if (yaml_metadata_1.isCursorInsideYamlHeader(editor)) {
            insertYamlNoLocEntry(editor);
        }
        else {
            insertMarkdownNoLocEntry(editor);
        }
    }
    else {
        insertYamlNoLocEntry(editor);
    }
}
exports.noLocText = noLocText;
function insertYamlNoLocEntry(editor) {
    commandOption = "yaml-entry";
    common_1.sendTelemetryData(telemetryCommand, commandOption);
    if (isContentOnCurrentLine(editor)) {
        vscode_1.window.showErrorMessage("The no-loc metadata must be inserted on a new line.");
        return;
    }
    if (common_1.isMarkdownFileCheck(editor, false)) {
        const insertText = "no-loc: []";
        common_1.insertContentToEditor(editor, insertYamlNoLocEntry.name, insertText, false);
        const newPosition = new vscode_1.Position(editor.selection.active.line, insertText.indexOf("]"));
        const newSelection = new vscode_1.Selection(newPosition, newPosition);
        editor.selection = newSelection;
    }
    else {
        const tabs = getTabInsertion(editor);
        const insertText = `no-loc:\n${tabs}- `;
        common_1.insertContentToEditor(editor, insertYamlNoLocEntry.name, insertText, false);
        const newPosition = new vscode_1.Position(editor.selection.active.line + 1, insertText.indexOf("- ") + 1);
        const newSelection = new vscode_1.Selection(newPosition, newPosition);
        editor.selection = newSelection;
    }
}
function getTabInsertion(editor) {
    let tabs = "";
    const numToInsert = editor.selection.end.character;
    for (let ii = 0; ii < numToInsert; ii++) {
        tabs += (editor.options.insertSpaces ? " " : "\t");
    }
    return tabs;
}
function insertMarkdownNoLocEntry(editor) {
    commandOption = "markdown-entry";
    common_1.sendTelemetryData(telemetryCommand, commandOption);
    const textSelection = editor.document.getText(editor.selection);
    if (textSelection === "") {
        const insertText = `:::no-loc text="":::`;
        common_1.insertContentToEditor(editor, insertMarkdownNoLocEntry.name, insertText, false);
        const newPosition = new vscode_1.Position(editor.selection.active.line, editor.selection.active.character + insertText.indexOf(`"`) + 1);
        const newSelection = new vscode_1.Selection(newPosition, newPosition);
        editor.selection = newSelection;
    }
    else {
        const insertText = `:::no-loc text="${textSelection}":::`;
        common_1.insertContentToEditor(editor, insertMarkdownNoLocEntry.name, insertText, true, editor.selection);
        const newPosition = new vscode_1.Position(editor.selection.end.line, editor.selection.end.character + insertText.indexOf(`"`) + 1);
        const newSelection = new vscode_1.Selection(newPosition, newPosition);
        editor.selection = newSelection;
    }
}
function isContentOnCurrentLine(editor) {
    const range = new vscode_1.Range(editor.selection.active.line, 0, editor.selection.active.line, 1000);
    const lineText = editor.document.getText(range);
    if (lineText === "") {
        return false;
    }
    return !(/^\s+$/.test(lineText));
}
//# sourceMappingURL=no-loc-controller.js.map