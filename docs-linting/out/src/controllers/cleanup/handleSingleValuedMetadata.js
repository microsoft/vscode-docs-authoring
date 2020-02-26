"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const telemetry_1 = require("../../helper/telemetry");
const graceful_fs_1 = require("graceful-fs");
const common_1 = require("../../helper/common");
const handleYamlMetadata_1 = require("./handleYamlMetadata");
const utilities_1 = require("./utilities");
const handleMarkdownMetadata_1 = require("./handleMarkdownMetadata");
const jsdiff = require("diff");
const telemetryCommand = "applyCleanup";
/**
 * Searches through all directories from rootPath
 * and cleans up Yaml Metadata values that have single array items
 * then converts the array to single item.
 */
function handleSingleValuedMetadata(progress, promises, file, percentComplete, files, index) {
    telemetry_1.reporter.sendTelemetryEvent("command", { command: telemetryCommand });
    const message = "Single-Valued metadata";
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
                    graceful_fs_1.writeFile(file, data, (err) => {
                        promises.push(new Promise((resolve, reject) => {
                            if (err) {
                                common_1.postError(`Error: ${err}`);
                                reject();
                            }
                            percentComplete = utilities_1.showProgress(index, files, percentComplete, progress, message);
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
                        data = handleMarkdownMetadata_1.handleMarkdownMetadata(data, metadataMatch[2]);
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
                                    percentComplete = utilities_1.showProgress(index, files, percentComplete, progress, message);
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
    return promises;
}
exports.handleSingleValuedMetadata = handleSingleValuedMetadata;
//# sourceMappingURL=handleSingleValuedMetadata.js.map