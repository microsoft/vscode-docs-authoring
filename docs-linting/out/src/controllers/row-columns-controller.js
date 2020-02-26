"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const common_1 = require("../helper/common");
const rows_columns_1 = require("../helper/rows-columns");
const rowWithColumns = "Two-column structure";
const newColumn = "New column";
const newColumnWithSpan = "New column with span";
const telemetryCommand = "insertColumn";
let commandOption;
function insertRowsAndColumnsCommand() {
    const commands = [
        { command: insertRowsAndColumns.name, callback: insertRowsAndColumns },
    ];
    return commands;
}
exports.insertRowsAndColumnsCommand = insertRowsAndColumnsCommand;
function insertRowsAndColumns() {
    const editor = vscode_1.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    else {
        if (!common_1.isMarkdownFileCheck(editor, false)) {
            return;
        }
        const commandOptions = [
            rowWithColumns,
            newColumn,
            newColumnWithSpan
        ];
        vscode_1.window.showQuickPick(commandOptions).then((qpSelection) => {
            if (!qpSelection) {
                return;
            }
            switch (qpSelection) {
                case rowWithColumns:
                    insertRowsWithColumns();
                    break;
                case newColumn:
                    insertNewColumn();
                    break;
                case newColumnWithSpan:
                    insertNewColumnWithSpan();
                    break;
            }
        });
    }
}
exports.insertRowsAndColumns = insertRowsAndColumns;
function insertRowsWithColumns() {
    rows_columns_1.createRow(2);
    commandOption = "row";
    common_1.sendTelemetryData(telemetryCommand, commandOption);
}
exports.insertRowsWithColumns = insertRowsWithColumns;
function insertNewColumn() {
    rows_columns_1.addNewColumn();
    commandOption = "column";
    common_1.sendTelemetryData(telemetryCommand, commandOption);
}
exports.insertNewColumn = insertNewColumn;
function insertNewColumnWithSpan() {
    rows_columns_1.addNewColumnWithSpan();
    commandOption = "column-with-span";
    common_1.sendTelemetryData(telemetryCommand, commandOption);
}
exports.insertNewColumnWithSpan = insertNewColumnWithSpan;
//# sourceMappingURL=row-columns-controller.js.map