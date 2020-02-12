import { readFile, writeFile } from "graceful-fs";
import { postError } from "../../helper/common";
import { showProgress } from "./utilities";
const jsdiff = require("diff");

/**
 * Cleanup empty, na and commented out metadata attributes found in .md files
 */
export function removeEmptyMetadata(progress: any, promises: Array<Promise<any>>, file: string, percentComplete: number, files: Array<string> | null, index: number | null, cleanupType: string) {
    const message = "Removal of metadata values";
    if (file.endsWith(".md")) {
        promises.push(new Promise((resolve) => {
            readFile(file, "utf8", (err, data) => {
                if (err) {
                    postError(`Error: ${err}`);
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
                        .some((part: { added: any; removed: any; }) => {
                            return part.added || part.removed;
                        });
                    if (diff) {
                        promises.push(new Promise((resolve) => {
                            writeFile(file, data, (err) => {
                                if (err) {
                                    postError(`Error: ${err}`);
                                }
                                percentComplete = showProgress(index, files, percentComplete, progress, message);
                                resolve();
                            });
                        }).catch((error) => {
                            postError(error);
                        }));
                    }
                }
                resolve();
            });
        }).catch((error) => {
            postError(error);
        }));
    }
    return promises;
}

export function deleteEmptyMetadata(data: any) {
    const metadataRegex: any = new RegExp(/^(\w+\.*\w+?:)(\s*|\s""|\s'')[\n|\r](?=(.|\n|\r)*---\s$)/gmi);
    data = data.replace(metadataRegex, '');
    return data;
}

export function deleteNaMetadata(data: any) {
    const metadataRegex: any = new RegExp(/^(\w+\.*\w+?:\s(na|n\/a))[\n|\r](?=(.|\n|\r)*---\s$)/gmi);
    data = data.replace(metadataRegex, '');
    return data;
}

export function deleteCommentedMetadata(data: any) {
    const metadataRegex: any = new RegExp(/^(#\s?\w+\.*.*\w+?:).*[\n|\r](?=(.|\n|\r)*---\s$)/gmi);
    data = data.replace(metadataRegex, '');
    return data;
}