"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graceful_fs_1 = require("graceful-fs");
const common_1 = require("../../helper/common");
const handleYamlMetadata_1 = require("./handleYamlMetadata");
const utilities_1 = require("./utilities");
const microsoftLinks_1 = require("./microsoftLinks");
const capitalizationOfMetadata_1 = require("./capitalizationOfMetadata");
const handleMarkdownMetadata_1 = require("./handleMarkdownMetadata");
const master_redirect_controller_1 = require("../master-redirect-controller");
const jsdiff = require("diff");
const recursive = require("recursive-readdir");
/**
 * Run all Cleanup... scripts.
 * handleSingValuedMetadata() => cleans up Yaml Metadata values that have single array item;
 * microsoftLinks() => converts http:// to https:// for all microsoft links.
 * capitalizationOfMetadata() => lower cases all metadata found in .md files
 * generateMasterRedirectionFile() => creates master redirection file for root.
 */
function runAll(progress, promises, file, percentComplete, files, index) {
    const message = "Everything";
    progress.report({ increment: 0, message });
    if (file.endsWith(".yml")) {
        promises.push(new Promise((resolve, reject) => {
            graceful_fs_1.readFile(file, "utf8", (err, data) => {
                if (err) {
                    common_1.postError(`Error: ${err}`);
                    reject();
                }
                const origin = data;
                data = handleYamlMetadata_1.handleYamlMetadata(data);
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
                            percentComplete = utilities_1.showProgress(index, files, percentComplete, progress, message);
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
                data = microsoftLinks_1.handleLinksWithRegex(data);
                if (data.startsWith("---")) {
                    data = capitalizationOfMetadata_1.lowerCaseData(data, "ms.author");
                    data = capitalizationOfMetadata_1.lowerCaseData(data, "author");
                    data = capitalizationOfMetadata_1.lowerCaseData(data, "ms.prod");
                    data = capitalizationOfMetadata_1.lowerCaseData(data, "ms.service");
                    data = capitalizationOfMetadata_1.lowerCaseData(data, "ms.subservice");
                    data = capitalizationOfMetadata_1.lowerCaseData(data, "ms.technology");
                    data = capitalizationOfMetadata_1.lowerCaseData(data, "ms.topic");
                    const regex = new RegExp(`^(---)([^>]+?)(---)$`, "m");
                    const metadataMatch = data.match(regex);
                    if (metadataMatch) {
                        data = handleMarkdownMetadata_1.handleMarkdownMetadata(data, metadataMatch[2]);
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
                            percentComplete = utilities_1.showProgress(index, files, percentComplete, progress, message);
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
    return promises;
}
exports.runAll = runAll;
function runAllWorkspace(workspacePath, progress, resolve) {
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
                        data = handleYamlMetadata_1.handleYamlMetadata(data);
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
                                    percentComplete = utilities_1.showProgress(index, files, percentComplete, progress, message);
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
                        data = microsoftLinks_1.handleLinksWithRegex(data);
                        if (data.startsWith("---")) {
                            data = capitalizationOfMetadata_1.lowerCaseData(data, "ms.author");
                            data = capitalizationOfMetadata_1.lowerCaseData(data, "author");
                            data = capitalizationOfMetadata_1.lowerCaseData(data, "ms.prod");
                            data = capitalizationOfMetadata_1.lowerCaseData(data, "ms.service");
                            data = capitalizationOfMetadata_1.lowerCaseData(data, "ms.subservice");
                            data = capitalizationOfMetadata_1.lowerCaseData(data, "ms.technology");
                            data = capitalizationOfMetadata_1.lowerCaseData(data, "ms.topic");
                            const regex = new RegExp(`^(---)([^>]+?)(---)$`, "m");
                            const metadataMatch = data.match(regex);
                            if (metadataMatch) {
                                data = handleMarkdownMetadata_1.handleMarkdownMetadata(data, metadataMatch[2]);
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
                                    percentComplete = utilities_1.showProgress(index, files, percentComplete, progress, message);
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
exports.runAllWorkspace = runAllWorkspace;
//# sourceMappingURL=runAll.js.map