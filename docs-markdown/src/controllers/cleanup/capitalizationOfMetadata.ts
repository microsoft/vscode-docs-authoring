import { readFile, writeFile } from "graceful-fs";
import { postError } from "../../helper/common";
import { showProgress } from "./utilities";
const jsdiff = require("diff");

/**
 * Lower cases all metadata found in .md files
 */
export function capitalizationOfMetadata(progress: any, promises: Array<Promise<any>>, file: string, percentComplete: number, files: Array<string> | null, index: number | null) {
    const message = "Capitalization of metadata values";
    if (file.endsWith(".md")) {
        promises.push(new Promise((resolve) => {
            readFile(file, "utf8", (err, data) => {
                if (err) {
                    postError(`Error: ${err}`);
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

/**
 * takes data as input, and passes variable into regex
 * to be used to find metadata key and replace value with lowercase data.
 * @param data takes string data from file
 * @param variable metadata key to use in regex to replace
 */
export function lowerCaseData(data: any, variable: string) {
    const regex = new RegExp(`^(${variable}:)(.*(\\S\\s)?)`, "m");
    const captureParts = regex.exec(data);
    let value = ""
    if (captureParts && captureParts.length > 2) {
        value = captureParts[2].toLowerCase();
        if (value.match(/^\s*$/) !== null) {
            return data;
        }
        try {
            return data.replace(regex, `${variable}:${value}`);
        } catch (error) {
            postError(`Error occurred: ${error}`);
        }
    }

    return data;
}