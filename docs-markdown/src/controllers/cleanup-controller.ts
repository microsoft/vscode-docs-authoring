"use strict";

import * as vscode from "vscode";
import { reporter } from "../telemetry/telemetry";
import { window, workspace, ProgressLocation } from "vscode";
import { writeFile, readFile } from "graceful-fs";
import { generateMasterRedirectionFile } from "./master-redirect-controller";
import { postError, showStatusMessage } from "../helper/common";
const recursive = require("recursive-readdir");
const jsyaml = require("js-yaml");
const jsdiff = require('diff');
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
            title: "Running Cleanup",
            cancellable: true
        }, (progress, token) => {
            token.onCancellationRequested(() => {
                postError("User canceled the long running operation")
            });
            progress.report({ increment: 0 });
            return new Promise(resolve => {
                switch (selection.label.toLowerCase()) {
                    case "single-valued metadata":
                        handleSingleValuedMetadata(progress, resolve);
                        break;
                    case "microsoft links":
                        microsoftLinks(progress, resolve);
                        break;
                    case "capitalization of metadata values":
                        capitalizationOfMetadata(progress, resolve);
                        break;
                    case "master redirection file":
                        generateMasterRedirectionFile(resolve);
                        break;
                    case "everything":
                        runAll(progress, resolve);
                        break;
                }
            })
        })
    })
}

/**
 * Run all Cleanup... scripts.
 * handleSingValuedMetadata() => cleans up Yaml Metadata values that have single array item;
 * microsoftLinks() => converts http:// to https:// for all microsoft links.
 * capitalizationOfMetadata() => lower cases all metadata found in .md files
 * generateMasterRedirectionFile() => creates master redirection file for root.
 */
function runAll(progress: any, resolve: any) {
    showStatusMessage("Running Cleanup: Everything");
    recursive(workspace.rootPath,
        [".git", ".github", ".vscode", ".vs", "node_module"],
        (err: any, files: string[]) => {
            if (err) {
                postError(err);
            }
            let percentComplete = 0;
            let promises: Promise<{} | void>[] = [];
            files.map((file, index) => {
                if (file.endsWith(".yml") || file.endsWith("docfx.json")) {
                    promises.push(new Promise((resolve, reject) => {
                        readFile(file, "utf8", (err, data) => {
                            if (err) {
                                postError(`Error: ${err}`)
                                reject();
                            }
                            let origin = data;
                            data = handleYamlMetadata(data);
                            let diff = jsdiff.diffChars(origin, data)
                                .some((part: { added: any; removed: any; }) => {
                                    return part.added || part.removed
                                })
                            if (diff) {
                                promises.push(new Promise((resolve, reject) => {
                                    writeFile(file, data, (err) => {
                                        if (err) {
                                            postError(`Error: ${err}`)
                                            reject();
                                        }
                                        percentComplete = showProgress(index, files, percentComplete)
                                        progress.report({ increment: percentComplete, message: `${percentComplete}%` })
                                        resolve();
                                    })
                                }).catch(error => {
                                    postError(error);
                                }))
                            }
                            resolve();
                        })
                    }).catch(error => {
                        postError(error);
                    }))
                } else if (file.endsWith(".md")) {
                    promises.push(new Promise((resolve, reject) => {
                        readFile(file, "utf8", (err, data) => {
                            if (err) {
                                postError(`Error: ${err}`)
                                reject()
                            }
                            let origin = data;
                            data = handleLinksWithRegex(data)
                            if (data.startsWith("---\r\n")) {
                                data = lowerCaseData(data, "ms.author")
                                data = lowerCaseData(data, "author")
                                data = lowerCaseData(data, "ms.prod")
                                data = lowerCaseData(data, "ms.service")
                                data = lowerCaseData(data, "ms.subservice")
                                data = lowerCaseData(data, "ms.technology")
                                data = lowerCaseData(data, "ms.topic")
                                let regex = new RegExp(`^(---)([^>]+?)(---)$`, 'm');
                                let metadataMatch = data.match(regex)
                                if (metadataMatch) {
                                    data = handleMarkdownMetadata(data, metadataMatch[2]);
                                }
                            }
                            let diff = jsdiff.diffChars(origin, data)
                                .some((part: { added: any; removed: any; }) => {
                                    return part.added || part.removed
                                })
                            if (diff) {
                                promises.push(new Promise((resolve, reject) => {
                                    writeFile(file, data, (err) => {
                                        if (err) {
                                            postError(`Error: ${err}`)
                                            reject()
                                        }
                                        percentComplete = showProgress(index, files, percentComplete)
                                        progress.report({ increment: percentComplete, message: `${percentComplete}%` })
                                        resolve();
                                    })
                                }).catch(error => {
                                    postError(error);
                                }))
                            }
                            resolve();
                        })
                    }).catch(error => {
                        postError(error);
                    }))
                }
            })
            Promise.all(promises).then(() => {
                generateMasterRedirectionFile(resolve);
                showStatusMessage(`Everything completed.`);
            }).catch(error => {
                postError(error);
            })
        }
    )
}

/**
 * check if the data origin is the same as updated data
 * Write file if change occured. Calculate the percent complete
 * If the percentage complete has changed, report the value
 * And output percentage complete to output console.
 * @param index index of current loop used to get completed percentage
 * @param files list of files
 * @param percentComplete percentage complete for program
 */
function showProgress(index: number, files: string[], percentComplete: number) {
    let currentCompletedPercent = Math.round(((index / files.length) * 100))
    if (percentComplete < currentCompletedPercent) {
        percentComplete = currentCompletedPercent
        showStatusMessage(`Running Cleanup... ${percentComplete}%`);
    }

    return percentComplete;
}

/**
 * Searches through all directories from rootPath
 * and cleans up Yaml Metadata values that have single array items
 * then converts the array to single item.
 */
function handleSingleValuedMetadata(progress: any, resolve: any) {
    reporter.sendTelemetryEvent("command", { command: telemetryCommand });
    showStatusMessage("Running Cleanup: Single Valued Metadata");
    recursive(workspace.rootPath,
        [".git", ".github", ".vscode", ".vs", "node_module"],
        (err: any, files: string[]) => {
            if (err) {
                postError(err);
            }
            let percentComplete = 0;
            let promises: Promise<{} | void>[] = []
            files.map((file, index) => {
                if (file.endsWith(".yml") || file.endsWith("docfx.json")) {
                    promises.push(new Promise((resolve, reject) => {
                        readFile(file, "utf8", (err, data) => {
                            if (err) {
                                postError(`Error: ${err}`)
                                reject()
                            }
                            let origin = data;
                            data = handleYamlMetadata(data);
                            let diff = jsdiff.diffChars(origin, data)
                                .some((part: { added: any; removed: any; }) => {
                                    return part.added || part.removed
                                })
                            if (diff) {
                                writeFile(file, data, (err) => {
                                    promises.push(new Promise((resolve, reject) => {
                                        if (err) {
                                            postError(`Error: ${err}`)
                                            reject();
                                        }
                                        progress.report({ increment: percentComplete, message: `${percentComplete}%` })
                                        percentComplete = showProgress(index, files, percentComplete)
                                        resolve();
                                    }).catch(error => {
                                        postError(error);
                                    }))
                                })
                            }
                            resolve();
                        })
                    }).catch(error => {
                        postError(error);
                    }))
                } else if (file.endsWith(".md")) {
                    promises.push(new Promise((resolve, reject) => {
                        readFile(file, "utf8", (err, data) => {
                            if (err) {
                                postError(`Error: ${err}`)
                            }
                            if (data.startsWith("---")) {
                                let regex = new RegExp(`^(---)([^>]+?)(---)$`, 'm');
                                let metadataMatch = data.match(regex)
                                if (metadataMatch) {
                                    let origin = data;
                                    data = handleMarkdownMetadata(data, metadataMatch[2]);
                                    let diff = jsdiff.diffChars(origin, data)
                                        .some((part: { added: any; removed: any; }) => {
                                            return part.added || part.removed
                                        })
                                    if (diff) {
                                        writeFile(file, data, err => {
                                            promises.push(new Promise((resolve, reject) => {

                                                if (err) {
                                                    postError(`Error: ${err}`)
                                                    reject();
                                                }
                                                progress.report({ increment: percentComplete, message: `${percentComplete}%` })
                                                percentComplete = showProgress(index, files, percentComplete)
                                            }).catch(error => {
                                                postError(error);
                                            }))
                                        })
                                    }
                                }
                            }
                            resolve();
                        })
                    }).catch(error => {
                        postError(error);
                    }))
                }
            })
            Promise.all(promises).then(() => {
                showStatusMessage(`Single Valued Metadata completed.`);
                progress.report({ increment: 100, message: `100%` })
                resolve();
            }).catch(err => {
                postError(err);
            })
        }
    )
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
        return data.replace(bracketRegex, `${variable}: ${bracketMatch[1]}`)
    } else {
        return data;
    }
}

/**
 * Converts http:// to https:// for all microsoft links.
 */
function microsoftLinks(progress: any, resolve: any) {
    showStatusMessage("Running Cleanup: Microsoft Links");
    recursive(workspace.rootPath,
        [".git", ".github", ".vscode", ".vs", "node_module"],
        (err: any, files: string[]) => {
            if (err) {
                postError(err);
            }
            let percentComplete = 0;
            let promises: Promise<{} | void>[] = [];
            files.map((file, index) => {
                if (file.endsWith(".md")) {
                    promises.push(new Promise((resolve, reject) => {
                        readFile(file, "utf8", (err, data) => {
                            let origin = data;
                            data = handleLinksWithRegex(data)
                            let diff = jsdiff.diffChars(origin, data)
                                .some((part: { added: any; removed: any; }) => {
                                    return part.added || part.removed
                                })
                            if (diff) {
                                promises.push(new Promise((resolve, reject) => {
                                    writeFile(file, data, err => {
                                        if (err) {
                                            postError(`Error: ${err}`)
                                        }
                                        percentComplete = showProgress(index, files, percentComplete)
                                        progress.report({ increment: percentComplete, message: `${percentComplete}%` })
                                        resolve();
                                    });
                                }).catch(error => {
                                    postError(error);
                                }))
                            }
                            resolve();
                        })
                    }).catch(error => {
                        postError(error);
                    }))
                }
            })

            Promise.all(promises).then(() => {
                showStatusMessage(`Microsoft Links completed.`);
                resolve();
            }).catch(error => {
                postError(error);
            })
        }
    )
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
    let azureRegex = new RegExp(/http:\/\/azure.microsoft.com/g)
    data = data.replace(azureRegex, "https://azure.microsoft.com")
    let msdnRegex = new RegExp(/http:\/\/msdn.microsoft.com/g)
    data = data.replace(msdnRegex, "https://msdn.microsoft.com")
    let technetRegex = new RegExp(/http:\/\/technet.microsoft.com/g)
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
function capitalizationOfMetadata(progress: any, resolve: any) {
    showStatusMessage("Running Cleanup: Capitalization of Metadata Values");
    recursive(workspace.rootPath,
        [".git", ".github", ".vscode", ".vs", "node_module"],
        (err: any, files: string[]) => {
            if (err) {
                postError(err);
            }
            let percentComplete = 0;
            let promises: Promise<{} | void>[] = [];
            files.map((file, index) => {
                if (file.endsWith(".md")) {
                    promises.push(new Promise((resolve) => {
                        readFile(file, "utf8", (err, data) => {
                            if (err) {
                                postError(`Error: ${err}`)
                            }
                            if (data.startsWith("---\r\n")) {
                                let origin = data;
                                data = lowerCaseData(data, "ms.author")
                                data = lowerCaseData(data, "author")
                                data = lowerCaseData(data, "ms.prod")
                                data = lowerCaseData(data, "ms.service")
                                data = lowerCaseData(data, "ms.subservice")
                                data = lowerCaseData(data, "ms.technology")
                                data = lowerCaseData(data, "ms.topic")
                                let diff = jsdiff.diffChars(origin, data)
                                    .some((part: { added: any; removed: any; }) => {
                                        return part.added || part.removed
                                    })
                                if (diff) {
                                    promises.push(new Promise((resolve) => {
                                        writeFile(file, data, (err) => {
                                            if (err) {
                                                postError(`Error: ${err}`)
                                            }
                                            percentComplete = showProgress(index, files, percentComplete)
                                            progress.report({ increment: percentComplete, message: `${percentComplete}%` })
                                            resolve();
                                        });
                                    }).catch(error => {
                                        postError(error);
                                    }))
                                }
                            }
                            resolve();
                        })
                    }).catch(error => {
                        postError(error);
                    }))
                }
            })
            Promise.all(promises).then(() => {
                showStatusMessage(`Capitalization of Metadata Values completed.`);
                resolve();
            }).catch(error => {
                postError(error);
            })
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

    return data;
}
