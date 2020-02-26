"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graceful_fs_1 = require("graceful-fs");
const common_1 = require("../../helper/common");
const utilities_1 = require("./utilities");
const jsdiff = require("diff");
/**
 * Lower cases all metadata found in .md files
 */
function capitalizationOfMetadata(progress, promises, file, percentComplete, files, index) {
    const message = "Capitalization of metadata values";
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
exports.capitalizationOfMetadata = capitalizationOfMetadata;
/**
 * takes data as input, and passes variable into regex
 * to be used to find metadata key and replace value with lowercase data.
 * @param data takes string data from file
 * @param variable metadata key to use in regex to replace
 */
function lowerCaseData(data, variable) {
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
        }
        catch (error) {
            common_1.postError(`Error occurred: ${error}`);
        }
    }
    return data;
}
exports.lowerCaseData = lowerCaseData;
//# sourceMappingURL=capitalizationOfMetadata.js.map