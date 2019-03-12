"use strict";

import * as vscode from "vscode";
import { reporter } from "../telemetry/telemetry";
import { window, workspace, ProgressLocation } from "vscode";
import { readFileSync, writeFileSync, readdir, stat } from "fs";
import { resolve } from "path";
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
                postError(`Error: ${err}`);
            }
            var pending = list.length;
            if (!pending) {
                return;
            }
            list.map(function (file: string) {
                file = resolve(dir, file);
                stat(file, function (err, stat) {
                    if (err) {
                        postError(`Error: ${err}`);
                    }
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
        try {
            if (file.endsWith(".yml") || file.endsWith("docfx.json")) {
                let data = readFileSync(file, "utf8")
                data = handleYamlMetadata(data);
                writeFileSync(file, data);
                showStatusMessage("Searching metadata...");
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
                    let regex = new RegExp(`^^(---)([^>]+?)(---)$`, 'm');
                    let metadataMatch = data.match(regex)
                    if (metadataMatch) {
                        data = handleMarkdownMetadata(data, metadataMatch[2]);
                    }
                }
                writeFileSync(file, data);
                showStatusMessage("Searching metadata...");
            }
        } catch (error) {
            postError(error);
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
            showStatusMessage("Searching metadata...");
        } else if (file.endsWith(".md")) {
            let data = readFileSync(file, "utf8")
            if (data.startsWith("---")) {
                let regex = new RegExp(`^^(---)([^>]+?)(---)$`, 'm');
                let metadataMatch = data.match(regex)
                if (metadataMatch) {
                    data = handleMarkdownMetadata(data, metadataMatch[2]);
                    writeFileSync(file, data);
                    showStatusMessage("Searching metadata...");
                }
            }
        }
    })
}

/**
 * Takes in markdown data string and parses the file. 
 * Then perform operations to handle single item arrays
 * and convert them to single item values then return the data.
 * @param data data as yaml string from file
 */
function handleMarkdownMetadata(data: string, metadata: string) {
    try {
        let yamlContent = jsyaml.load(metadata);
        if (yamlContent) {
            if (handleSingleItemArray(yamlContent["author"])) {
                data = singleValueMetadata(data, "author")
            }
            if (handleSingleItemArray(yamlContent["ms.author"])) {
                data = singleValueMetadata(data, "ms.author")
            }
            if (handleSingleItemArray(yamlContent["ms.component"])) {
                data = singleValueMetadata(data, "ms.component")
            }
            if (handleSingleItemArray(yamlContent["ms.date"])) {
                data = singleValueMetadata(data, "ms.date")
            }
            if (handleSingleItemArray(yamlContent["ms.prod"])) {
                data = singleValueMetadata(data, "ms.prod")
            }
            if (handleSingleItemArray(yamlContent["ms.service"])) {
                data = singleValueMetadata(data, "ms.service")
            }
            if (handleSingleItemArray(yamlContent["ms.subservice"])) {
                data = singleValueMetadata(data, "ms.subservice")
            }
            if (handleSingleItemArray(yamlContent["ms.technology"])) {
                data = singleValueMetadata(data, "ms.technology")
            }
            if (handleSingleItemArray(yamlContent["ms.topic"])) {
                data = singleValueMetadata(data, "ms.topic")
            }
            if (handleSingleItemArray(yamlContent["ms.title"])) {
                data = singleValueMetadata(data, "ms.title")
            }
        }
    } catch (error) {
        postError(error);
    }
    return data;
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
            if (handleSingleItemArray(yamlContent.metadata["author"])) {
                data = singleValueMetadata(data, "author")
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.author"])) {
                data = singleValueMetadata(data, "ms.author")
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.component"])) {
                data = singleValueMetadata(data, "ms.component")
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.date"])) {
                data = singleValueMetadata(data, "ms.date")
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.prod"])) {
                data = singleValueMetadata(data, "ms.prod")
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.service"])) {
                data = singleValueMetadata(data, "ms.service")
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.subservice"])) {
                data = singleValueMetadata(data, "ms.subservice")
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.technology"])) {
                data = singleValueMetadata(data, "ms.technology")
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.topic"])) {
                data = singleValueMetadata(data, "ms.topic")
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.title"])) {
                data = singleValueMetadata(data, "ms.title")
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
function singleValueMetadata(data: any, variable: string) {
    let dashRegex = new RegExp(`${variable}:\\s+-\\s(["'\\sA-Za-z0-9\\-\\_]+)$`, 'm');
    let bracketRegex = new RegExp(`${variable}:\\s+\\[(["'\\sA-Za-z0-9\\-\\_]+)\\]$`, 'm');
    let dashMatches = dashRegex.exec(data)
    let bracketMatch = bracketRegex.exec(data)
    if (dashMatches) {
        return data.replace(dashRegex, `${variable}: ${dashMatches[1]}`)
    } else if (bracketMatch) {
        return data.replace(bracketMatch, `${variable}: ${bracketMatch[1]}`)
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
                showStatusMessage("Searching metadata...");
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
                    showStatusMessage("Searching metadata...");
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