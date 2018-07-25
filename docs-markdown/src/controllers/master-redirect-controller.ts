"use strict";

import * as fs from "fs";
import * as dir from "node-dir";
import * as path from "path";
import * as vscode from "vscode";
import YAML = require("yamljs");
import { masterRedirectOutput } from "../extension";
import * as common from "../helper/common";
import { generateTimestamp } from "../helper/common";
import * as yamlMetadata from "../helper/yaml-metadata";
import { reporter } from "../telemetry/telemetry";

const telemetryCommand: string = "masterRedirect";
import * as os from "os";

export function getMasterRedirectionCommand() {
    const command = [
        { command: generateMasterRedirectionFile.name, callback: generateMasterRedirectionFile },
    ];

    return command;
}

/* tslint:disable:max-classes-per-file variable-name*/

export class MasterRedirection {
    public redirections: RedirectionFile[];

    constructor(redirectionFiles: RedirectionFile[]) {
        this.redirections = redirectionFiles;
    }
}

export class RedirectionFile {
    public fileFullPath: string;
    public isAlreadyInMasterRedirectionFile: boolean = false;
    public resource: any;

    // Members mapping to JSON elements in master redirection file
    public source_path: string;
    public redirect_url: string;
    public redirect_document_id: boolean = false;

    constructor(filePath: string, redirectUrl: string) {
        this.fileFullPath = filePath;
        this.source_path = this.getRelativePathToRoot(filePath);
        this.redirect_url = redirectUrl;
    }

    public getRelativePathToRoot(filePath: any): string {
        const editor = vscode.window.activeTextEditor;
        let folder;
        if (editor) {
            const resource = editor.document.uri;
            folder = vscode.workspace.getWorkspaceFolder(resource);
        }
        if (folder) {
            return path.relative(folder.uri.fsPath, filePath).replace(/\\/g, "/");
        } else {
            throw new Error("Failed to resolve relative path to repo root folder for file " + filePath + ". Original error: " + Error.toString());
        }
    }
}

function showStatusMessage(message: string) {
    const { msTimeValue } = generateTimestamp();
    masterRedirectOutput.appendLine(`[${msTimeValue}] - ` + message);
    masterRedirectOutput.show();
}

function extension(element: any) {
    const extName = path.extname(element);
    return extName === ".md";
}

function generateMasterRedirectionFile() {
    reporter.sendTelemetryEvent("command", { command: telemetryCommand });
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const resource = editor.document.uri;
        const folder = vscode.workspace.getWorkspaceFolder(resource);

        if (folder) {
            const repoName = folder.name;
            const workspacePath = folder.uri.fsPath;

            if (workspacePath == null) {
                common.postError("No workspace is opened.");
                return;
            }

            // Check if the current workspace is the root folder of a repo by checking if the .git folder is present
            const gitDir = path.join(workspacePath, ".git");
            if (!fs.existsSync(gitDir)) {
                common.postError("Current workspace is not root folder of a repo.");
                return;
            }

            // Will likely remove the information message once feedback is received from PM team.
            common.postInformation("Generating Master Redirection file. Detailed information in output window (docs-markdown-master-redirect dropdown).");
            showStatusMessage("Generating Master Redirection file. Please wait ...");

            dir.files(workspacePath, (err: any, files: any) => {
                if (err) {
                    vscode.window.showErrorMessage(err);
                    return;
                }

                const redirectionFiles: RedirectionFile[] = [];
                const errorFiles: any[] = [];

                files.filter(extension).forEach((file: any) => {
                    showStatusMessage("Processing: " + file);
                    const content = fs.readFileSync(file, "utf8");
                    const mdContent = new yamlMetadata.MarkdownFileMetadataContent(content, file);

                    try {
                        const metadataContent = mdContent.getYamlMetadataContent();

                        if (metadataContent !== "") {
                            const yamlHeader = YAML.parse(metadataContent.toLowerCase());

                            if (yamlHeader != null && yamlHeader.redirect_url != null) {
                                redirectionFiles.push(new RedirectionFile(file, yamlHeader.redirect_url));
                                showStatusMessage("Added " + file + " to list.");
                            }
                        }
                    } catch (error) {
                        errorFiles.push({
                            errorMessage: error,
                            fileName: file,
                        });
                    }
                });

                try {
                    if (redirectionFiles.length > 0) {
                        let masterRedirection: MasterRedirection | null;
                        const masterRedirectionFilePath: string = path.join(workspacePath, ".openpublishing.redirection.json");

                        // If there is already a master redirection file, read its content to load into masterRedirection variable
                        if (fs.existsSync(masterRedirectionFilePath)) {
                            masterRedirection = JSON.parse(fs.readFileSync(masterRedirectionFilePath, "utf8"));
                        } else {
                            masterRedirection = null;
                            showStatusMessage("Created new redirection file.");
                        }

                        if (masterRedirection == null) {
                            // This means there is no existing master redirection file, we will create master redirection file and write all scanned result into it
                            masterRedirection = new MasterRedirection(redirectionFiles);
                        } else {
                            const existingSourcePath: string[] = [];

                            masterRedirection.redirections.forEach((item) => {
                                existingSourcePath.push(item.source_path.toLowerCase());
                            });

                            redirectionFiles.forEach((item) => {
                                if (existingSourcePath.indexOf(item.source_path.toLowerCase()) >= 0) {
                                    item.isAlreadyInMasterRedirectionFile = true;
                                } else {
                                    if (masterRedirection != null) {
                                        masterRedirection.redirections.push(item);
                                    } else {
                                        showStatusMessage("No redirection files found to add.");
                                    }
                                }
                            });
                        }

                        if (masterRedirection.redirections.length > 0) {
                            const date = new Date(Date.now());
                            fs.writeFileSync(masterRedirectionFilePath, JSON.stringify(masterRedirection, ["redirections", "source_path", "redirect_url", "redirect_document_id"], 4));
                            const currentYear = date.getFullYear();
                            const currentMonth = (date.getMonth() + 1);
                            const currentDay = date.getDate();
                            const currentHour = date.getHours();
                            const currentMinute = date.getMinutes();
                            const currentMilliSeconds = date.getMilliseconds();
                            const timeStamp = currentYear + `-` + currentMonth + `-` + currentDay + `_` + currentHour + `-` + currentMinute + `-` + currentMilliSeconds;
                            const deletedRedirectsFolderName = repoName + "_deleted_redirects_" + timeStamp;
                            const docsAuthoringHomeDirectory = path.join(os.homedir(), "Docs Authoring");
                            const docsRedirectDirectory = path.join(docsAuthoringHomeDirectory, "Redirects");
                            const deletedRedirectsPath = path.join(docsRedirectDirectory, deletedRedirectsFolderName);
                            if (fs.existsSync(docsRedirectDirectory)) {
                                fs.mkdirSync(deletedRedirectsPath);
                            } else {
                                fs.mkdirSync(docsAuthoringHomeDirectory);
                                fs.mkdirSync(docsRedirectDirectory);
                                fs.mkdirSync(deletedRedirectsPath);
                            }

                            redirectionFiles.forEach((item) => {
                                const source = fs.createReadStream(item.fileFullPath);
                                const dest = fs.createWriteStream(path.join(deletedRedirectsPath, path.basename(item.source_path)));

                                source.pipe(dest);
                                source.on("end", () => {
                                    fs.unlink(item.fileFullPath);
                                });
                            });

                            redirectionFiles.forEach((item) => {
                                if (item.isAlreadyInMasterRedirectionFile) {
                                    showStatusMessage("Already in master redirection file: " + item.fileFullPath);
                                } else {
                                    showStatusMessage("Added to master redirection file. " + item.fileFullPath);
                                }
                            });
                            showStatusMessage("Redirected files copied to " + deletedRedirectsPath);
                            showStatusMessage("Done");
                        }
                    }
                } catch (error) {
                    showStatusMessage(error);
                }
            });
        }
    }
}
