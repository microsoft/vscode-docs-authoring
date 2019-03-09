"use strict";

import * as vscode from "vscode";
import { reporter } from "../telemetry/telemetry";
import { window, workspace, ProgressLocation } from "vscode";
import { readFileSync, writeFileSync, readdir, stat } from "fs";
import { resolve } from "path";
import { output } from "../extension";
import { generateMasterRedirectionFile } from "./master-redirect-controller";
import { postError, showStatusMessage } from "../helper/common";
const jsyaml = require("js-yaml");
const telemetryCommand: string = "applyCleanup";

export function applyCleanupCommand() {
    const commands = [
        { command: applyCleanup.name, callback: applyCleanup },
    ];
    return commands;
}

export function applyCleanup() {
    reporter.sendTelemetryEvent("command", { command: telemetryCommand });
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
    items.push({
        description: "",
        label: "Master redirection file"
    })
    items.push({
        description: "",
        label: "Everything"
    })

    window.showQuickPick(items, opts).then((selection) => {
        if (!selection) {
            return;
        }
        window.withProgress({
            location: ProgressLocation.Notification,
            title: "Fixing Metadata",
            cancellable: true
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                postError("User canceled the long running operation")
            });
            switch (selection.label.toLowerCase()) {
                case "single-valued metadata":
                    await handleSingValuedMetadata();
                    break;
                case "microsoft links":
                    await microsoftLinks();
                    break;
                case "capitalization of metadata values":
                    await capitalizationOfMetadata();
                    break;
                case "master redirection file":
                    await generateMasterRedirectionFile();
                    break;
                case "everything":
                    runAll();
                    break;
            }
            progress.report({ increment: 0 });

            setTimeout(() => {
                progress.report({ increment: 20, message: "in progress." });
            }, 4000);

            setTimeout(() => {
                progress.report({ increment: 50, message: "cleaning up." });
            }, 80000);

            setTimeout(() => {
                progress.report({ increment: 70, message: "almost there..." });
            }, 13000);

            var p = new Promise(resolve => {
                setTimeout(() => {
                    resolve();
                }, 15000);
            });

            return p;
        });
    })
}

/**
 * Traverse directory and subdirectories.Performs callback method on each
 * file, else if the directory contains folders, it will traverse
 * those directories until it has performed callback on each file.
 * @param {string} dir - directory.
 * @param {void => (file: string)} callback - function callback that takes in file as arg.
 */
function traverseFiles(dir: any, callback: { (file: string): void }) {
    if (!dir.endsWith("node_modules")
        || !dir.endsWith(".github")
        || !dir.endsWith(".vs")
        || !dir.endsWith(".vscode")
        || !dir.endsWith(".git")) {
        readdir(dir, function (err, list) {
            if (err) {
                output.appendLine(`Error: ${err}`);
            }
            var pending = list.length;
            if (!pending) {
                showStatusMessage("Completed searching through directories for Metadata.");
                return;
            }
            list.map(function (file: string) {
                file = resolve(dir, file);
                stat(file, function (err, stat) {
                    if (stat && stat.isDirectory()) {
                        traverseFiles(file, callback);
                    } else {
                        callback(file);
                    }
                });
            });
        });
    }
};

/**
 * Run all Cleanup... scripts.
 * handleSingValuedMetadata() => cleans up Yaml Metadata values that have single array item;
 * microsoftLinks() => converts http:// to https:// for all microsoft links.
 * capitalizationOfMetadata() => lower cases all metadata found in .md files
 * generateMasterRedirectionFile() => creates master redirection file for root.
 */
function runAll() {
    traverseFiles(workspace.rootPath, (file: string) => {
        if (file.endsWith(".yml") || file.endsWith("docfx.json")) {
            try {
                let data = readFileSync(file, "utf8")
                data = handleYamlMetadata(data);
                writeFileSync(file, data);
                showStatusMessage("Fixing metadata.. Writing file.");
            } catch (error) {
                postError(error);
            }
        } else if (file.endsWith(".md")) {
            let data = readFileSync(file, "utf8")
            data = handleLinksWithRegex(data)
            if (data.startsWith("---\r\n")) {
                data = lowerCaseData(data, "ms.author")
                data = lowerCaseData(data, "author")
                data = lowerCaseData(data, "ms.prod")
                data = lowerCaseData(data, "ms.service")
                data = lowerCaseData(data, "ms.subservice")
                data = lowerCaseData(data, "ms.technology")
                data = lowerCaseData(data, "ms.topic")
            }
            writeFileSync(file, data);
            showStatusMessage("Fixing metadata...");
        }
    });
    generateMasterRedirectionFile();
}

/**
 * Searches through all directories from rootPath
 * and cleans up Yaml Metadata values that have single array items
 * then converts the array to single item.
 */
function handleSingValuedMetadata() {
    reporter.sendTelemetryEvent("command", { command: telemetryCommand });
    traverseFiles(workspace.rootPath, (file: string) => {
        if (file.endsWith(".yml") || file.endsWith("docfx.json")) {
            let data = readFileSync(file, "utf8")
            data = handleYamlMetadata(data);
            writeFileSync(file, data);
            showStatusMessage("Fixing metadata...");
        }
    })
}

/**
 * Takes in yaml data string and parses the file. 
 * Then perform operations to handle single item arrays
 * and convert them to single item values then return the data.
 * @param data data as yaml string from file
 */
function handleYamlMetadata(data: string) {
    try {
        let yamlContent = jsyaml.load(data);
        if (yamlContent.metadata) {
            let author = handleSingleItemArray(yamlContent.metadata["author"])
            if (author) {
                data = singleValueData(data, author, "author")
            }
            let msAuthor = handleSingleItemArray(yamlContent.metadata["ms.author"])
            if (msAuthor) {
                data = singleValueData(data, msAuthor, "ms.author")
            }
            let msComponent = handleSingleItemArray(yamlContent.metadata["ms.component"])
            if (msComponent) {
                data = singleValueData(data, msComponent, "ms.component")
            }
            let msDate = handleSingleItemArray(yamlContent.metadata["ms.date"])
            if (msDate) {
                data = singleValueData(data, msDate, "ms.date")
            }
            let msProd = handleSingleItemArray(yamlContent.metadata["ms.prod"])
            if (msProd) {
                data = singleValueData(data, msProd, "ms.prod")
            }
            let msService = handleSingleItemArray(yamlContent.metadata["ms.service"])
            if (msService) {
                data = singleValueData(data, msService, "ms.service")
            }
            let msSubservice = handleSingleItemArray(yamlContent.metadata["ms.subservice"])
            if (msSubservice) {
                data = singleValueData(data, msSubservice, "ms.subservice")
            }
            let msTechnology = handleSingleItemArray(yamlContent.metadata["ms.technology"])
            if (msTechnology) {
                data = singleValueData(data, msTechnology, "ms.technology")
            }
            let msTopic = handleSingleItemArray(yamlContent.metadata["ms.topic"])
            if (msTopic) {
                data = singleValueData(data, msTopic, "ms.topic")
            }
            let msTitle = handleSingleItemArray(yamlContent.metadata["ms.title"])
            if (msTitle) {
                data = singleValueData(data, msTitle, "ms.title")
            }
        }
    } catch (error) {
        postError(error);
    }
    return data;
}

/**
 * Checks if array has only one item. if so, then return that item.
 * @param content takes in string data as content and retuns
 * first item in array if the array only has one item in array.
 */
function handleSingleItemArray(content: string | undefined) {
    if (content && Array.isArray(content) && content.length == 1) {
        return content[0];
    }
}

/**
 * Takes in data, metadata key, and value to replace,
 * does a find and replace of the matching metadata tag
 * @param data string data from parsed file
 * @param value value to replace regex match of metadata
 * @param variable metadata key as variable
 */
function singleValueData(data: any, value: string, variable: string) {
    let dashMatch = new RegExp(`${variable}:\\s+-\\s[A-Za-z0-9\\-\\_]+`, 'gs');
    let bracketMatch = new RegExp(`${variable}:\\s+\\[.*\\]`, 'gs');
    if (dashMatch.exec(data)) {
        return data.replace(dashMatch, `${variable}: ${value}`)
    } else if (bracketMatch.exec(data)) {
        return data.replace(bracketMatch, `${variable}: ${value}`)
    } else {
        return data;
    }
}

/**
 * Converts http:// to https:// for all microsoft links.
 */
function microsoftLinks() {
    traverseFiles(workspace.rootPath, (file: string) => {
        if (file.endsWith(".md")) {
            try {
                let data = readFileSync(file, "utf8")
                data = handleLinksWithRegex(data)
                writeFileSync(file, data);
                showStatusMessage("Fixing metadata...");
            } catch (error) {
                postError(error);
            }
        }
    })
}

/**
 * replaces input data with regex values for microsoft links.
 * Looks for data that contains microsoft links for docs, azure, msdn, and technet.
 * Replace the http with https, and remove language specific url.
 * @param data takes data string as arg
 */
function handleLinksWithRegex(data: string) {
    let docsRegex = new RegExp(/http:\/\/docs.microsoft.com/g)
    data = data.replace(docsRegex, "https://docs.microsoft.com")
    let azureRegex = new RegExp(/https:\/\/azure.microsoft.com/g)
    data = data.replace(azureRegex, "https://azure.microsoft.com")
    let msdnRegex = new RegExp(/https:\/\/msdn.microsoft.com/g)
    data = data.replace(msdnRegex, "https://msdn.microsoft.com")
    let technetRegex = new RegExp(/https:\/\/technet.microsoft.com/g)
    data = data.replace(technetRegex, "https://technet.microsoft.com")
    let docsRegexLang = new RegExp(/https:\/\/docs.microsoft.com\/[A-Za-z]{2}-[A-Za-z]{2}\//g)
    data = data.replace(docsRegexLang, "https://docs.microsoft.com/")
    let azureRegexLang = new RegExp(/https:\/\/azure.microsoft.com\/[A-Za-z]{2}-[A-Za-z]{2}\//g)
    data = data.replace(azureRegexLang, "https://azure.microsoft.com/")
    let msdnRegexLang = new RegExp(/https:\/\/msdn.microsoft.com\/[A-Za-z]{2}-[A-Za-z]{2}\//g)
    data = data.replace(msdnRegexLang, "https://msdn.microsoft.com/")
    let technetRegexLang = new RegExp(/https:\/\/technet.microsoft.com\/[A-Za-z]{2}-[A-Za-z]{2}\//g)
    data = data.replace(technetRegexLang, "https://technet.microsoft.com/")
    return data;
}

/**
 * Lower cases all metadata found in .md files
 */
function capitalizationOfMetadata() {
    traverseFiles(workspace.rootPath, (file: string) => {
        if (file.endsWith(".md")) {
            try {
                let data = readFileSync(file, "utf8")
                if (data.startsWith("---\r\n")) {
                    data = lowerCaseData(data, "ms.author")
                    data = lowerCaseData(data, "author")
                    data = lowerCaseData(data, "ms.prod")
                    data = lowerCaseData(data, "ms.service")
                    data = lowerCaseData(data, "ms.subservice")
                    data = lowerCaseData(data, "ms.technology")
                    data = lowerCaseData(data, "ms.topic")
                    writeFileSync(file, data)
                }
            } catch (error) {
                postError(error);
            }
        }
    })
}

/**
 * takes data as input, and passes variable into regex
 * to be used to find metadata key and replace value with lowercase data.
 * @param data takes string data from file
 * @param variable metadata key to use in regex to replace
 */
function lowerCaseData(data: any, variable: string) {
    let regex = new RegExp(`^(${variable}:\\s?)(.*\\s)`, 'm');
    let metadata = data.match(regex)
    if (metadata) {
        let captureParts = regex.exec(data);
        let value = ''
        if (captureParts && captureParts.length > 2) {
            value = captureParts[2].toLowerCase();
            try {
                return data.replace(regex, `${variable}: ${value}`)
            }
            catch (error) {
                postError(`Error occurred: ${error}`);
            }
        }
    }

    return data;
}