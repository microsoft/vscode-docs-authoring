import { readFile, writeFile } from "graceful-fs";
import { postError } from "../../helper/common";
import { showProgress } from "./utilities";
// tslint:disable no-var-requires
const jsdiff = require("diff");

/**
 * Cleanup empty, na and commented out metadata attributes found in .md files
 */
export function removeEmptyMetadata(progress: any, file: string, percentComplete: number, files: string[] | null, index: number | null, cleanupType: string) {
    const message = "Removal of metadata values";
    if (file.endsWith(".md")) {
        return new Promise((resolve, reject) => {
            readFile(file, "utf8", (err, data) => {
                if (err) {
                    postError(`Error: ${err}`);
                    reject();
                }
                const origin = data;
                if (data.startsWith("---")) {
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
                }
                resolve({ origin, data });
            });
        }).then((result: any) => {
            const diff = jsdiff.diffChars(result.origin, result.data)
                .some((part: { added: any; removed: any; }) => {
                    return part.added || part.removed;
                });
            return new Promise((resolve, reject) => {
                if (diff) {
                    writeFile(file, result.data, (error) => {
                        if (error) {
                            postError(`Error: ${error}`);
                            reject();
                        }
                        percentComplete = showProgress(index, files, percentComplete, progress, message);
                        resolve();
                    });
                } else {
                    resolve();
                }
            });
        });
    } else { return Promise.resolve(); }
}

export function deleteEmptyMetadata(data: any) {
    const metadataRegex: any = new RegExp(/^(\w+\.*\w+?:)(\s*|\s""|\s'')[\n|\r](?=(.|\n|\r)*---\s$)/gmi);
    data = data.replace(metadataRegex, "");
    return data;
}

export function deleteNaMetadata(data: any) {
    const metadataRegex: any = new RegExp(/^(\w+\.*\w+?:\s(na|n\/a))[\n|\r](?=(.|\n|\r)*---\s$)/gmi);
    data = data.replace(metadataRegex, "");
    return data;
}

export function deleteCommentedMetadata(data: any) {
    const metadataRegex: any = new RegExp(/^(#\s?\w+\.*.*\w+?:).*[\n|\r](?=(.|\n|\r)*---\s$)/gmi);
    data = data.replace(metadataRegex, "");
    return data;
}
