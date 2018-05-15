"use-strict";

import * as vscode from "vscode";

export let msDateValue: string = "";

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

export function generateTimestamp() {
    const date = new Date(Date.now());
    const currentYear = date.getFullYear();
    // In Javascript, the month starts from 0 to 11, so we must add 1 to get the current month
    const currentMonth = (date.getMonth() + 1);
    const currentDay = date.getDate();
    msDateValue = currentMonth + "/" + currentDay + "/" + currentYear;
}
