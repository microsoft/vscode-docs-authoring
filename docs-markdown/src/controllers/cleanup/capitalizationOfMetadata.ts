import { readFile, writeFile } from "graceful-fs";
import { postError } from "../../helper/common";
import { showProgress } from "./utilities";
// tslint:disable no-var-requires
const jsdiff = require("diff");

/**
 * Lower cases all metadata found in .md files
 */
export function capitalizationOfMetadata(progress: any, file: string, percentComplete: number, files: string[] | null, index: number | null) {
    const message = "Capitalization of metadata values";
    if (file.endsWith(".md")) {
        return new Promise((resolve, reject) => {
            readFile(file, "utf8", (err, data) => {
                if (err) {
                    postError(`Error: ${err}`);
                    reject();
                }
                const origin = data;
                if (data.startsWith("---")) {
                    data = lowerCaseData(data, "ms.author");
                    data = lowerCaseData(data, "author");
                    data = lowerCaseData(data, "ms.prod");
                    data = lowerCaseData(data, "ms.service");
                    data = lowerCaseData(data, "ms.subservice");
                    data = lowerCaseData(data, "ms.technology");
                    data = lowerCaseData(data, "ms.topic");
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
/**
 * takes data as input, and passes variable into regex
 * to be used to find metadata key and replace value with lowercase data.
 * @param data takes string data from file
 * @param variable metadata key to use in regex to replace
 */
export function lowerCaseData(data: any, variable: string) {
    const regex = new RegExp(`^(${variable}:)(.*(\\S\\s)?)`, "m");
    const captureParts = regex.exec(data);
    let value = "";
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
