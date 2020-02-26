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
const vscode = require("vscode");
const vscode_1 = require("vscode");
const common_1 = require("../../helper/common");
const master_redirect_controller_1 = require("../master-redirect-controller");
const capitalizationOfMetadata_1 = require("./capitalizationOfMetadata");
const handleSingleValuedMetadata_1 = require("./handleSingleValuedMetadata");
const microsoftLinks_1 = require("./microsoftLinks");
const runAll_1 = require("./runAll");
const removeEmptyMetadata_1 = require("./removeEmptyMetadata");
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
    items.push({
        description: "",
        label: "Empty metadata",
    });
    return { items, opts };
}
function applyCleanupFile(uri) {
    return __awaiter(this, void 0, void 0, function* () {
        const { items, opts } = getCleanUpQuickPick();
        const file = uri.fsPath;
        items.push({
            description: "",
            label: "Everything",
        });
        const selection = yield vscode_1.window.showQuickPick(items, opts);
        if (!selection) {
            return;
        }
        // check for dirty file
        vscode_1.workspace.openTextDocument(vscode.Uri.parse(uri.path)).then(doc => {
            if (doc.isDirty) {
                common_1.showWarningMessage(`Selected file ${file} is not saved and cannot be modified. Save file then run the command again.`);
                common_1.showStatusMessage(`Selected file ${file} is not saved and cannot be modified. Save file then run the command again.`);
            }
        });
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
                    case "empty metadata":
                        const opts = { placeHolder: "Cleanup..." };
                        const items = [];
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
                        common_1.showStatusMessage("Cleanup: Metadata attribute cleanup started.");
                        message = "Empty metadata attribute cleanup completed.";
                        statusMessage = "Cleanup: Metadata attribute cleanup completed.";
                        vscode_1.window.showQuickPick(items, opts).then((selection) => {
                            if (!selection) {
                                return;
                            }
                            switch (selection.label.toLowerCase()) {
                                case "remove metadata attributes with empty values":
                                    promises = removeEmptyMetadata_1.removeEmptyMetadata(progress, promises, file, percentComplete, null, null, "empty");
                                    commandOption = "remove-empty";
                                    break;
                                case `remove metadata attributes with "na" or "n/a"`:
                                    promises = removeEmptyMetadata_1.removeEmptyMetadata(progress, promises, file, percentComplete, null, null, "na");
                                    commandOption = "remove-na";
                                    break;
                                case "remove commented out metadata attributes":
                                    promises = removeEmptyMetadata_1.removeEmptyMetadata(progress, promises, file, percentComplete, null, null, "commented");
                                    commandOption = "remove-commented";
                                    break;
                                case "remove all":
                                    promises = removeEmptyMetadata_1.removeEmptyMetadata(progress, promises, file, percentComplete, null, null, "all");
                                    commandOption = "remove-all-empty";
                                    break;
                            }
                        });
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
function applyCleanupFolder(uri) {
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
                recursive(uri.fsPath, [".git", ".github", ".vscode", ".vs", "node_module"], (err, files) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        common_1.postError(err);
                    }
                    // check for dirty files
                    files.map((file, index) => {
                        let fileName = path_1.basename(file);
                        let modifiedUri = path_1.join(uri.path, fileName).replace(/\\/g, "/");
                        if (path_1.extname(modifiedUri) == '.md') {
                            vscode_1.workspace.openTextDocument(vscode.Uri.parse(modifiedUri)).then(doc => {
                                if (doc.isDirty) {
                                    common_1.showWarningMessage(`Selected file ${file} is not saved and cannot be modified. Save file then run the command again.`);
                                    common_1.showStatusMessage(`Selected file ${file} is not saved and cannot be modified. Save file then run the command again.`);
                                }
                            });
                        }
                    });
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
                        case "empty metadata":
                            const opts = { placeHolder: "Cleanup..." };
                            const items = [];
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
                            common_1.showStatusMessage("Cleanup: Metadata attribute cleanup started.");
                            const selection = yield vscode_1.window.showQuickPick(items, opts);
                            if (!selection) {
                                return;
                            }
                            vscode_1.window.withProgress({
                                location: vscode_1.ProgressLocation.Notification,
                                title: "Cleanup: Empty metadata attributes.",
                                cancellable: true,
                            }, (progress, token) => {
                                token.onCancellationRequested(() => {
                                    common_1.postError("User canceled the long running operation");
                                });
                                return new Promise((resolve, reject) => {
                                    message = "Empty metadata attribute cleanup completed.";
                                    statusMessage = "Cleanup: Metadata attribute cleanup completed.";
                                    let promises = [];
                                    switch (selection.label.toLowerCase()) {
                                        case "remove metadata attributes with empty values":
                                            files.map((file, index) => {
                                                promises = removeEmptyMetadata_1.removeEmptyMetadata(progress, promises, file, percentComplete, files, index, "empty");
                                            });
                                            commandOption = "remove-empty";
                                            break;
                                        case `remove metadata attributes with "na" or "n/a"`:
                                            files.map((file, index) => {
                                                promises = removeEmptyMetadata_1.removeEmptyMetadata(progress, promises, file, percentComplete, files, index, "na");
                                            });
                                            commandOption = "remove-na";
                                            break;
                                        case "remove commented out metadata attributes":
                                            files.map((file, index) => {
                                                promises = removeEmptyMetadata_1.removeEmptyMetadata(progress, promises, file, percentComplete, files, index, "commented");
                                            });
                                            commandOption = "remove-commented";
                                            break;
                                        case "remove all":
                                            files.map((file, index) => {
                                                promises = removeEmptyMetadata_1.removeEmptyMetadata(progress, promises, file, percentComplete, files, index, "all");
                                            });
                                            commandOption = "remove-all-empty";
                                            break;
                                    }
                                    Promise.all(promises).then(() => {
                                        progress.report({ increment: 100, message });
                                        progress.report({ increment: 100, message: `100%` });
                                        resolve();
                                    }).catch((err) => {
                                        common_1.postError(err);
                                    });
                                });
                            });
                    }
                    Promise.all(promises).then(() => {
                        progress.report({ increment: 100, message });
                        common_1.showStatusMessage(statusMessage);
                        progress.report({ increment: 100, message: `100%` });
                        resolve();
                    }).catch((err) => {
                        common_1.postError(err);
                    });
                }));
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
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
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
                            case "empty metadata":
                                const opts = { placeHolder: "Cleanup..." };
                                const items = [];
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
                                common_1.showStatusMessage("Cleanup: Metadata attribute cleanup started.");
                                const selection = yield vscode_1.window.showQuickPick(items, opts);
                                if (!selection) {
                                    return;
                                }
                                vscode_1.window.withProgress({
                                    location: vscode_1.ProgressLocation.Notification,
                                    title: "Cleanup: Empty metadata attributes.",
                                    cancellable: true,
                                }, (progress, token) => {
                                    token.onCancellationRequested(() => {
                                        common_1.postError("User canceled the long running operation");
                                    });
                                    return new Promise((resolve, reject) => {
                                        message = "Empty metadata attribute cleanup completed.";
                                        statusMessage = "Cleanup: Metadata attribute cleanup completed.";
                                        let promises = [];
                                        recursive(workspacePath, [".git", ".github", ".vscode", ".vs", "node_module"], (err, files) => {
                                            if (err) {
                                                common_1.postError(err);
                                            }
                                            switch (selection.label.toLowerCase()) {
                                                case "remove metadata attributes with empty values":
                                                    files.map((file, index) => {
                                                        promises = removeEmptyMetadata_1.removeEmptyMetadata(progress, promises, file, percentComplete, files, index, "empty");
                                                    });
                                                    commandOption = "remove-empty";
                                                    break;
                                                case `remove metadata attributes with "na" or "n/a"`:
                                                    files.map((file, index) => {
                                                        promises = removeEmptyMetadata_1.removeEmptyMetadata(progress, promises, file, percentComplete, files, index, "na");
                                                    });
                                                    commandOption = "remove-na";
                                                    break;
                                                case "remove commented out metadata attributes":
                                                    files.map((file, index) => {
                                                        promises = removeEmptyMetadata_1.removeEmptyMetadata(progress, promises, file, percentComplete, files, index, "commented");
                                                    });
                                                    commandOption = "remove-commented";
                                                    break;
                                                case "remove all":
                                                    files.map((file, index) => {
                                                        promises = removeEmptyMetadata_1.removeEmptyMetadata(progress, promises, file, percentComplete, files, index, "all");
                                                    });
                                                    commandOption = "remove-all";
                                                    break;
                                            }
                                            Promise.all(promises).then(() => {
                                                progress.report({ increment: 100, message });
                                                progress.report({ increment: 100, message: `100%` });
                                                resolve();
                                            }).catch((err) => {
                                                common_1.postError(err);
                                            });
                                        });
                                    });
                                });
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
            }));
        });
    });
}
exports.applyCleanup = applyCleanup;
//# sourceMappingURL=cleanup-controller_REMOTE_13168.js.map