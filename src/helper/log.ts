"use strict";

import * as vscode from "vscode";

export let extensionEnvironment = {
    Develop: "Develop",
    Production: "Production",
    Staging: "Staging",
    Test: "Test",
    Unknown: "Unknown",
};

/**
 * Provides a common tool for logging. Currently prints to the console (when debugging), and nothing else.
 * @param {any} message - the object to be written to the log. This does not strictly require string type.
 */
export function debug(message: any) {
    process.stdout.write(message + "\n");
}

/**
 * Create a posted error message and applies the message to the log
 * @param {string} message - the message to post to the editor as an error.
 */
export async function information(message: string) {
    debug(message);
    vscode.window.showInformationMessage(message);
}

/**
 * Create a posted error message and applies the message to the log
 * @param {string} message - the message to post to the editor as an error.
 */
export async function error(message: string) {
    debug(message);
    vscode.window.showErrorMessage(message);
}

/**
 * Build log trace and send to SkyEye log database
 * @param {string} commandName - the command name that user use.
 */
export async function telemetry(commandName: string, message: string) {
    process.stdout.write(commandName + ": " + message + "\n");
}
