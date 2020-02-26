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
const fs = require("fs");
const dir = require("node-dir");
const os_1 = require("os");
const path_1 = require("path");
const vscode_1 = require("vscode");
const YAML = require("yamljs");
const extension_1 = require("../extension");
const common_1 = require("../helper/common");
const yamlMetadata = require("../helper/yaml-metadata");
const telemetryCommand = "masterRedirect";
const redirectFileName = ".openpublishing.redirection.json";
function getMasterRedirectionCommand() {
    return [
        { command: generateMasterRedirectionFile.name, callback: generateMasterRedirectionFile },
        { command: sortMasterRedirectionFile.name, callback: sortMasterRedirectionFile },
    ];
}
exports.getMasterRedirectionCommand = getMasterRedirectionCommand;
/* tslint:disable:max-classes-per-file variable-name*/
class MasterRedirection {
    constructor(redirectionFiles) {
        this.redirections = redirectionFiles;
    }
}
exports.MasterRedirection = MasterRedirection;
class RedirectionFile {
    constructor(filePath, redirectUrl, redirectDocumentId, folder) {
        this.isAlreadyInMasterRedirectionFile = false;
        this.redirect_document_id = false;
        this.fileFullPath = filePath;
        this.source_path = this.getRelativePathToRoot(filePath, folder);
        this.redirect_url = redirectUrl;
        this.redirect_document_id = redirectDocumentId;
    }
    getRelativePathToRoot(filePath, folder) {
        if (folder) {
            return path_1.relative(folder.uri.fsPath, filePath).replace(/\\/g, "/");
        }
        else {
            throw new Error("Failed to resolve relative path to repo root folder for file " + filePath + ". Original error: " + Error.toString());
        }
    }
}
exports.RedirectionFile = RedirectionFile;
function showStatusMessage(message) {
    const { msTimeValue } = common_1.generateTimestamp();
    extension_1.output.appendLine(`[${msTimeValue}] - ` + message);
    extension_1.output.show();
}
function sortMasterRedirectionFile() {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            common_1.postWarning("Editor not active. Abandoning command.");
            return;
        }
        const folder = vscode_1.workspace.getWorkspaceFolder(editor.document.uri);
        if (folder) {
            const file = common_1.tryFindFile(folder.uri.fsPath, redirectFileName);
            if (!!file && fs.existsSync(file)) {
                const jsonBuffer = fs.readFileSync(file);
                const redirects = JSON.parse(jsonBuffer.toString());
                if (redirects && redirects.redirections && redirects.redirections.length) {
                    redirects.redirections.sort((a, b) => {
                        return common_1.naturalLanguageCompare(a.source_path, b.source_path);
                    });
                    fs.writeFileSync(file, JSON.stringify(redirects, ["redirections", "source_path", "redirect_url", "redirect_document_id"], 4));
                }
            }
        }
    });
}
exports.sortMasterRedirectionFile = sortMasterRedirectionFile;
function generateMasterRedirectionFile(rootPath, resolve) {
    const editor = vscode_1.window.activeTextEditor;
    let workspacePath;
    if (editor) {
        common_1.sendTelemetryData(telemetryCommand, "");
        const resource = editor.document.uri;
        let folder = vscode_1.workspace.getWorkspaceFolder(resource);
        if (!folder && rootPath) {
            folder = vscode_1.workspace.getWorkspaceFolder(vscode_1.Uri.file(rootPath));
        }
        if (folder) {
            const repoName = folder.name.toLowerCase();
            workspacePath = folder.uri.fsPath;
            const date = new Date(Date.now());
            if (workspacePath == null) {
                common_1.postError("No workspace is opened.");
                return;
            }
            // Check if the current workspace is the root folder of a repo by checking if the .git folder is present
            const gitDir = path_1.join(workspacePath, ".git");
            if (!fs.existsSync(gitDir)) {
                common_1.postError("Current workspace is not root folder of a repo.");
                return;
            }
            dir.files(workspacePath, (err, files) => {
                if (err) {
                    vscode_1.window.showErrorMessage(err);
                    return;
                }
                const redirectionFiles = [];
                const errorFiles = [];
                showStatusMessage("Generating Master Redirection file.");
                files.filter((file) => path_1.extname(file.toLowerCase()) === ".md").forEach((file) => {
                    const content = fs.readFileSync(file, "utf8");
                    const mdContent = new yamlMetadata.MarkdownFileMetadataContent(content, file);
                    try {
                        const metadataContent = mdContent.getYamlMetadataContent();
                        if (metadataContent !== "") {
                            const yamlHeader = YAML.parse(metadataContent.toLowerCase());
                            if (yamlHeader != null && yamlHeader.redirect_url != null) {
                                if (yamlHeader.redirect_document_id !== true) {
                                    yamlHeader.redirect_document_id = false;
                                }
                                redirectionFiles.push(new RedirectionFile(file, yamlHeader.redirect_url, yamlHeader.redirect_document_id, folder));
                            }
                        }
                    }
                    catch (error) {
                        errorFiles.push({
                            errorMessage: error,
                            fileName: file,
                        });
                    }
                });
                if (redirectionFiles.length === 0) {
                    showStatusMessage("No redirection files found.");
                    if (resolve) {
                        resolve();
                    }
                }
                if (redirectionFiles.length > 0) {
                    let masterRedirection;
                    const masterRedirectionFilePath = path_1.join(workspacePath, redirectFileName);
                    // If there is already a master redirection file, read its content to load into masterRedirection variable
                    if (fs.existsSync(masterRedirectionFilePath)) {
                        // test for valid json
                        try {
                            masterRedirection = JSON.parse(fs.readFileSync(masterRedirectionFilePath, "utf8"));
                        }
                        catch (error) {
                            showStatusMessage("Invalid JSON: " + error);
                            return;
                        }
                    }
                    else {
                        masterRedirection = null;
                        showStatusMessage("Created new redirection file.");
                    }
                    if (masterRedirection == null) {
                        // This means there is no existing master redirection file, we will create master redirection file and write all scanned result into it
                        masterRedirection = new MasterRedirection(redirectionFiles);
                    }
                    else {
                        const existingSourcePath = [];
                        masterRedirection.redirections.forEach((item) => {
                            if (!item.source_path) {
                                showStatusMessage("An array is missing the source_path value. Please check .openpublishing.redirection.json.");
                                return;
                            }
                            existingSourcePath.push(item.source_path.toLowerCase());
                        });
                        redirectionFiles.forEach((item) => {
                            if (existingSourcePath.indexOf(item.source_path.toLowerCase()) >= 0) {
                                item.isAlreadyInMasterRedirectionFile = true;
                            }
                            else {
                                if (masterRedirection != null) {
                                    masterRedirection.redirections.push(item);
                                }
                                else {
                                    showStatusMessage("No redirection files found to add.");
                                    if (resolve) {
                                        resolve();
                                    }
                                }
                            }
                        });
                    }
                    if (masterRedirection.redirections.length > 0) {
                        masterRedirection.redirections.sort((a, b) => {
                            return common_1.naturalLanguageCompare(a.source_path, b.source_path);
                        });
                        fs.writeFileSync(masterRedirectionFilePath, JSON.stringify(masterRedirection, ["redirections", "source_path", "redirect_url", "redirect_document_id"], 4));
                        const currentYear = date.getFullYear();
                        const currentMonth = (date.getMonth() + 1);
                        const currentDay = date.getDate();
                        const currentHour = date.getHours();
                        const currentMinute = date.getMinutes();
                        const currentMilliSeconds = date.getMilliseconds();
                        const timeStamp = currentYear + `-` + currentMonth + `-` + currentDay + `_` + currentHour + `-` + currentMinute + `-` + currentMilliSeconds;
                        const deletedRedirectsFolderName = repoName + "_deleted_redirects_" + timeStamp;
                        const docsAuthoringHomeDirectory = path_1.join(os_1.homedir(), "Docs Authoring");
                        const docsRedirectDirectory = path_1.join(docsAuthoringHomeDirectory, "redirects");
                        const deletedRedirectsPath = path_1.join(docsRedirectDirectory, deletedRedirectsFolderName);
                        if (fs.existsSync(docsRedirectDirectory)) {
                            fs.mkdirSync(deletedRedirectsPath);
                        }
                        else {
                            if (!fs.existsSync(docsAuthoringHomeDirectory)) {
                                fs.mkdirSync(docsAuthoringHomeDirectory);
                            }
                            if (!fs.existsSync(docsRedirectDirectory)) {
                                fs.mkdirSync(docsRedirectDirectory);
                            }
                            if (!fs.existsSync(deletedRedirectsPath)) {
                                fs.mkdirSync(deletedRedirectsPath);
                            }
                        }
                        redirectionFiles.forEach((item) => {
                            const source = fs.createReadStream(item.fileFullPath);
                            const dest = fs.createWriteStream(path_1.join(deletedRedirectsPath, path_1.basename(item.source_path)));
                            source.pipe(dest);
                            source.on("close", () => {
                                fs.unlink(item.fileFullPath, (err) => {
                                    if (err) {
                                        common_1.postError(`Error: ${err}`);
                                    }
                                });
                            });
                        });
                        redirectionFiles.forEach((item) => {
                            if (item.isAlreadyInMasterRedirectionFile) {
                                showStatusMessage("Already in master redirection file: " + item.fileFullPath);
                            }
                            else {
                                showStatusMessage("Added to master redirection file. " + item.fileFullPath);
                            }
                        });
                        showStatusMessage("Redirected files copied to " + deletedRedirectsPath);
                        showStatusMessage("Done");
                        if (resolve) {
                            resolve();
                        }
                    }
                }
            });
        }
    }
}
exports.generateMasterRedirectionFile = generateMasterRedirectionFile;
//# sourceMappingURL=master-redirect-controller.js.map