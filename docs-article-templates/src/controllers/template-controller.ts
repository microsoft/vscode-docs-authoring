"use strict";

import * as fs from "fs";
import * as dir from "node-dir";
import * as os from "os";
import * as path from "path";
import * as vscode from "vscode";
import * as common from "../helper/common";
import { reporter } from "../telemetry/telemetry";

const markdownExtensionFilter = [".md"];
const editor = vscode.window.activeTextEditor;
const telemetryCommand: string = "applyTemplate";
const templateDirectory = path.join(os.homedir(), "docs-templates");

export function applyTemplateCommand() {
    const commands = [
        { command: applyTemplate.name, callback: applyTemplate },
    ];
    return commands;
}

export function applyTemplate() {

    const download = require("download-git-repo");
    download("MicrosoftDocs/content-templates", templateDirectory, (err) => {
        common.debug(err ? "Error" : "Success");
    });

    // vscode.commands.executeCommand("workbench.action.files.newUntitledFile");

    dir.files(templateDirectory, (err: any, files: any) => {
        if (err) {
            common.debug(err);
            throw err;
        }

        const items: vscode.QuickPickItem[] = [];
        files.sort();

        {
            files.filter((file: any) => markdownExtensionFilter.indexOf(path.extname(file.toLowerCase()))
                !== -1).forEach((file: any) => {
                    if (path.basename(file).toLowerCase() !== "readme.md") {
                        items.push({ label: path.basename(file), description: path.dirname(file) });
                    }
                });
        }

        vscode.window.showQuickPick(items).then((qpSelection) => {
            if (!qpSelection) {
                return;
            } else {
                const qpFullPath = path.join(qpSelection.description, qpSelection.label);
                const content = fs.readFileSync(qpFullPath, "utf8");
                common.insertContentToEditor(editor, applyTemplate.name, content);
                // reporter.sendTelemetryEvent("command", { command: telemetryCommand + "." + qpSelection.label});
            }
        });
    });
}
