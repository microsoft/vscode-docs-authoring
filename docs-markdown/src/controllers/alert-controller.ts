"use strict";

import * as vscode from "vscode";
import { insertContentToEditor, isMarkdownFileCheck, noActiveEditorMessage } from "../helper/common";
import { format } from "../helper/format";
import { sendTelemetryData } from "../helper/telemetry";

const telemetryCommand: string = "insertAlert";
let commandOption: string;

export function insertAlertCommand() {
    const commands = [
        { command: insertAlert.name, callback: insertAlert },
    ];
    return commands;
}

/**
 * Formats current selection as an alert
 */
export function insertAlert() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    } else {
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        let formattedText;

        if (!isMarkdownFileCheck(editor, false)) {
            return;
        }

        const alertTypes = [
            "Note – Information the user should notice even if skimming",
            "Tip - Optional information to help a user be more successful",
            "Important – Essential information required for user success",
            "Caution - Negative potential consequences of an action",
            "Warning – Dangerous certain consequences of an action",
        ];
        vscode.window.showQuickPick(alertTypes).then((qpSelection) => {
            if (!qpSelection) {
                return;
            } else {
                formattedText = format(selectedText, alertTypes.indexOf(qpSelection));
            }
            if (editor) {
                insertContentToEditor(editor, insertAlert.name, formattedText, true);
                if (qpSelection.startsWith("Note")) {
                    commandOption = "note";
                }
                if (qpSelection.startsWith("Tip")) {
                    commandOption = "tip";
                }
                if (qpSelection.startsWith("Important")) {
                    commandOption = "important";
                }
                if (qpSelection.startsWith("Caution")) {
                    commandOption = "caution";
                }
                if (qpSelection.startsWith("Warning")) {
                    commandOption = "warning";
                }
                sendTelemetryData(telemetryCommand, commandOption);
            }
        });
    }
}
