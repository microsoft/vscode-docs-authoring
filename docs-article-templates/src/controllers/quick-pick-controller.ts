"use strict";

import { readFileSync } from "fs";
import { files } from "node-dir";
import { basename, dirname, extname, join, parse } from "path";
import { Position, QuickPickItem, TextDocument, Uri, window, workspace } from "vscode";
import { generateTimestamp, sendTelemetryData, showStatusMessage } from "../helper/common";
import { cleanupDownloadFiles, templateDirectory } from "../helper/github";
import { showLearnFolderSelector } from "../helper/module-builder";
import { getUnitName } from "../helper/unit-builder";
import { alias, gitHubID, missingValue } from "../helper/user-settings";
import { addUnitToQuickPick, displayTemplateList, moduleQuickPick, newModuleMessage, newUnitMessage, templateNameMetadata } from "../strings";

const telemetryCommand: string = "templateSelected";
let commandOption: string;
export let moduleTitle;
// tslint:disable-next-line:no-var-requires
const fm = require("front-matter");
const markdownExtensionFilter = [".md"];

export function displayTemplates() {
    showStatusMessage(displayTemplateList);

    let templateName;
    let yamlContent;
    // tslint:disable-next-line:no-shadowed-variable
    files(templateDirectory, (err, files) => {
        if (err) {
            showStatusMessage(err);
            throw err;
        }

        // data structure used to store file name and path info for quick pick and template source.
        const quickPickMap = new Map();

        {
            files.filter((file: any) => markdownExtensionFilter.indexOf(extname(file.toLowerCase()))
                !== -1).forEach((file: any) => {
                    if (basename(file).toLowerCase() !== "readme.md") {
                        const filePath = join(dirname(file), basename(file));
                        const fileContent = readFileSync(filePath, "utf8");
                        const updatedContent = fileContent.replace("{@date}", "{date}");
                        try {
                            yamlContent = fm(updatedContent);
                        } catch (error) {
                            // suppress js-yaml error, does not impact
                            // https://github.com/mulesoft-labs/yaml-ast-parser/issues/9#issuecomment-402869930
                        }
                        templateName = yamlContent.attributes[templateNameMetadata];

                        if (templateName) {
                            quickPickMap.set(templateName, join(dirname(file), basename(file)));
                        }

                        if (!templateName) {
                            quickPickMap.set(basename(file), join(dirname(file), basename(file)));
                        }
                    }
                });
        }

        // push quickMap keys to QuickPickItems
        const templates: QuickPickItem[] = [];
        templates.push({ label: moduleQuickPick });
        const activeFilePath = window.activeTextEditor.document.fileName;
        const activeFile = parse(activeFilePath).base;
        if (activeFile === "index.yml") {
            templates.push({ label: addUnitToQuickPick });
        }
        for (const key of quickPickMap.keys()) {
            templates.push({ label: key });
        }

        // tslint:disable-next-line:only-arrow-functions
        templates.sort(function(a, b) {
            const firstLabel = a.label.toUpperCase();
            const secondLabel = b.label.toUpperCase();
            if (firstLabel < secondLabel) {
                return -1;
            }
            if (firstLabel > secondLabel) {
                return 1;
            }
            return 0;
        });

        window.showQuickPick(templates).then((qpSelection) => {
            if (!qpSelection) {
                return;
            }

            if (qpSelection.label === moduleQuickPick) {
                showLearnFolderSelector();
                commandOption = "new-module";
                showStatusMessage(newModuleMessage);
            }

            if (qpSelection.label === addUnitToQuickPick) {
                getUnitName(true, activeFilePath);
                commandOption = "additional-unit";
                showStatusMessage(newUnitMessage);
            }

            if (qpSelection.label && qpSelection.label !== moduleQuickPick && qpSelection.label !== addUnitToQuickPick) {
                const template = qpSelection.label;
                const templatePath = quickPickMap.get(template);
                applyDocsTemplate(templatePath);
                commandOption = template;
                showStatusMessage(`Applying ${template} template.`);
            }
            sendTelemetryData(telemetryCommand, commandOption);
        }, (error: any) => {
            showStatusMessage(error);
        });
    });
}

export function applyDocsTemplate(templatePath: string) {
    const newFile = Uri.parse("untitled:" + "New-Topic.md");
    workspace.openTextDocument(newFile).then((textDocument: TextDocument) => {
        window.showTextDocument(textDocument, 1, false).then((textEditor) => {
            const content = readFileSync(templatePath, "utf8");
            textEditor.edit((edit) => {
                try {
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
                } catch (error) {
                    showStatusMessage(error);
                }
            });
        }, (error: any) => {
            showStatusMessage(error);
        });
    });

    cleanupDownloadFiles();
}
