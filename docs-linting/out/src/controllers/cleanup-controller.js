"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graceful_fs_1 = require("graceful-fs");
const path_1 = require("path");
const vscode_1 = require("vscode");
const common_1 = require("../helper/common");
const telemetry_1 = require("../helper/telemetry");
const master_redirect_controller_1 = require("./master-redirect-controller");
// tslint:disable no-var-requires
const recursive = require("recursive-readdir");
const jsyaml = require("js-yaml");
const jsdiff = require("diff");
const telemetryCommand = "applyCleanup";
let commandOption;
function applyCleanupCommand() {
    const commands = [
        { command: applyCleanup.name, callback: applyCleanup },
    ];
    return commands;
}
exports.applyCleanupCommand = applyCleanupCommand;
function applyCleanup() {
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
        label: "Master redirection file",
    });
    items.push({
        description: "",
        label: "Everything",
    });
    vscode_1.window.showQuickPick(items, opts).then((selection) => {
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
                        switch (selection.label.toLowerCase()) {
                            case "single-valued metadata":
                                handleSingleValuedMetadata(workspacePath, progress, resolve);
                                commandOption = "single-value";
                                break;
                            case "microsoft links":
                                microsoftLinks(workspacePath, progress, resolve);
                                commandOption = "links";
                                break;
                            case "capitalization of metadata values":
                                capitalizationOfMetadata(workspacePath, progress, resolve);
                                commandOption = "capitalization";
                                break;
                            case "master redirection file":
                                master_redirect_controller_1.generateMasterRedirectionFile(workspacePath, resolve);
                                commandOption = "redirects";
                                break;
                            case "everything":
                                runAll(workspacePath, progress, resolve);
                                commandOption = "everything";
                                break;
                        }
                        common_1.sendTelemetryData(telemetryCommand, commandOption);
                    }
                }
            });
        });
    });
}
exports.applyCleanup = applyCleanup;
/**
 * Run all Cleanup... scripts.
 * handleSingValuedMetadata() => cleans up Yaml Metadata values that have single array item;
 * microsoftLinks() => converts http:// to https:// for all microsoft links.
 * capitalizationOfMetadata() => lower cases all metadata found in .md files
 * generateMasterRedirectionFile() => creates master redirection file for root.
 */
function runAll(workspacePath, progress, resolve) {
    common_1.showStatusMessage("Cleanup: Everything started.");
    const message = "Everything";
    progress.report({ increment: 0, message });
    recursive(workspacePath, [".git", ".github", ".vscode", ".vs", "node_module"], (err, files) => {
        if (err) {
            common_1.postError(err);
        }
        let percentComplete = 0;
        const promises = [];
        files.map((file, index) => {
            if (file.endsWith(".yml") || file.endsWith("docfx.json")) {
                promises.push(new Promise((resolve, reject) => {
                    graceful_fs_1.readFile(file, "utf8", (err, data) => {
                        if (err) {
                            common_1.postError(`Error: ${err}`);
                            reject();
                        }
                        const origin = data;
                        data = handleYamlMetadata(data);
                        const diff = jsdiff.diffChars(origin, data)
                            .some((part) => {
                            return part.added || part.removed;
                        });
                        if (diff) {
                            promises.push(new Promise((resolve, reject) => {
                                graceful_fs_1.writeFile(file, data, (err) => {
                                    if (err) {
                                        common_1.postError(`Error: ${err}`);
                                        reject();
                                    }
                                    percentComplete = showProgress(index, files, percentComplete, progress, message);
                                    resolve();
                                });
                            }).catch((error) => {
                                common_1.postError(error);
                            }));
                        }
                        resolve();
                    });
                }).catch((error) => {
                    common_1.postError(error);
                }));
            }
            else if (file.endsWith(".md")) {
                promises.push(new Promise((resolve, reject) => {
                    graceful_fs_1.readFile(file, "utf8", (err, data) => {
                        if (err) {
                            common_1.postError(`Error: ${err}`);
                            reject();
                        }
                        const origin = data;
                        data = handleLinksWithRegex(data);
                        if (data.startsWith("---")) {
                            data = lowerCaseData(data, "ms.author");
                            data = lowerCaseData(data, "author");
                            data = lowerCaseData(data, "ms.prod");
                            data = lowerCaseData(data, "ms.service");
                            data = lowerCaseData(data, "ms.subservice");
                            data = lowerCaseData(data, "ms.technology");
                            data = lowerCaseData(data, "ms.topic");
                            const regex = new RegExp(`^(---)([^>]+?)(---)$`, "m");
                            const metadataMatch = data.match(regex);
                            if (metadataMatch) {
                                data = handleMarkdownMetadata(data, metadataMatch[2]);
                            }
                        }
                        const diff = jsdiff.diffChars(origin, data)
                            .some((part) => {
                            return part.added || part.removed;
                        });
                        if (diff) {
                            promises.push(new Promise((resolve, reject) => {
                                graceful_fs_1.writeFile(file, data, (err) => {
                                    if (err) {
                                        common_1.postError(`Error: ${err}`);
                                        reject();
                                    }
                                    percentComplete = showProgress(index, files, percentComplete, progress, message);
                                    resolve();
                                });
                            }).catch((error) => {
                                common_1.postError(error);
                            }));
                        }
                        resolve();
                    });
                }).catch((error) => {
                    common_1.postError(error);
                }));
            }
        });
        promises.push(new Promise((resolve, reject) => {
            master_redirect_controller_1.generateMasterRedirectionFile(workspacePath, resolve);
        }));
        Promise.all(promises).then(() => {
            progress.report({ increment: 100, message: "Everything completed." });
            common_1.showStatusMessage(`Cleanup: Everything completed.`);
            resolve();
        }).catch((error) => {
            common_1.postError(error);
        });
    });
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
function showProgress(index, files, percentComplete, progress, message) {
    const currentCompletedPercent = Math.round(((index / files.length) * 100));
    if (percentComplete < currentCompletedPercent) {
        percentComplete = currentCompletedPercent;
        progress.report({ increment: percentComplete, message: `${message} ${percentComplete}%` });
    }
    return percentComplete;
}
/**
 * Searches through all directories from rootPath
 * and cleans up Yaml Metadata values that have single array items
 * then converts the array to single item.
 */
function handleSingleValuedMetadata(workspacePath, progress, resolve) {
    telemetry_1.reporter.sendTelemetryEvent("command", { command: telemetryCommand });
    common_1.showStatusMessage("Cleanup: Single-Valued metadata started.");
    const message = "Single-Valued metadata";
    progress.report({ increment: 0, message });
    recursive(workspacePath, [".git", ".github", ".vscode", ".vs", "node_module"], (err, files) => {
        if (err) {
            common_1.postError(err);
        }
        let percentComplete = 0;
        const promises = [];
        files.map((file, index) => {
            if (file.endsWith(".yml") || file.endsWith("docfx.json")) {
                promises.push(new Promise((resolve, reject) => {
                    graceful_fs_1.readFile(file, "utf8", (err, data) => {
                        if (err) {
                            common_1.postError(`Error: ${err}`);
                            reject();
                        }
                        const origin = data;
                        data = handleYamlMetadata(data);
                        const diff = jsdiff.diffChars(origin, data)
                            .some((part) => {
                            return part.added || part.removed;
                        });
                        if (diff) {
                            graceful_fs_1.writeFile(file, data, (err) => {
                                promises.push(new Promise((resolve, reject) => {
                                    if (err) {
                                        common_1.postError(`Error: ${err}`);
                                        reject();
                                    }
                                    percentComplete = showProgress(index, files, percentComplete, progress, message);
                                    resolve();
                                }).catch((error) => {
                                    common_1.postError(error);
                                }));
                            });
                        }
                        resolve();
                    });
                }).catch((error) => {
                    common_1.postError(error);
                }));
            }
            else if (file.endsWith(".md")) {
                promises.push(new Promise((resolve, reject) => {
                    graceful_fs_1.readFile(file, "utf8", (err, data) => {
                        if (err) {
                            common_1.postError(`Error: ${err}`);
                        }
                        if (data.startsWith("---")) {
                            const regex = new RegExp(`^(---)([^>]+?)(---)$`, "m");
                            const metadataMatch = data.match(regex);
                            if (metadataMatch) {
                                const origin = data;
                                data = handleMarkdownMetadata(data, metadataMatch[2]);
                                const diff = jsdiff.diffChars(origin, data)
                                    .some((part) => {
                                    return part.added || part.removed;
                                });
                                if (diff) {
                                    graceful_fs_1.writeFile(file, data, err => {
                                        promises.push(new Promise((resolve, reject) => {
                                            if (err) {
                                                common_1.postError(`Error: ${err}`);
                                                reject();
                                            }
                                            percentComplete = showProgress(index, files, percentComplete, progress, message);
                                        }).catch((error) => {
                                            common_1.postError(error);
                                        }));
                                    });
                                }
                            }
                        }
                        resolve();
                    });
                }).catch((error) => {
                    common_1.postError(error);
                }));
            }
        });
        Promise.all(promises).then(() => {
            progress.report({ increment: 100, message: "Single-Valued metadata completed." });
            common_1.showStatusMessage(`Cleanup: Single-Valued metadata completed.`);
            progress.report({ increment: 100, message: `100%` });
            resolve();
        }).catch(err => {
            common_1.postError(err);
        });
    });
}
/**
 * Takes in markdown data string and parses the file.
 * Then perform operations to handle single item arrays
 * and convert them to single item values then return the data.
 * @param data data as yaml string from file
 */
function handleMarkdownMetadata(data, metadata) {
    try {
        const yamlContent = jsyaml.load(metadata);
        if (yamlContent) {
            if (handleSingleItemArray(yamlContent["author"])) {
                data = singleValueMetadata(data, "author");
            }
            if (handleSingleItemArray(yamlContent["ms.author"])) {
                data = singleValueMetadata(data, "ms.author");
            }
            if (handleSingleItemArray(yamlContent["ms.component"])) {
                data = singleValueMetadata(data, "ms.component");
            }
            if (handleSingleItemArray(yamlContent["ms.date"])) {
                data = singleValueMetadata(data, "ms.date");
            }
            if (handleSingleItemArray(yamlContent["ms.prod"])) {
                data = singleValueMetadata(data, "ms.prod");
            }
            if (handleSingleItemArray(yamlContent["ms.service"])) {
                data = singleValueMetadata(data, "ms.service");
            }
            if (handleSingleItemArray(yamlContent["ms.subservice"])) {
                data = singleValueMetadata(data, "ms.subservice");
            }
            if (handleSingleItemArray(yamlContent["ms.technology"])) {
                data = singleValueMetadata(data, "ms.technology");
            }
            if (handleSingleItemArray(yamlContent["ms.topic"])) {
                data = singleValueMetadata(data, "ms.topic");
            }
            if (handleSingleItemArray(yamlContent["ms.title"])) {
                data = singleValueMetadata(data, "ms.title");
            }
        }
    }
    catch (error) {
        common_1.postError(error);
    }
    return data;
}
/**
 * Takes in yaml data string and parses the file.
 * Then perform operations to handle single item arrays
 * and convert them to single item values then return the data.
 * @param data data as yaml string from file
 */
function handleYamlMetadata(data) {
    try {
        const yamlContent = jsyaml.load(data);
        if (yamlContent.metadata) {
            if (handleSingleItemArray(yamlContent.metadata["author"])) {
                data = singleValueMetadata(data, "author");
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.author"])) {
                data = singleValueMetadata(data, "ms.author");
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.component"])) {
                data = singleValueMetadata(data, "ms.component");
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.date"])) {
                data = singleValueMetadata(data, "ms.date");
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.prod"])) {
                data = singleValueMetadata(data, "ms.prod");
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.service"])) {
                data = singleValueMetadata(data, "ms.service");
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.subservice"])) {
                data = singleValueMetadata(data, "ms.subservice");
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.technology"])) {
                data = singleValueMetadata(data, "ms.technology");
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.topic"])) {
                data = singleValueMetadata(data, "ms.topic");
            }
            if (handleSingleItemArray(yamlContent.metadata["ms.title"])) {
                data = singleValueMetadata(data, "ms.title");
            }
        }
    }
    catch (error) {
        common_1.postError(error);
    }
    return data;
}
/**
 * Checks if array has only one item. if so, then return that item.
 * @param content takes in string data as content and retuns
 * first item in array if the array only has one item in array.
 */
function handleSingleItemArray(content) {
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
function singleValueMetadata(data, variable) {
    const dashRegex = new RegExp(`${variable}:\\s+-\\s(["'\\sA-Za-z0-9\\-\\_]+)$`, "m");
    const bracketRegex = new RegExp(`${variable}:\\s+\\[(["'\\sA-Za-z0-9\\-\\_]+)\\]$`, "m");
    const dashMatches = dashRegex.exec(data);
    const bracketMatch = bracketRegex.exec(data);
    if (dashMatches) {
        return data.replace(dashRegex, `${variable}: ${dashMatches[1]}`);
    }
    else if (bracketMatch) {
        return data.replace(bracketRegex, `${variable}: ${bracketMatch[1]}`);
    }
    else {
        return data;
    }
}
/**
 * Converts http:// to https:// for all microsoft links.
 */
function microsoftLinks(workspacePath, progress, resolve) {
    common_1.showStatusMessage("Cleanup: Microsoft Links started.");
    const message = "Microsoft Links";
    progress.report({ increment: 0, message });
    recursive(workspacePath, [".git", ".github", ".vscode", ".vs", "node_module"], (err, files) => {
        if (err) {
            common_1.postError(err);
        }
        let percentComplete = 0;
        const promises = [];
        files.map((file, index) => {
            if (file.endsWith(".md")) {
                promises.push(new Promise((resolve, reject) => {
                    graceful_fs_1.readFile(file, "utf8", (err, data) => {
                        const origin = data;
                        data = handleLinksWithRegex(data);
                        const diff = jsdiff.diffChars(origin, data)
                            .some((part) => {
                            return part.added || part.removed;
                        });
                        if (diff) {
                            promises.push(new Promise((resolve, reject) => {
                                graceful_fs_1.writeFile(file, data, err => {
                                    if (err) {
                                        common_1.postError(`Error: ${err}`);
                                    }
                                    percentComplete = showProgress(index, files, percentComplete, progress, message);
                                    resolve();
                                });
                            }).catch((error) => {
                                common_1.postError(error);
                            }));
                        }
                        resolve();
                    });
                }).catch((error) => {
                    common_1.postError(error);
                }));
            }
        });
        Promise.all(promises).then(() => {
            progress.report({ increment: 100, message: "Microsoft Links completed." });
            common_1.showStatusMessage(`Cleanup: Microsoft Links completed.`);
            resolve();
        }).catch((error) => {
            common_1.postError(error);
        });
    });
}
/**
 * replaces input data with regex values for microsoft links.
 * Looks for data that contains microsoft links for docs, azure, msdn, and technet.
 * Replace the http with https, and remove language specific url.
 * @param data takes data string as arg
 */
function handleLinksWithRegex(data) {
    const akaRegex = new RegExp(/http:\/\/aka.ms/g);
    data = data.replace(akaRegex, "https://aka.ms");
    const microsoftRegex = new RegExp(/http:\/\/microsoft.com/g);
    data = data.replace(microsoftRegex, "https://microsoft.com");
    const goMicrosoftRegex = new RegExp(/http:\/\/go.microsoft.com/g);
    data = data.replace(goMicrosoftRegex, "https://go.microsoft.com");
    const visualstudioRegex = new RegExp(/http:\/\/visualstudio.com/g);
    data = data.replace(visualstudioRegex, "https://visualstudio.com");
    const officeRegex = new RegExp(/http:\/\/office.com/g);
    data = data.replace(officeRegex, "https://office.com");
    const docsRegex = new RegExp(/http:\/\/docs.microsoft.com/g);
    data = data.replace(docsRegex, "https://docs.microsoft.com");
    const azureRegex = new RegExp(/http:\/\/azure.microsoft.com/g);
    data = data.replace(azureRegex, "https://azure.microsoft.com");
    const azureRegex2 = new RegExp(/http:\/\/azure.com/g);
    data = data.replace(azureRegex2, "https://azure.com");
    const msdnRegex = new RegExp(/http:\/\/msdn.microsoft.com/g);
    data = data.replace(msdnRegex, "https://msdn.microsoft.com");
    const msdnRegex2 = new RegExp(/http:\/\/msdn.com/g);
    data = data.replace(msdnRegex2, "https://msdn.com");
    const technetRegex = new RegExp(/http:\/\/technet.microsoft.com/g);
    data = data.replace(technetRegex, "https://technet.microsoft.com");
    const technetRegex2 = new RegExp(/http:\/\/technet.com/g);
    data = data.replace(technetRegex2, "https://technet.com");
    const docsRegexLang = new RegExp(/https:\/\/docs.microsoft.com\/[A-Za-z]{2}-[A-Za-z]{2}\//g);
    data = data.replace(docsRegexLang, "https://docs.microsoft.com/");
    const azureRegexLang = new RegExp(/https:\/\/azure.microsoft.com\/[A-Za-z]{2}-[A-Za-z]{2}\//g);
    data = data.replace(azureRegexLang, "https://azure.microsoft.com/");
    const msdnRegexLang = new RegExp(/https:\/\/msdn.microsoft.com\/[A-Za-z]{2}-[A-Za-z]{2}\//g);
    data = data.replace(msdnRegexLang, "https://msdn.microsoft.com/");
    const technetRegexLang = new RegExp(/https:\/\/technet.microsoft.com\/[A-Za-z]{2}-[A-Za-z]{2}\//g);
    data = data.replace(technetRegexLang, "https://technet.microsoft.com/");
    return data;
}
/**
 * Lower cases all metadata found in .md files
 */
function capitalizationOfMetadata(workspacePath, progress, resolve) {
    common_1.showStatusMessage("Cleanup: Capitalization of metadata values started.");
    const message = "Capitalization of metadata values";
    progress.report({ increment: 0, message });
    recursive(workspacePath, [".git", ".github", ".vscode", ".vs", "node_module"], (err, files) => {
        if (err) {
            common_1.postError(err);
        }
        let percentComplete = 0;
        const promises = [];
        files.map((file, index) => {
            if (file.endsWith(".md")) {
                promises.push(new Promise((resolve) => {
                    graceful_fs_1.readFile(file, "utf8", (err, data) => {
                        if (err) {
                            common_1.postError(`Error: ${err}`);
                        }
                        if (data.startsWith("---")) {
                            const origin = data;
                            data = lowerCaseData(data, "ms.author");
                            data = lowerCaseData(data, "author");
                            data = lowerCaseData(data, "ms.prod");
                            data = lowerCaseData(data, "ms.service");
                            data = lowerCaseData(data, "ms.subservice");
                            data = lowerCaseData(data, "ms.technology");
                            data = lowerCaseData(data, "ms.topic");
                            const diff = jsdiff.diffChars(origin, data)
                                .some((part) => {
                                return part.added || part.removed;
                            });
                            if (diff) {
                                promises.push(new Promise((resolve) => {
                                    graceful_fs_1.writeFile(file, data, (err) => {
                                        if (err) {
                                            common_1.postError(`Error: ${err}`);
                                        }
                                        percentComplete = showProgress(index, files, percentComplete, progress, message);
                                        resolve();
                                    });
                                }).catch((error) => {
                                    common_1.postError(error);
                                }));
                            }
                        }
                        resolve();
                    });
                }).catch((error) => {
                    common_1.postError(error);
                }));
            }
        });
        Promise.all(promises).then(() => {
            progress.report({ increment: 100, message: "Capitalization of metadata values completed." });
            common_1.showStatusMessage(`Cleanup: Capitalization of metadata values completed.`);
            resolve();
        }).catch((error) => {
            common_1.postError(error);
        });
    });
}
/**
 * takes data as input, and passes variable into regex
 * to be used to find metadata key and replace value with lowercase data.
 * @param data takes string data from file
 * @param variable metadata key to use in regex to replace
 */
function lowerCaseData(data, variable) {
    const regex = new RegExp(`^(${variable}:\\s?)(.*\\s)`, "m");
    const captureParts = regex.exec(data);
    let value = "";
    if (captureParts && captureParts.length > 2) {
        value = captureParts[2].toLowerCase();
        if (value.match(/^\s*$/) !== null) {
            return data;
        }
        try {
            return data.replace(regex, `${variable}: ${value}`);
        }
        catch (error) {
            common_1.postError(`Error occurred: ${error}`);
        }
    }
    return data;
}
//# sourceMappingURL=cleanup-controller.js.map