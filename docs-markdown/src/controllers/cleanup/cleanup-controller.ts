"use strict";

import { existsSync, readFile } from "graceful-fs";
import { join } from "path";
import * as vscode from "vscode";
import { ProgressLocation, window, workspace } from "vscode";
import { postError, sendTelemetryData, showStatusMessage } from "../../helper/common";
import { generateMasterRedirectionFile } from "../master-redirect-controller";
import { capitalizationOfMetadata } from "./capitalizationOfMetadata";
import { handleSingleValuedMetadata } from "./handleSingleValuedMetadata";
import { microsoftLinks } from "./microsoftLinks";
import { runAll, runAllWorkspace } from "./runAll";
// tslint:disable no-var-requires
const recursive = require("recursive-readdir");

const telemetryCommand: string = "applyCleanup";
let commandOption: string;

export function applyCleanupCommand() {
    const commands = [
        { command: applyCleanup.name, callback: applyCleanup },
    ];
    return commands;
}

function getCleanUpQuickPick() {
    const opts: vscode.QuickPickOptions = { placeHolder: "Cleanup..." };
    const items: vscode.QuickPickItem[] = [];
    items.push({
        description: "",
        label: "Single-valued metadata",
    });
    items.push({
        description: "",
        label: "Microsoft links",
    });
    items.push({
        description: "",
        label: "Capitalization of metadata values",
    });

    return { items, opts };
}

export async function applyCleanupFile(file: string) {
    const { items, opts } = getCleanUpQuickPick();
    items.push({
        description: "",
        label: "Everything",
    });
    const selection = await window.showQuickPick(items, opts);
    if (!selection) {
        return;
    }
    window.withProgress({
        location: ProgressLocation.Notification,
        title: "Cleanup",
        cancellable: true,
    }, (progress, token) => {
        token.onCancellationRequested(() => {
            postError("User canceled the long running operation");
        });
        progress.report({ increment: 0 });
        let percentComplete = 0;
        let message = "Cleanup";
        let statusMessage = "";
        let promises: Array<Promise<any>> = [];
        progress.report({ increment: 0, message });
        return new Promise((resolve) => {
            switch (selection.label.toLowerCase()) {
                case "single-valued metadata":
                    showStatusMessage("Cleanup: Single-Valued metadata started.");
                    message = "Single-Valued metadata completed.";
                    statusMessage = "Cleanup: Single-Valued metadata completed.";
                    promises = handleSingleValuedMetadata(progress, promises, file, percentComplete, null, null);
                    commandOption = "single-value";
                    break;
                case "microsoft links":
                    showStatusMessage("Cleanup: Microsoft Links started.");
                    message = "Microsoft Links completed.";
                    statusMessage = "Cleanup: Microsoft Links completed.";
                    promises = microsoftLinks(progress, promises, file, percentComplete, null, null);
                    commandOption = "links";
                    break;
                case "capitalization of metadata values":
                    showStatusMessage("Cleanup: Capitalization of metadata values started.");
                    message = "Capitalization of metadata values completed.";
                    statusMessage = "Cleanup: Capitalization of metadata values completed.";
                    promises = capitalizationOfMetadata(progress, promises, file, percentComplete, null, null);
                    commandOption = "capitalization";
                    break;
                case "master redirection file":
                    showStatusMessage("Cleanup: Master redirection started.");
                    message = "Master redirection complete.";
                    statusMessage = "Cleanup: Master redirection completed.";
                    generateMasterRedirectionFile(file, resolve);
                    commandOption = "redirects";
                    break;
                case "everything":
                    showStatusMessage("Cleanup: Everything started.");
                    message = "Everything complete.";
                    statusMessage = "Cleanup: Everything completed.";
                    promises = runAll(progress, promises, file, percentComplete, null, null);
                    commandOption = "everything";
                    break;
            }
            Promise.all(promises).then(() => {
                progress.report({ increment: 100, message });
                showStatusMessage(statusMessage);
                progress.report({ increment: 100, message: `100%` });
                resolve();
            }).catch(err => {
                postError(err);
            });
            sendTelemetryData(telemetryCommand, commandOption);
        });
    });
}

export async function applyCleanupFolder(folder: string) {
    const { items, opts } = getCleanUpQuickPick();
    items.push({
        description: "",
        label: "Everything",
    });
    const selection = await window.showQuickPick(items, opts);
    if (!selection) {
        return;
    }
    window.withProgress({
        location: ProgressLocation.Notification,
        title: "Cleanup",
        cancellable: true,
    }, (progress, token) => {
        token.onCancellationRequested(() => {
            postError("User canceled the long running operation");
        });
        progress.report({ increment: 0 });
        return new Promise((resolve, reject) => {
            let message = "";
            let statusMessage = "";
            const percentComplete = 0;
            let promises: Array<Promise<any>> = [];
            recursive(folder,
                [".git", ".github", ".vscode", ".vs", "node_module"],
                (err: any, files: string[]) => {
                    if (err) {
                        postError(err);
                    }
                    switch (selection.label.toLowerCase()) {
                        case "single-valued metadata":
                            showStatusMessage("Cleanup: Single-Valued metadata started.");
                            message = "Single-Valued metadata completed.";
                            statusMessage = "Cleanup: Single-Valued metadata completed.";
                            files.map((file, index) => {
                                promises = handleSingleValuedMetadata(progress, promises, file, percentComplete, files, index);
                            });
                            commandOption = "single-value";
                            break;
                        case "microsoft links":
                            showStatusMessage("Cleanup: Microsoft Links started.");
                            message = "Microsoft Links completed.";
                            statusMessage = "Cleanup: Microsoft Links completed.";
                            files.map((file, index) => {
                                promises = microsoftLinks(progress, promises, file, percentComplete, files, index);
                            });
                            commandOption = "links";
                            break;
                        case "capitalization of metadata values":
                            showStatusMessage("Cleanup: Capitalization of metadata values started.");
                            message = "Capitalization of metadata values completed.";
                            statusMessage = "Cleanup: Capitalization of metadata values completed.";
                            files.map((file, index) => {
                                promises = capitalizationOfMetadata(progress, promises, file, percentComplete, files, index);
                            });
                            commandOption = "capitalization";
                            break;
                        case "everything":
                            showStatusMessage("Cleanup: Everything started.");
                            message = "Everything completed.";
                            statusMessage = "Cleanup: Everything completed.";
                            files.map((file, index) => {
                                promises = runAll(progress, promises, file, percentComplete, files, index);
                            });
                            commandOption = "everything";
                            break;
                    }
                    Promise.all(promises).then(() => {
                        progress.report({ increment: 100, message });
                        showStatusMessage(statusMessage);
                        progress.report({ increment: 100, message: `100%` });
                        resolve();
                    }).catch((err) => {
                        postError(err);
                    });
                });
            commandOption = "single-value";
            sendTelemetryData(telemetryCommand, commandOption);
        });
    });
}

export async function applyCleanup() {
    const { items, opts } = getCleanUpQuickPick();
    items.push({
        description: "",
        label: "Master redirection file",
    });
    items.push({
        description: "",
        label: "Everything",
    });
    const selection = await window.showQuickPick(items, opts);
    if (!selection) {
        return;
    }
    window.withProgress({
        location: ProgressLocation.Notification,
        title: "Cleanup",
        cancellable: true,
    }, (progress, token) => {
        token.onCancellationRequested(() => {
            postError("User canceled the long running operation");
        });
        progress.report({ increment: 0 });
        return new Promise((resolve, reject) => {
            const editor = window.activeTextEditor;
            if (editor) {
                const resource = editor.document.uri;
                const folder = workspace.getWorkspaceFolder(resource);

                if (folder) {
                    const workspacePath = folder.uri.fsPath;

                    if (workspacePath == null) {
                        postError("No workspace is opened.");
                        reject();
                    }

                    // Check if the current workspace is the root folder of a repo by checking if the .git folder is present
                    const gitDir = join(workspacePath, ".git");
                    if (!existsSync(gitDir)) {
                        postError("Current workspace is not root folder of a repo.");
                        reject();
                    }
                    let message = "";
                    let statusMessage = "";
                    let promises: Array<Promise<any>> = [];
                    const percentComplete = 0;
                    switch (selection.label.toLowerCase()) {
                        case "single-valued metadata":
                            showStatusMessage("Cleanup: Single-Valued metadata started.");
                            message = "Single-Valued metadata completed.";
                            statusMessage = "Cleanup: Single-Valued metadata completed.";
                            recursive(workspacePath,
                                [".git", ".github", ".vscode", ".vs", "node_module"],
                                (err: any, files: string[]) => {
                                    if (err) {
                                        postError(err);
                                    }
                                    files.map((file, index) => {
                                        promises = handleSingleValuedMetadata(progress, promises, file, percentComplete, files, index);
                                    })
                                })
                            commandOption = "single-value";
                            break;
                        case "microsoft links":
                            showStatusMessage("Cleanup: Microsoft Links started.");
                            message = "Microsoft Links completed.";
                            statusMessage = "Cleanup: Microsoft Links completed.";
                            recursive(workspacePath,
                                [".git", ".github", ".vscode", ".vs", "node_module"],
                                (err: any, files: string[]) => {
                                    if (err) {
                                        postError(err);
                                    }
                                    files.map((file, index) => {
                                        promises = microsoftLinks(progress, promises, file, percentComplete, files, index);
                                    })
                                })
                            commandOption = "links";
                            break;
                        case "capitalization of metadata values":
                            showStatusMessage("Cleanup: Capitalization of metadata values started.");
                            message = "Capitalization of metadata values completed.";
                            statusMessage = "Cleanup: Capitalization of metadata values completed.";
                            recursive(workspacePath,
                                [".git", ".github", ".vscode", ".vs", "node_module"],
                                (err: any, files: string[]) => {
                                    if (err) {
                                        postError(err);
                                    }
                                    files.map((file, index) => {
                                        promises = capitalizationOfMetadata(progress, promises, file, percentComplete, files, index);
                                    })
                                })
                            commandOption = "capitalization";
                            break;
                        case "master redirection file":
                            showStatusMessage("Cleanup: Master redirection started.");
                            message = "Master redirection complete.";
                            statusMessage = "Cleanup: Master redirection completed.";
                            generateMasterRedirectionFile(workspacePath, resolve);
                            commandOption = "redirects";
                            break;
                        case "everything":
                            runAllWorkspace(workspacePath, progress, resolve);
                            commandOption = "everything";
                            break;
                    }
                    Promise.all(promises).then(() => {
                        progress.report({ increment: 100, message });
                        showStatusMessage(statusMessage);
                        progress.report({ increment: 100, message: `100%` });
                        resolve();
                    }).catch((err) => {
                        postError(err);
                    });
                    commandOption = "single-value";
                    sendTelemetryData(telemetryCommand, commandOption);
                }
            }
        });
    });
}
