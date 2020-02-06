import { readFile, writeFile } from "graceful-fs";
import { postError } from "../../helper/common";
import { showProgress } from "./utilities";
const jsdiff = require("diff");

export function removeEmptyMetadata(progress: any, promises: Array<Promise<any>>, file: string, percentComplete: number, files: Array<string> | null, index: number | null) {
    const message = "Capitalization of metadata values";
    if (file.endsWith(".md")) {
        promises.push(new Promise((resolve) => {
            readFile(file, "utf8", (err, data) => {
                if (err) {
                    postError(`Error: ${err}`);
                }
                if (data.startsWith("---")) {
                    const origin = data;
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