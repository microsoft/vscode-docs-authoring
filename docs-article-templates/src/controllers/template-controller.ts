"use strict";

import * as vscode from "vscode";
import { showTemplates } from "../controllers/quick-pick-controller";
import * as common from "../helper/common";
import * as github from "../helper/github";

const markdownExtensionFilter = [".md"];
const editor = vscode.window.activeTextEditor;
const telemetryCommand: string = "applyTemplate";

export function applyTemplateCommand() {
    const commands = [
        { command: applyTemplate.name, callback: applyTemplate },
    ];
    return commands;
}

export async function applyTemplate() {
    // generate current date/time for timestamp, clean up template directory and download copy of the template repo.
    common.generateTimestamp();
    github.cleanupDownloadFiles(true);
    github.downloadRepo();
    setTimeout(() => {
        showTemplates();
    }, 500);
}
