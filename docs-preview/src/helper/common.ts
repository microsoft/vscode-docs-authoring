"use-strict";

import * as vscode from "vscode";

/**
 * Create a posted warning message and applies the message to the log
 * @param {string} message - the message to post to the editor as an warning.
 */
export function postWarning(message: string) {
    debug(message);
    vscode.window.showWarningMessage(message);
}

/**
 * Create a posted information message and applies the message to the log
 * @param {string} message - the message to post to the editor as an information.
 */
export function postInformation(message: string) {
    debug(message);
    vscode.window.showInformationMessage(message);
}

/**
 * Create a posted information message and applies the message to the log
 * @param {string} message - the message to post to the editor as an information.
 */
export function postError(message: string) {
    debug(message);
    vscode.window.showErrorMessage(message);
}

export function hasValidWorkSpaceRootPath(senderName: string) {
    const folderPath = vscode.workspace.rootPath;

    if (folderPath == null) {
        postWarning("The " + senderName + " command requires an active workspace. Please open VS Code from the root of your clone to continue.");
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
