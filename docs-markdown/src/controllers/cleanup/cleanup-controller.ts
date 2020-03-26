"use strict";

import { existsSync } from "graceful-fs";
import { basename, extname, join } from "path";
import { ProgressLocation, QuickPickItem, QuickPickOptions, Uri, window, workspace } from "vscode";
import { postError, showStatusMessage, showWarningMessage } from "../../helper/common";
import { sendTelemetryData } from "../../helper/telemetry";
import { generateMasterRedirectionFile } from "../master-redirect-controller";
import { addPeriodsToAlt } from "./addPeriodsToAlt";
import { capitalizationOfMetadata } from "./capitalizationOfMetadata";
import { handleSingleValuedMetadata } from "./handleSingleValuedMetadata";
import { microsoftLinks } from "./microsoftLinks";
import { removeUnused } from "./remove-unused-assets-controller";
import { removeEmptyMetadata } from "./removeEmptyMetadata";
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
    const opts: QuickPickOptions = { placeHolder: "Cleanup..." };
    const items: QuickPickItem[] = [];
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
    items.push({
        description: "",
        label: "Empty metadata",
    });
    items.push({
        description: "",
        label: "Add periods to alt text",
    });

    return { items, opts };
}

export async function applyCleanupFile(uri: Uri) {
    const { items, opts } = getCleanUpQuickPick();
    const file = uri.fsPath;
    items.push({
        description: "",
        label: "Everything",
    });
    const selection = await window.showQuickPick(items, opts);
    if (!selection) {
        return;
    }
    // check for dirty file
    workspace.openTextDocument(Uri.parse(uri.path)).then((doc) => {
        if (doc.isDirty) {
            showWarningMessage(`Selected file ${file} is not saved and cannot be modified. Save file then run the command again.`);
            showStatusMessage(`Selected file ${file} is not saved and cannot be modified. Save file then run the command again.`);
        }
    });
    window.withProgress({
        cancellable: true,
        location: ProgressLocation.Notification,
        title: "Cleanup",
    }, (progress, token) => {
        token.onCancellationRequested(() => {
            postError("User canceled the long running operation");
        });
        progress.report({ increment: 0 });
        const percentComplete = 0;
        let message = "Cleanup";
        let statusMessage = "";
        const promises: Array<Promise<any>> = [];
        progress.report({ increment: 0, message });
        return new Promise(async (resolve) => {
            switch (selection.label.toLowerCase()) {
                case "single-valued metadata":
                    showStatusMessage("Cleanup: Single-Valued metadata started.");
                    message = "Single-Valued metadata completed.";
                    statusMessage = "Cleanup: Single-Valued metadata completed.";
                    promises.push(handleSingleValuedMetadata(progress, file, percentComplete, null, null));
                    commandOption = "single-value";
                    break;
                case "microsoft links":
                    showStatusMessage("Cleanup: Microsoft Links started.");
                    message = "Microsoft Links completed.";
                    statusMessage = "Cleanup: Microsoft Links completed.";
                    promises.push(microsoftLinks(progress, file, percentComplete, null, null));
                    commandOption = "links";
                    break;
                case "capitalization of metadata values":
                    showStatusMessage("Cleanup: Capitalization of metadata values started.");
                    message = "Capitalization of metadata values completed.";
                    statusMessage = "Cleanup: Capitalization of metadata values completed.";
                    promises.push(capitalizationOfMetadata(progress, file, percentComplete, null, null));
                    commandOption = "capitalization";
                    break;
                case "add periods to alt text":
                    showStatusMessage("Cleanup: Add periods to alt text.");
                    message = "Add periods to alt text values completed.";
                    statusMessage = "Cleanup: Add periods to alt text values completed.";
                    promises.push(addPeriodsToAlt(progress, file, percentComplete, null, null));
                    commandOption = "add-periods-to-alt-text";
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
                    promises.push(runAll(progress, file, percentComplete, null, null));
                    commandOption = "everything";
                    break;
                case "empty metadata":
                    const opts: QuickPickOptions = { placeHolder: "Cleanup..." };
                    const items: QuickPickItem[] = [];
                    items.push({
                        description: "",
                        label: "Remove metadata attributes with empty values",
                    });
                    items.push({
                        description: "",
                        label: `Remove metadata attributes with "na" or "n/a"`,
                    });
                    items.push({
                        description: "",
                        label: "Remove commented out metadata attributes",
                    });
                    items.push({
                        description: "",
                        label: "Remove all",
                    });
                    showStatusMessage("Cleanup: Metadata attribute cleanup started.");
                    message = "Empty metadata attribute cleanup completed.";
                    statusMessage = "Cleanup: Metadata attribute cleanup completed.";
                    window.showQuickPick(items, opts).then((selection) => {
                        if (!selection) {
                            return;
                        }
                        switch (selection.label.toLowerCase()) {
                            case "remove metadata attributes with empty values":
                                promises.push(removeEmptyMetadata(progress, file, percentComplete, null, null, "empty"));
                                commandOption = "remove-empty";
                                break;
                            case `remove metadata attributes with "na" or "n/a"`:
                                promises.push(removeEmptyMetadata(progress, file, percentComplete, null, null, "na"));
                                commandOption = "remove-na";
                                break;
                            case "remove commented out metadata attributes":
                                promises.push(removeEmptyMetadata(progress, file, percentComplete, null, null, "commented"));
                                commandOption = "remove-commented";
                                break;
                            case "remove all":
                                promises.push(removeEmptyMetadata(progress, file, percentComplete, null, null, "all"));
                                commandOption = "remove-all-empty";
                                break;
                        }
                    });
            }
            Promise.all(promises).then(() => {
                progress.report({ increment: 100, message });
                showStatusMessage(statusMessage);
                progress.report({ increment: 100, message: `100%` });
                resolve();
            }).catch((err) => {
                postError(err);
            });
            sendTelemetryData(telemetryCommand, commandOption);
        });
    });
}

export async function applyCleanupFolder(uri: Uri) {
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
        cancellable: true,
        location: ProgressLocation.Notification,
        title: "Cleanup",
    }, (progress, token) => {
        token.onCancellationRequested(() => {
            postError("User canceled the long running operation");
        });
        progress.report({ increment: 0 });
        return new Promise((resolve, reject) => {
            let message = "";
            let statusMessage = "";
            const percentComplete = 0;
            recursive(uri.fsPath,
                [".git", ".github", ".vscode", ".vs", "node_module"],
                async (err: any, files: string[]) => {
                    if (err) {
                        postError(err);
                    }
                    const promises: Array<Promise<any>> = [];
                    // check for dirty files
                    files.map((file, index) => {
                        const fileName = basename(file);
                        const modifiedUri = join(uri.path, fileName).replace(/\\/g, "/");
                        if (extname(modifiedUri) === ".md") {
                            workspace.openTextDocument(Uri.parse(modifiedUri)).then((doc) => {
                                if (doc.isDirty) {
                                    showWarningMessage(`Selected file ${file} is not saved and cannot be modified. Save file then run the command again.`);
                                    showStatusMessage(`Selected file ${file} is not saved and cannot be modified. Save file then run the command again.`);
                                }
                            });
                        }
                    });
                    switch (selection.label.toLowerCase()) {
                        case "single-valued metadata":
                            showStatusMessage("Cleanup: Single-Valued metadata started.");
                            message = "Single-Valued metadata completed.";
                            statusMessage = "Cleanup: Single-Valued metadata completed.";
                            files.map((file, index) => {
                                promises.push(handleSingleValuedMetadata(progress, file, percentComplete, files, index));
                            });
                            commandOption = "single-value";
                            break;
                        case "microsoft links":
                            showStatusMessage("Cleanup: Microsoft Links started.");
                            message = "Microsoft Links completed.";
                            statusMessage = "Cleanup: Microsoft Links completed.";
                            files.map((file, index) => {
                                promises.push(microsoftLinks(progress, file, percentComplete, files, index));
                            });
                            commandOption = "links";
                            break;
                        case "capitalization of metadata values":
                            showStatusMessage("Cleanup: Capitalization of metadata values started.");
                            message = "Capitalization of metadata values completed.";
                            statusMessage = "Cleanup: Capitalization of metadata values completed.";
                            files.map((file, index) => {
                                promises.push(capitalizationOfMetadata(progress, file, percentComplete, files, index));
                            });
                            commandOption = "capitalization";
                            break;
                        case "add periods to alt text":
                            showStatusMessage("Cleanup: Add periods to alt text.");
                            message = "Add periods to alt text values completed.";
                            statusMessage = "Cleanup: Add periods to alt text values completed.";
                            files.map((file, index) => {
                                promises.push(addPeriodsToAlt(progress, file, percentComplete, files, index));
                            });
                            commandOption = "add-periods-to-alt-text";
                            break;
                        case "everything":
                            showStatusMessage("Cleanup: Everything started.");
                            message = "Everything completed.";
                            statusMessage = "Cleanup: Everything completed.";
                            files.map((file, index) => {
                                promises.push(runAll(progress, file, percentComplete, files, index));
                            });
                            commandOption = "everything";
                            break;
                        case "empty metadata":
                            const opts: QuickPickOptions = { placeHolder: "Cleanup..." };
                            const items: QuickPickItem[] = [];
                            items.push({
                                description: "",
                                label: "Remove metadata attributes with empty values",
                            });
                            items.push({
                                description: "",
                                label: `Remove metadata attributes with "na" or "n/a"`,
                            });
                            items.push({
                                description: "",
                                label: "Remove commented out metadata attributes",
                            });
                            items.push({
                                description: "",
                                label: "Remove all",
                            });
                            showStatusMessage("Cleanup: Metadata attribute cleanup started.");
                            const selection = await window.showQuickPick(items, opts);
                            if (!selection) {
                                return;
                            }
                            message = "Empty metadata attribute cleanup completed.";
                            statusMessage = "Cleanup: Metadata attribute cleanup completed.";
                            switch (selection.label.toLowerCase()) {
                                case "remove metadata attributes with empty values":
                                    files.map((file, index) => {
                                        promises.push(removeEmptyMetadata(progress, file, percentComplete, files, index, "empty"));
                                    });
                                    commandOption = "remove-empty";
                                    break;
                                case `remove metadata attributes with "na" or "n/a"`:
                                    files.map((file, index) => {
                                        promises.push(removeEmptyMetadata(progress, file, percentComplete, files, index, "na"));
                                    });
                                    commandOption = "remove-na";
                                    break;
                                case "remove commented out metadata attributes":
                                    files.map((file, index) => {
                                        promises.push(removeEmptyMetadata(progress, file, percentComplete, files, index, "commented"));
                                    });
                                    commandOption = "remove-commented";
                                    break;
                                case "remove all":
                                    files.map((file, index) => {
                                        promises.push(removeEmptyMetadata(progress, file, percentComplete, files, index, "all"));
                                    });
                                    commandOption = "remove-all-empty";
                                    break;
                            }
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
        label: "Unused images and includes",
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
        cancellable: true,
        location: ProgressLocation.Notification,
        title: "Cleanup",
    }, (progress, token) => {
        token.onCancellationRequested(() => {
            postError("User canceled the long running operation");
        });
        progress.report({ increment: 0 });
        return new Promise(async (resolve, reject) => {
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
                    const promises: Array<Promise<any>> = [];
                    const percentComplete = 0;
                    switch (selection.label.toLowerCase()) {
                        case "single-valued metadata":
                            showStatusMessage("Cleanup: Single-Valued metadata started.");
                            message = "Single-Valued metadata completed.";
                            statusMessage = "Cleanup: Single-Valued metadata completed.";
                            promises.push(recurseCallback(workspacePath, progress, percentComplete, handleSingleValuedMetadata));
                            commandOption = "single-value";
                            break;
                        case "microsoft links":
                            showStatusMessage("Cleanup: Microsoft Links started.");
                            message = "Microsoft Links completed.";
                            statusMessage = "Cleanup: Microsoft Links completed.";
                            promises.push(recurseCallback(workspacePath, progress, percentComplete, microsoftLinks));
                            commandOption = "links";
                            break;
                        case "capitalization of metadata values":
                            showStatusMessage("Cleanup: Capitalization of metadata values started.");
                            message = "Capitalization of metadata values completed.";
                            statusMessage = "Cleanup: Capitalization of metadata values completed.";
                            promises.push(recurseCallback(workspacePath, progress, percentComplete, capitalizationOfMetadata));
                            commandOption = "capitalization";
                            break;
                        case "add periods to alt text":
                            showStatusMessage("Cleanup: Add periods to alt text.");
                            message = "Add periods to alt text values completed.";
                            statusMessage = "Cleanup: Add periods to alt text values completed.";
                            promises.push(recurseCallback(workspacePath, progress, percentComplete, addPeriodsToAlt));
                            commandOption = "add-periods-to-alt-text";
                            break;
                        case "master redirection file":
                            showStatusMessage("Cleanup: Master redirection started.");
                            message = "Master redirection complete.";
                            statusMessage = "Cleanup: Master redirection completed.";
                            generateMasterRedirectionFile(workspacePath, resolve);
                            commandOption = "redirects";
                            break;
                        case "unused images and includes":
                            showStatusMessage("Cleanup: Unused Images and includes.");
                            message = "Removal of unused images and includes complete.";
                            statusMessage = "Cleanup: Removing unused images and includes. This could take several minutes.";
                            promises.push(removeUnused(progress, percentComplete, workspacePath));
                            commandOption = "unused-images-and-includes";
                            break;
                        case "everything":
                            await runAllWorkspace(workspacePath, progress, resolve);
                            commandOption = "everything";
                            break;
                        case "empty metadata":
                            const opts: QuickPickOptions = { placeHolder: "Cleanup..." };
                            const items: QuickPickItem[] = [];
                            items.push({
                                description: "",
                                label: "Remove metadata attributes with empty values",
                            });
                            items.push({
                                description: "",
                                label: `Remove metadata attributes with "na" or "n/a"`,
                            });
                            items.push({
                                description: "",
                                label: "Remove commented out metadata attributes",
                            });
                            items.push({
                                description: "",
                                label: "Remove all",
                            });
                            showStatusMessage("Cleanup: Metadata attribute cleanup started.");
                            const selection = await window.showQuickPick(items, opts);
                            if (!selection) {
                                return;
                            }
                            message = "Empty metadata attribute cleanup completed.";
                            statusMessage = "Cleanup: Metadata attribute cleanup completed.";
                            promises.push(new Promise((chainResolve, chainReject) => {
                                recursive(workspacePath,
                                    [".git", ".github", ".vscode", ".vs", "node_module"],
                                    (err: any, files: string[]) => {
                                        if (err) {
                                            postError(err);
                                            chainReject();
                                        }
                                        const filePromises: Array<Promise<any>> = [];
                                        switch (selection.label.toLowerCase()) {
                                            case "remove metadata attributes with empty values":
                                                files.map((file, index) => {
                                                    filePromises.push(removeEmptyMetadata(progress, file, percentComplete, files, index, "empty"));
                                                });
                                                commandOption = "remove-empty";
                                                break;
                                            case `remove metadata attributes with "na" or "n/a"`:
                                                files.map((file, index) => {
                                                    filePromises.push(removeEmptyMetadata(progress, file, percentComplete, files, index, "na"));
                                                });
                                                commandOption = "remove-na";
                                                break;
                                            case "remove commented out metadata attributes":
                                                files.map((file, index) => {
                                                    filePromises.push(removeEmptyMetadata(progress, file, percentComplete, files, index, "commented"));
                                                });
                                                commandOption = "remove-commented";
                                                break;
                                            case "remove all":
                                                files.map((file, index) => {
                                                    filePromises.push(removeEmptyMetadata(progress, file, percentComplete, files, index, "all"));
                                                });
                                                commandOption = "remove-all";
                                                break;
                                        }
                                        Promise.all(filePromises).then(() => {
                                            progress.report({ increment: 100, message });
                                            progress.report({ increment: 100, message: `100%` });
                                            chainResolve();
                                        }).catch((err) => {
                                            postError(err);
                                        });
                                    });
                            }));
                    }
                    await Promise.all(promises).then(() => {
                        progress.report({ increment: 100, message });
                        showStatusMessage(statusMessage);
                        progress.report({ increment: 100, message: `100%` });
                        resolve();
                    }).catch((err) => {
                        postError(err);
                    });
                    sendTelemetryData(telemetryCommand, commandOption);
                }
            }
        });
    });
}
function recurseCallback(workspacePath: string, progress: any, percentComplete: number, callback: (progress: any, file: string, percentComplete: number, files: string[], index: number) => Promise<any>): Promise<any> {
    return new Promise((chainResolve, chainReject) =>
        recursive(workspacePath, [".git", ".github", ".vscode", ".vs", "node_module"], (err: any, files: string[]) => {
            if (err) {
                postError(err);
                chainReject();
            }
            const filePromises: Array<Promise<any>> = [];
            files.map((file, index) => {
                filePromises.push(callback(progress, file, percentComplete, files, index));
            });
            Promise.all(filePromises).then(() => {
                chainResolve();
            });
        }));
}
