"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const extension_1 = require("../extension");
const common_1 = require("../helper/common");
const utility_1 = require("../helper/utility");
const telemetryCommand = "insertTable";
let commandOption;
function insertTableCommand() {
    const commands = [
        { command: insertTable.name, callback: insertTable },
    ];
    return commands;
}
exports.insertTableCommand = insertTableCommand;
function insertTable() {
    let logTableMessage;
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    if (!common_1.isValidEditor(editor, false, insertTable.name)) {
        return;
    }
    if (!common_1.isMarkdownFileCheck(editor, false)) {
        return;
    }
    const tableInput = vscode.window.showInputBox({ prompt: "Input the number of columns and rows as C:R" });
    // gets the users input on number of columns and rows
    tableInput.then((val) => {
        if (!val) {
            return;
        }
        else {
            const size = val.split(":");
            /// check valid value and exceed 4*4
            if (utility_1.validateTableRowAndColumnCount(size.length, size[0], size[1])) {
                const col = Number.parseInt(size[0]);
                const row = Number.parseInt(size[1]);
                const str = utility_1.tableBuilder(col, row);
                common_1.insertContentToEditor(editor, insertTable.name, str);
                logTableMessage = col + ":" + row;
            }
            else {
                extension_1.output.appendLine("Table insert failed.");
            }
            commandOption = logTableMessage;
            common_1.sendTelemetryData(telemetryCommand, commandOption);
        }
    });
}
exports.insertTable = insertTable;
//# sourceMappingURL=table-controller.js.map