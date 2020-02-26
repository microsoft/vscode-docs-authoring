"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const os_1 = require("os");
const path_1 = require("path");
const extension_1 = require("../../extension");
const common_1 = require("../../helper/common");
const media_controller_1 = require("../media-controller");
const utilities_1 = require("./utilities");
const fs_1 = require("fs");
const recursive = require("recursive-readdir");
function getUnusedImagesAndIncludesCommand() {
    const command = [
        { command: removeUnusedImagesAndIncludes.name, callback: removeUnusedImagesAndIncludes },
    ];
    return command;
}
exports.getUnusedImagesAndIncludesCommand = getUnusedImagesAndIncludesCommand;
/* tslint:disable:max-classes-per-file variable-name*/
class RemoveUnusedAssets {
    constructor() {
    }
}
exports.RemoveUnusedAssets = RemoveUnusedAssets;
function showStatusMessage(message) {
    const { msTimeValue } = common_1.generateTimestamp();
    extension_1.output.appendLine(`[${msTimeValue}] - ` + message);
    extension_1.output.show();
}
/**
 * Removes all unused images and includes.
 */
const INCLUDE_RE = /\[!include \[.*\]\((.*)\)\]|<img[^>]+src="([^">]+)"|\((.*?.(?:png|jpg|jpeg|svg|tiff|gif))\s*(?:".*")*\)|source\s*=\s*"(.*?)"|lightbox\s*=\s*"(.*?)"|"\s*source_path\s*"\s*:\s*"(.*?)"|href\s*:\s*(.*)"/gmi;
function removeUnusedImagesAndIncludes(workspacePath, progress, promises, resolve) {
    const message = "Removing unused images and includes. This could take several minutes.";
    //get a list of all images
    var unusedFiles = getFiles(workspacePath);
    //loop through, and see what images and includes are used
    progress.report({ increment: 0, message });
    recursive(workspacePath, [".git", ".github", ".vscode", ".vs", "node_module"], (err, files) => {
        if (err) {
            common_1.postError(err);
        }
        let percentComplete = 0;
        const promises = [];
        files.map((file, index) => {
            if (file.endsWith(".md")
                || file.endsWith(".openpublishing.redirection.json")
                || file.endsWith("toc.yml")) {
                promises.push(new Promise((resolve, reject) => {
                    fs_1.readFile(file, "utf8", (err, data) => {
                        //read through data and get images and includes, 
                        //cross them with our list of images and includes
                        var match;
                        while (match = INCLUDE_RE.exec(data)) {
                            unusedFiles = unusedFiles.filter(ff => {
                                const ffPath = decodeURI((match[1] || match[2] || match[3] || match[4] || match[5] || match[6] || match[7]).toLowerCase());
                                return ffPath.indexOf(ff.label.toLowerCase()) === -1;
                            });
                        }
                        unusedFiles;
                        promises.push(new Promise((resolve, reject) => {
                            percentComplete = utilities_1.showProgress(index, files, percentComplete, progress, message);
                            resolve();
                        }).catch((error) => {
                            common_1.postError(error);
                        }));
                        resolve();
                    });
                }).catch((error) => {
                    common_1.postError(error);
                }));
            }
        });
        Promise.all(promises).then(() => {
            //now copy the unused files over :)
            const unusedImagesDirectory = path_1.join(os_1.homedir(), "Docs Authoring", "unusedImages");
            if (!fs.existsSync(unusedImagesDirectory)) {
                fs.mkdirSync(unusedImagesDirectory);
            }
            var fsa = require('fs-extra');
            unusedFiles.forEach(uf => {
                fsa.copy(path_1.join(uf.description, uf.label), path_1.join(unusedImagesDirectory, uf.label));
            });
            progress.report({ increment: 100, message: "Cleanup: Removal of unused images and includes completed." });
            showStatusMessage(`Cleanup: Removal of unused images and includes completed.`);
            resolve();
        }).catch((error) => {
            common_1.postError(error);
        });
    });
}
exports.removeUnusedImagesAndIncludes = removeUnusedImagesAndIncludes;
function getFiles(workspacePath, isArt = true) {
    var items = [];
    const path = require("path");
    // recursively get all the files from the root folder
    var fileFilter = media_controller_1.imageExtensions.concat(media_controller_1.markdownExtensionFilter);
    recursive(workspacePath, [".git", ".github", ".vscode", ".vs", "node_module", "*.yml"], (err, files) => {
        if (err) {
            common_1.postError(err);
        }
        files.filter((file) => fileFilter.indexOf(path.extname(file.toLowerCase())) !== -1).forEach((file) => {
            if (!file.endsWith(".md")
                || file.indexOf("includes") != -1) {
                items.push({ label: path.basename(file), description: path.dirname(file) });
            }
        });
    });
    return items;
}
//# sourceMappingURL=remove-unused-assets-controller.js.map