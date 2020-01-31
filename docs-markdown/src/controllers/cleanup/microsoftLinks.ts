import { readFile, writeFile } from "graceful-fs";
import { handleLinksWithRegex, showProgress } from "./cleanup-controller";
import { postError } from "../../helper/common";
const jsdiff = require("diff");

/**
 * Converts http:// to https:// for all microsoft links.
 */
export function microsoftLinks(progress: any, promises: Array<Promise<any>>, file: string, percentComplete: number, files: Array<string> | null, index: number | null) {
    const message = "Microsoft Links";
    progress.report({ increment: 0, message });
    if (file.endsWith(".md")) {
        promises.push(new Promise((resolve, reject) => {
            readFile(file, "utf8", (err, data) => {
                const origin = data;
                data = handleLinksWithRegex(data);
                const diff = jsdiff.diffChars(origin, data)
                    .some((part: { added: any; removed: any; }) => {
                        return part.added || part.removed;
                    });
                if (diff) {
                    promises.push(new Promise((resolve, reject) => {
                        writeFile(file, data, err => {
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
                resolve();
            });
        }).catch((error) => {
            postError(error);
        }));
    };
    return promises;
}
