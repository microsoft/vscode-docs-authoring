"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const graceful_fs_1 = require("graceful-fs");
const common_1 = require("../../helper/common");
const utilities_1 = require("./utilities");
const jsdiff = require("diff");
/**
 * Converts http:// to https:// for all microsoft links.
 */
function microsoftLinks(progress, promises, file, percentComplete, files, index) {
    const message = "Microsoft Links";
    progress.report({ increment: 0, message });
    if (file.endsWith(".md")) {
        promises.push(new Promise((resolve, reject) => {
            graceful_fs_1.readFile(file, "utf8", (err, data) => {
                const origin = data;
                data = handleLinksWithRegex(data);
                const diff = jsdiff.diffChars(origin, data)
                    .some((part) => {
                    return part.added || part.removed;
                });
                if (diff) {
                    promises.push(new Promise((resolve, reject) => {
                        graceful_fs_1.writeFile(file, data, err => {
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
                resolve();
            });
        }).catch((error) => {
            common_1.postError(error);
        }));
    }
    ;
    return promises;
}
exports.microsoftLinks = microsoftLinks;
/**
 * replaces input data with regex values for microsoft links.
 * Looks for data that contains microsoft links for docs, azure, msdn, and technet.
 * Replace the http with https, and remove language specific url.
 * @param data takes data string as arg
 */
function handleLinksWithRegex(data) {
    const akaRegex = new RegExp(/http:\/\/aka.ms/g);
    data = data.replace(akaRegex, "https://aka.ms");
    const microsoftRegex = new RegExp(/http:\/\/microsoft.com/g);
    data = data.replace(microsoftRegex, "https://microsoft.com");
    const goMicrosoftRegex = new RegExp(/http:\/\/go.microsoft.com/g);
    data = data.replace(goMicrosoftRegex, "https://go.microsoft.com");
    const visualstudioRegex = new RegExp(/http:\/\/visualstudio.com/g);
    data = data.replace(visualstudioRegex, "https://visualstudio.com");
    const officeRegex = new RegExp(/http:\/\/office.com/g);
    data = data.replace(officeRegex, "https://office.com");
    const docsRegex = new RegExp(/http:\/\/docs.microsoft.com/g);
    data = data.replace(docsRegex, "https://docs.microsoft.com");
    const azureRegex = new RegExp(/http:\/\/azure.microsoft.com/g);
    data = data.replace(azureRegex, "https://azure.microsoft.com");
    const azureRegex2 = new RegExp(/http:\/\/azure.com/g);
    data = data.replace(azureRegex2, "https://azure.com");
    const msdnRegex = new RegExp(/http:\/\/msdn.microsoft.com/g);
    data = data.replace(msdnRegex, "https://msdn.microsoft.com");
    const msdnRegex2 = new RegExp(/http:\/\/msdn.com/g);
    data = data.replace(msdnRegex2, "https://msdn.com");
    const technetRegex = new RegExp(/http:\/\/technet.microsoft.com/g);
    data = data.replace(technetRegex, "https://technet.microsoft.com");
    const technetRegex2 = new RegExp(/http:\/\/technet.com/g);
    data = data.replace(technetRegex2, "https://technet.com");
    const docsRegexLang = new RegExp(/https:\/\/docs.microsoft.com\/[A-Za-z]{2}-[A-Za-z]{2}\//g);
    data = data.replace(docsRegexLang, "https://docs.microsoft.com/");
    const azureRegexLang = new RegExp(/https:\/\/azure.microsoft.com\/[A-Za-z]{2}-[A-Za-z]{2}\//g);
    data = data.replace(azureRegexLang, "https://azure.microsoft.com/");
    const msdnRegexLang = new RegExp(/https:\/\/msdn.microsoft.com\/[A-Za-z]{2}-[A-Za-z]{2}\//g);
    data = data.replace(msdnRegexLang, "https://msdn.microsoft.com/");
    const technetRegexLang = new RegExp(/https:\/\/technet.microsoft.com\/[A-Za-z]{2}-[A-Za-z]{2}\//g);
    data = data.replace(technetRegexLang, "https://technet.microsoft.com/");
    return data;
}
exports.handleLinksWithRegex = handleLinksWithRegex;
//# sourceMappingURL=microsoftLinks.js.map