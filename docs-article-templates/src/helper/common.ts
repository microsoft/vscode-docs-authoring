"use-strict";

import { Uri, window, workspace} from "vscode";
import { output } from "../extension";
import { reporter } from "./telemetry";

/**
 * Create a posted warning message and applies the message to the log
 * @param {string} message - the message to post to the editor as an warning.
 */
export function postWarning(message: string) {
    debug(message);
    window.showWarningMessage(message);
}

/**
 * Create a posted information message and applies the message to the log
 * @param {string} message - the message to post to the editor as an information.
 */
export function postInformation(message: string) {
    debug(message);
    window.showInformationMessage(message);
}

/**
 * Create a posted information message and applies the message to the log
 * @param {string} message - the message to post to the editor as an information.
 */
export function postError(message: string) {
    debug(message);
    window.showErrorMessage(message);
}

export function hasValidWorkSpaceRootPath(senderName: string) {
    const folderPath = workspace.rootPath;

    if (folderPath == null) {
        postWarning(`The ${senderName} command requires an active workspace. Please open VS Code from the root of your clone to continue.`);
        return false;
    }

    return true;
}

/**
 * Provides a common tool for logging. Currently prints to the console (when debugging), and nothing else.
 * @param {any} message - the object to be written to the log. This does not strictly require string type.
 */
export function debug(message: any) {
    process.stdout.write(message + "\n");
}

/**
 * Create timestamp
 */
export function generateTimestamp() {
    const date = new Date(Date.now());
    return {
        msDateValue: date.toLocaleDateString("en-us"),
        msTimeValue: date.toLocaleTimeString([], { hour12: false }),
    };
}

/**
 * Formats unit and module names.  Replaces spaces with dashes and set text to lowercase.
 * @param {string} name - Friendly name.
 */
export function formatLearnNames(name: string) {
    const formattedName = name.replace(/ /g, "-").toLowerCase();
    return {
        formattedName,
    };
}

/**
 * Return repo name
 * @param Uri
 */
export function getRepoName(workspacePath: Uri) {
    const repo = workspace.getWorkspaceFolder(workspacePath);
    if (repo) {
        const repoName = repo.name;
        return repoName;
    }
}

export function sendTelemetryData(telemetryCommand: string, commandOption: string) {
    const editor = window.activeTextEditor;
    const workspaceUri = editor.document.uri;
    const activeRepo = getRepoName(workspaceUri);
    const telemetryProperties = activeRepo ? { command_option: commandOption, repo_name: activeRepo } : { command_option: commandOption, repo_name: "" };
    reporter.sendTelemetryEvent(telemetryCommand, telemetryProperties);
}

/**
 * Output message with timestamp
 * @param message
 */
export function showStatusMessage(message: string) {
    const { msTimeValue } = generateTimestamp();
    output.appendLine(`[${msTimeValue}] - ` + message);
}
