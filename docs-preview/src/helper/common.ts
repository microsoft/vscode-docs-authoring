"use-strict";

import * as vscode from "vscode";

/**
 * Create a posted warning message and applies the message to the log
 * @param {string} message - the message to post to the editor as an warning.
 */
export function postWarning(message: string) {
    vscode.window.showWarningMessage(message);
}

/**
 * Create a posted information message and applies the message to the log
 * @param {string} message - the message to post to the editor as an information.
 */
export function postInformation(message: string) {
    vscode.window.showInformationMessage(message);
}

/**
 * Create a posted information message and applies the message to the log
 * @param {string} message - the message to post to the editor as an information.
 */
export function postError(message: string) {
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
 * Create timestamp
 */
export function generateTimestamp() {
    const date = new Date(Date.now());
    return {
        msDateValue: date.toLocaleDateString("en-us"),
        msTimeValue: date.toLocaleTimeString([], { hour12: false }),
    };
}
