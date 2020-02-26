"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const common_1 = require("../helper/common");
const telemetryCommandLink = "sortSelection";
function insertSortSelectionCommands() {
    return [
        { command: sortSelectionAscending.name, callback: sortSelectionAscending },
        { command: sortSelectionDescending.name, callback: sortSelectionDescending },
    ];
}
exports.insertSortSelectionCommands = insertSortSelectionCommands;
function sortSelectionAscending() {
    return sortLines(true);
}
exports.sortSelectionAscending = sortSelectionAscending;
function sortSelectionDescending() {
    return sortLines(false);
}
exports.sortSelectionDescending = sortSelectionDescending;
function sortLines(ascending = true) {
    const editor = vscode_1.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return undefined;
    }
    const selection = editor.selection;
    if (selection.isEmpty || selection.isSingleLine) {
        return undefined;
    }
    const startLine = selection.start.line;
    const endLine = selection.end.line;
    const lines = [];
    for (let i = startLine; i <= endLine; ++i) {
        lines.push(editor.document.lineAt(i).text);
    }
    lines.sort(common_1.naturalLanguageCompare);
    if (!ascending) {
        lines.reverse();
    }
    common_1.sendTelemetryData(telemetryCommandLink, ascending ? "sortAscending" : "sortDescending");
    return editor.edit((builder) => {
        const range = new vscode_1.Range(startLine, 0, endLine, editor.document.lineAt(endLine).text.length);
        builder.replace(range, lines.join("\n"));
    });
}
//# sourceMappingURL=sort-controller.js.map