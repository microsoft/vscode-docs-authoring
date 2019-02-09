"use strict";

import { readFileSync } from "fs";
import { files } from "node-dir";
import * as path from "path";
import { Position, QuickPickItem, TextDocument, Uri, window, workspace } from "vscode";
import { output } from "../extension";
import { generateTimestamp } from "../helper/common";
import { cleanupDownloadFiles, templateDirectory } from "../helper/github";
import { formatModuleName } from "../helper/module-builder";
import { alias, gitHubID, missingValue } from "../helper/user-metadata";

const markdownExtensionFilter = [".md"];

export function showTemplates() {
    // create a new markdown file.
    const newFile = Uri.parse("untitled:" + "New-Topic.md");
    // parse the repo directory for markdown files, sort them and push them to the quick pick menu.
    workspace.openTextDocument(newFile).then((textDocument: TextDocument) => {
        window.showTextDocument(textDocument, 1, false).then((textEditor) => {
            files(templateDirectory, (err, files) => {
                if (err) {
                    output.appendLine(err);
                    throw err;
                }
                const items: QuickPickItem[] = [];
                const learnModule: string = "Learn Module";
                items.push({ label: learnModule });
                files.sort();
                {
                    files.filter((file: any) => markdownExtensionFilter.indexOf(path.extname(file.toLowerCase()))
                        !== -1).forEach((file: any) => {
                            if (path.basename(file).toLowerCase() !== "readme.md") {
                                items.push({ label: path.basename(file) });
                            }
                        });
                }
                window.showQuickPick(items).then((qpSelection) => {
                    if (!qpSelection) {
                        return;
                    }

                    if (qpSelection.label === learnModule) {
                        const getModuleName = window.showInputBox({
                            prompt: "Enter module name.",
                        });
                        getModuleName.then((moduleName) => {
                            if (!moduleName) {
                                return;
                            }
                            formatModuleName(moduleName)
                        });
                    }

                    if (qpSelection.label && qpSelection.label !== learnModule) {
                        const qpFullPath = path.join(qpSelection.description, qpSelection.label);
                        const content = readFileSync(qpFullPath, "utf8");
                        textEditor.edit((edit) => {
                            let updatedContent;
                            const { msDateValue } = generateTimestamp();
                            // replace metadata placeholder values with user settings and dynamic values then write template content to new file.
                            if (!gitHubID && !alias) {
                                updatedContent = content.replace("{@date}", msDateValue).replace("{github-id}", missingValue).replace("{ms-alias}", missingValue);
                                edit.insert(new Position(0, 0), updatedContent);
                            } else if (!gitHubID) {
                                updatedContent = content.replace("{@date}", msDateValue).replace("{github-id}", missingValue).replace("{ms-alias}", alias);
                                edit.insert(new Position(0, 0), updatedContent);
                            } else if (!alias) {
                                updatedContent = content.replace("{@date}", msDateValue).replace("{github-id}", gitHubID).replace("{ms-alias}", missingValue);
                                edit.insert(new Position(0, 0), updatedContent);
                            } else {
                                updatedContent = content.replace("{@date}", msDateValue).replace("{github-id}", gitHubID).replace("{ms-alias}", alias);
                                edit.insert(new Position(0, 0), updatedContent);
                            }
                        });
                    }
                }, (error: any) => {
                    window.showWarningMessage(error);
                    output.appendLine(error);
                });
            });
        });
    });
    cleanupDownloadFiles();
}
