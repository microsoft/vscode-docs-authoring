"use strict";

import * as vscode from "vscode";
import * as common from "../helper/common";
import * as log from "../helper/log";
import * as utilityHelper from "../helper/utility";
import { reporter } from "../telemetry/telemetry";

const telemetryCommand: string = "insertTable";

export function insertTableCommand() {
    const commands = [
        { command: insertTable.name, callback: insertTable },
    ];
    return commands;
}

export function insertTable() {
    const editor = vscode.window.activeTextEditor;
    if (!common.isValidEditor(editor, false, insertTable.name)) {
        return;
    }

    if (!common.isMarkdownFileCheck(editor, false)) {
        return;
    }

    const tableInput = vscode.window.showInputBox({ prompt: "Input the number of columns and rows as C:R" });

    // gets the users input on number of columns and rows
    tableInput.then((val) => {

        const size = val.split(":");
        log.debug("Trying to validate user's input: " + size);

        /// check valid value and exceed 4*4
        if (utilityHelper.validateTableRowAndColumnCount(size.length, size[0], size[1])) {
            const col = Number.parseInt(size[0]);
            const row = Number.parseInt(size[1]);
            log.debug("Trying to create a table of: " + col + " columns and " + row + " rows.");

            const str = utilityHelper.tableBuilder(col, row);
            const logTableMessage = "." + col + ":" + row;
            reporter.sendTelemetryEvent("command", { command: telemetryCommand + logTableMessage });

            common.insertContentToEditor(editor, insertTable.name, str);
            log.debug("Table inserted. Rows: " + row + " Columns: " + col);
        } else {
            log.debug("Table insert failed.");
        }
    });
}
