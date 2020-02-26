"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const common_1 = require("../helper/common");
const format_1 = require("../helper/format");
const telemetryCommand = "insertAlert";
let commandOption;
function insertAlertCommand() {
    const commands = [
        { command: insertAlert.name, callback: insertAlert },
    ];
    return commands;
}
exports.insertAlertCommand = insertAlertCommand;
/**
 * Formats current selection as an alert
 */
function insertAlert() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    else {
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        let formattedText;
        if (!common_1.isMarkdownFileCheck(editor, false)) {
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
            }
            else {
                formattedText = format_1.format(selectedText, alertTypes.indexOf(qpSelection));
            }
            if (editor) {
                common_1.insertContentToEditor(editor, insertAlert.name, formattedText, true);
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
                common_1.sendTelemetryData(telemetryCommand, commandOption);
            }
        });
    }
}
exports.insertAlert = insertAlert;
//# sourceMappingURL=alert-controller.js.map