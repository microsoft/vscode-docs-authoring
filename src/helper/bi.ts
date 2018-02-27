"use-strict";

import * as vscode from "vscode";
import * as log from "./log";

// BI.ts will be used to house telemetry, feedback and BI-related functions.
export function githubIssueCommand() {
    const commands = [
        { command: fileGitHubIssue.name, callback: fileGitHubIssue },
    ];
    return commands;
}

// Open a link to file Gauntlet feedback and bugs in the users default browser.
export function fileGitHubIssue() {
    log.telemetry(fileGitHubIssue.name, "");

    const uri = vscode.Uri.parse("http://aka.ms/GauntletBug");

    try {
        const success = vscode.commands.executeCommand("vscode.open", uri);
        log.debug("Launched bug template successfully.");
        return success;
    } catch (error) {
        log.debug("Create Feedback Error: " + error);
    }
}
