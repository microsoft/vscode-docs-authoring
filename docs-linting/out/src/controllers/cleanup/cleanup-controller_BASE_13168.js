"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const graceful_fs_1 = require("graceful-fs");
const path_1 = require("path");
const vscode_1 = require("vscode");
const common_1 = require("../../helper/common");
const master_redirect_controller_1 = require("../master-redirect-controller");
const capitalizationOfMetadata_1 = require("./capitalizationOfMetadata");
const handleSingleValuedMetadata_1 = require("./handleSingleValuedMetadata");
const microsoftLinks_1 = require("./microsoftLinks");
const runAll_1 = require("./runAll");
// tslint:disable no-var-requires
const recursive = require("recursive-readdir");
const telemetryCommand = "applyCleanup";
let commandOption;
function applyCleanupCommand() {
    const commands = [
        { command: applyCleanup.name, callback: applyCleanup },
    ];
    return commands;
}
exports.applyCleanupCommand = applyCleanupCommand;
function getCleanUpQuickPick() {
    const opts = { placeHolder: "Cleanup..." };
    const items = [];
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
function applyCleanupFile(file) {
    return __awaiter(this, void 0, void 0, function* () {
        const { items, opts } = getCleanUpQuickPick();
        items.push({
            description: "",
            label: "Everything",
        });
        const selection = yield vscode_1.window.showQuickPick(items, opts);
        if (!selection) {
            return;
        }
        vscode_1.window.withProgress({
            location: vscode_1.ProgressLocation.Notification,
            title: "Cleanup",
            cancellable: true,
        }, (progress, token) => {
            token.onCancellationRequested(() => {
                common_1.postError("User canceled the long running operation");
            });
            progress.report({ increment: 0 });
            let percentComplete = 0;
            let message = "Cleanup";
            let statusMessage = "";
            let promises = [];
            progress.report({ increment: 0, message });
            return new Promise((resolve) => {
                switch (selection.label.toLowerCase()) {
                    case "single-valued metadata":
                        common_1.showStatusMessage("Cleanup: Single-Valued metadata started.");
                        message = "Single-Valued metadata completed.";
                        statusMessage = "Cleanup: Single-Valued metadata completed.";
                        promises = handleSingleValuedMetadata_1.handleSingleValuedMetadata(progress, promises, file, percentComplete, null, null);
                        commandOption = "single-value";
                        break;
                    case "microsoft links":
                        common_1.showStatusMessage("Cleanup: Microsoft Links started.");
                        message = "Microsoft Links completed.";
                        statusMessage = "Cleanup: Microsoft Links completed.";
                        promises = microsoftLinks_1.microsoftLinks(progress, promises, file, percentComplete, null, null);
                        commandOption = "links";
                        break;
                    case "capitalization of metadata values":
                        common_1.showStatusMessage("Cleanup: Capitalization of metadata values started.");
                        message = "Capitalization of metadata values completed.";
                        statusMessage = "Cleanup: Capitalization of metadata values completed.";
                        promises = capitalizationOfMetadata_1.capitalizationOfMetadata(progress, promises, file, percentComplete, null, null);
                        commandOption = "capitalization";
                        break;
                    case "master redirection file":
                        common_1.showStatusMessage("Cleanup: Master redirection started.");
                        message = "Master redirection complete.";
                        statusMessage = "Cleanup: Master redirection completed.";
                        master_redirect_controller_1.generateMasterRedirectionFile(file, resolve);
                        commandOption = "redirects";
                        break;
                    case "everything":
                        common_1.showStatusMessage("Cleanup: Everything started.");
                        message = "Everything complete.";
                        statusMessage = "Cleanup: Everything completed.";
                        promises = runAll_1.runAll(progress, promises, file, percentComplete, null, null);
                        commandOption = "everything";
                        break;
                }
                Promise.all(promises).then(() => {
                    progress.report({ increment: 100, message });
                    common_1.showStatusMessage(statusMessage);
                    progress.report({ increment: 100, message: `100%` });
                    resolve();
                }).catch(err => {
                    common_1.postError(err);
                });
                common_1.sendTelemetryData(telemetryCommand, commandOption);
            });
        });
    });
}
exports.applyCleanupFile = applyCleanupFile;
function applyCleanupFolder(folder) {
    return __awaiter(this, void 0, void 0, function* () {
        const { items, opts } = getCleanUpQuickPick();
        items.push({
            description: "",
            label: "Everything",
        });
        const selection = yield vscode_1.window.showQuickPick(items, opts);
        if (!selection) {
            return;
        }
        vscode_1.window.withProgress({
            location: vscode_1.ProgressLocation.Notification,
            title: "Cleanup",
            cancellable: true,
        }, (progress, token) => {
            token.onCancellationRequested(() => {
                common_1.postError("User canceled the long running operation");
            });
            progress.report({ increment: 0 });
            return new Promise((resolve, reject) => {
                let message = "";
                let statusMessage = "";
                const percentComplete = 0;
                let promises = [];
                recursive(folder, [".git", ".github", ".vscode", ".vs", "node_module"], (err, files) => {
                    if (err) {
                        common_1.postError(err);
                    }
                    switch (selection.label.toLowerCase()) {
                        case "single-valued metadata":
                            common_1.showStatusMessage("Cleanup: Single-Valued metadata started.");
                            message = "Single-Valued metadata completed.";
                            statusMessage = "Cleanup: Single-Valued metadata completed.";
                            files.map((file, index) => {
                                promises = handleSingleValuedMetadata_1.handleSingleValuedMetadata(progress, promises, file, percentComplete, files, index);
                            });
                            commandOption = "single-value";
                            break;
                        case "microsoft links":
                            common_1.showStatusMessage("Cleanup: Microsoft Links started.");
                            message = "Microsoft Links completed.";
                            statusMessage = "Cleanup: Microsoft Links completed.";
                            files.map((file, index) => {
                                promises = microsoftLinks_1.microsoftLinks(progress, promises, file, percentComplete, files, index);
                            });
                            commandOption = "links";
                            break;
                        case "capitalization of metadata values":
                            common_1.showStatusMessage("Cleanup: Capitalization of metadata values started.");
                            message = "Capitalization of metadata values completed.";
                            statusMessage = "Cleanup: Capitalization of metadata values completed.";
                            files.map((file, index) => {
                                promises = capitalizationOfMetadata_1.capitalizationOfMetadata(progress, promises, file, percentComplete, files, index);
                            });
                            commandOption = "capitalization";
                            break;
                        case "everything":
                            common_1.showStatusMessage("Cleanup: Everything started.");
                            message = "Everything completed.";
                            statusMessage = "Cleanup: Everything completed.";
                            files.map((file, index) => {
                                promises = runAll_1.runAll(progress, promises, file, percentComplete, files, index);
                            });
                            commandOption = "everything";
                            break;
                    }
                    Promise.all(promises).then(() => {
                        progress.report({ increment: 100, message });
                        common_1.showStatusMessage(statusMessage);
                        progress.report({ increment: 100, message: `100%` });
                        resolve();
                    }).catch((err) => {
                        common_1.postError(err);
                    });
                });
                commandOption = "single-value";
                common_1.sendTelemetryData(telemetryCommand, commandOption);
            });
        });
    });
}
exports.applyCleanupFolder = applyCleanupFolder;
function applyCleanup() {
    return __awaiter(this, void 0, void 0, function* () {
        const { items, opts } = getCleanUpQuickPick();
        items.push({
            description: "",
            label: "Master redirection file",
        });
        items.push({
            description: "",
            label: "Everything",
        });
        const selection = yield vscode_1.window.showQuickPick(items, opts);
        if (!selection) {
            return;
        }
        vscode_1.window.withProgress({
            location: vscode_1.ProgressLocation.Notification,
            title: "Cleanup",
            cancellable: true,
        }, (progress, token) => {
            token.onCancellationRequested(() => {
                common_1.postError("User canceled the long running operation");
            });
            progress.report({ increment: 0 });
            return new Promise((resolve, reject) => {
                const editor = vscode_1.window.activeTextEditor;
                if (editor) {
                    const resource = editor.document.uri;
                    const folder = vscode_1.workspace.getWorkspaceFolder(resource);
                    if (folder) {
                        const workspacePath = folder.uri.fsPath;
                        if (workspacePath == null) {
                            common_1.postError("No workspace is opened.");
                            reject();
                        }
                        // Check if the current workspace is the root folder of a repo by checking if the .git folder is present
                        const gitDir = path_1.join(workspacePath, ".git");
                        if (!graceful_fs_1.existsSync(gitDir)) {
                            common_1.postError("Current workspace is not root folder of a repo.");
                            reject();
                        }
                        let message = "";
                        let statusMessage = "";
                        let promises = [];
                        const percentComplete = 0;
                        switch (selection.label.toLowerCase()) {
                            case "single-valued metadata":
                                common_1.showStatusMessage("Cleanup: Single-Valued metadata started.");
                                message = "Single-Valued metadata completed.";
                                statusMessage = "Cleanup: Single-Valued metadata completed.";
                                recursive(workspacePath, [".git", ".github", ".vscode", ".vs", "node_module"], (err, files) => {
                                    if (err) {
                                        common_1.postError(err);
                                    }
                                    files.map((file, index) => {
                                        promises = handleSingleValuedMetadata_1.handleSingleValuedMetadata(progress, promises, file, percentComplete, files, index);
                                    });
                                });
                                commandOption = "single-value";
                                break;
                            case "microsoft links":
                                common_1.showStatusMessage("Cleanup: Microsoft Links started.");
                                message = "Microsoft Links completed.";
                                statusMessage = "Cleanup: Microsoft Links completed.";
                                recursive(workspacePath, [".git", ".github", ".vscode", ".vs", "node_module"], (err, files) => {
                                    if (err) {
                                        common_1.postError(err);
                                    }
                                    files.map((file, index) => {
                                        promises = microsoftLinks_1.microsoftLinks(progress, promises, file, percentComplete, files, index);
                                    });
                                });
                                commandOption = "links";
                                break;
                            case "capitalization of metadata values":
                                common_1.showStatusMessage("Cleanup: Capitalization of metadata values started.");
                                message = "Capitalization of metadata values completed.";
                                statusMessage = "Cleanup: Capitalization of metadata values completed.";
                                recursive(workspacePath, [".git", ".github", ".vscode", ".vs", "node_module"], (err, files) => {
                                    if (err) {
                                        common_1.postError(err);
                                    }
                                    files.map((file, index) => {
                                        promises = capitalizationOfMetadata_1.capitalizationOfMetadata(progress, promises, file, percentComplete, files, index);
                                    });
                                });
                                commandOption = "capitalization";
                                break;
                            case "master redirection file":
                                common_1.showStatusMessage("Cleanup: Master redirection started.");
                                message = "Master redirection complete.";
                                statusMessage = "Cleanup: Master redirection completed.";
                                master_redirect_controller_1.generateMasterRedirectionFile(workspacePath, resolve);
                                commandOption = "redirects";
                                break;
                            case "everything":
                                runAll_1.runAllWorkspace(workspacePath, progress, resolve);
                                commandOption = "everything";
                                break;
                        }
                        Promise.all(promises).then(() => {
                            progress.report({ increment: 100, message });
                            common_1.showStatusMessage(statusMessage);
                            progress.report({ increment: 100, message: `100%` });
                            resolve();
                        }).catch((err) => {
                            common_1.postError(err);
                        });
                        commandOption = "single-value";
                        common_1.sendTelemetryData(telemetryCommand, commandOption);
                    }
                }
            });
        });
    });
}
exports.applyCleanup = applyCleanup;
//# sourceMappingURL=cleanup-controller_BASE_13168.js.map