"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graceful_fs_1 = require("graceful-fs");
const common_1 = require("../../helper/common");
const utilities_1 = require("./utilities");
const jsdiff = require("diff");
/**
 * Cleanup empty, na and commented out metadata attributes found in .md files
 */
function removeEmptyMetadata(progress, promises, file, percentComplete, files, index, cleanupType) {
    const message = "Removal of metadata values";
    if (file.endsWith(".md")) {
        promises.push(new Promise((resolve) => {
            graceful_fs_1.readFile(file, "utf8", (err, data) => {
                if (err) {
                    common_1.postError(`Error: ${err}`);
                }
                if (data.startsWith("---")) {
                    const origin = data;
                    if (cleanupType === "empty") {
                        data = deleteEmptyMetadata(data);
                    }
                    if (cleanupType === "na") {
                        data = deleteNaMetadata(data);
                    }
                    if (cleanupType === "commented") {
                        data = deleteCommentedMetadata(data);
                    }
                    if (cleanupType === "all") {
                        data = deleteEmptyMetadata(data);
                        data = deleteNaMetadata(data);
                        data = deleteCommentedMetadata(data);
                    }
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
                                percentComplete = utilities_1.showProgress(index, files, percentComplete, progress, message);
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
    return promises;
}
exports.removeEmptyMetadata = removeEmptyMetadata;
function deleteEmptyMetadata(data) {
    const metadataRegex = new RegExp(/^(\w+\.*\w+?:)(\s*|\s""|\s'')[\n|\r](?=(.|\n|\r)*---\s$)/gmi);
    data = data.replace(metadataRegex, '');
    return data;
}
exports.deleteEmptyMetadata = deleteEmptyMetadata;
function deleteNaMetadata(data) {
    const metadataRegex = new RegExp(/^(\w+\.*\w+?:\s(na|n\/a))[\n|\r](?=(.|\n|\r)*---\s$)/gmi);
    data = data.replace(metadataRegex, '');
    return data;
}
exports.deleteNaMetadata = deleteNaMetadata;
function deleteCommentedMetadata(data) {
    const metadataRegex = new RegExp(/^(#\s?\w+\.*.*\w+?:).*[\n|\r](?=(.|\n|\r)*---\s$)/gmi);
    data = data.replace(metadataRegex, '');
    return data;
}
exports.deleteCommentedMetadata = deleteCommentedMetadata;
//# sourceMappingURL=removeEmptyMetadata.js.map