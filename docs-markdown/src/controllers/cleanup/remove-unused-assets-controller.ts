"use strict";

import { existsSync, mkdirSync, readFile, rename } from "graceful-fs";
import { homedir } from "os";
import { basename, dirname, extname, join } from "path";
import { Progress } from "vscode";
import { postError, showStatusMessage } from "../../helper/common";
import { output } from "../../helper/output";
import { imageExtensions, markdownExtensionFilter } from "../media-controller";
import { showProgress } from "./utilities";
// tslint:disable-next-line: no-var-requires
const recursive = require("recursive-readdir");

export function getUnusedImagesAndIncludesCommand() {
    const command = [
        { command: removeUnusedImagesAndIncludes.name, callback: removeUnusedImagesAndIncludes },
    ];

    return command;
}
/**
 * Removes all unused images and includes.
 */
const INCLUDE_RE = /\[!include \[.*\]\((.*)\)\]|<img[^>]+src="([^">]+)"|\((.*?.(?:png|jpg|jpeg|svg|tiff|gif))\s*(?:".*")*\)|source\s*=\s*"(.*?)"|lightbox\s*=\s*"(.*?)"|"\s*source_path\s*"\s*:\s*"(.*?)"|href\s*:\s*(.*)"/gmi;
const message = "Removing unused images and includes. This could take several minutes.";
export function removeUnusedImagesAndIncludes(progress: any, file: string, files: string[], index: number, workspacePath: string, unusedFiles: Array<{ label: any; description: any; }>) {
    // get a list of all images
    if (file.endsWith(".md")
        || file.endsWith(".openpublishing.redirection.json")
        || file.endsWith("toc.yml")) {
        return new Promise((resolve, reject) => {
            readFile(file, "utf8", (err, data) => {
                if (err) {
                    postError(`Error: ${err}`);
                    reject();
                }
                let match: any;
                // tslint:disable-next-line: no-conditional-assignment
                while (match = INCLUDE_RE.exec(data)) {
                    unusedFiles = unusedFiles.filter((ff) => {
                        const ffPath = decodeURI((match[1] || match[2] || match[3] || match[4] || match[5] || match[6] || match[7]).toLowerCase());
                        return ffPath.indexOf(ff.label.toLowerCase()) === -1;
                    });
                }
                showProgress(index, files, progress, message);

                const unusedImagesDirectory = join(homedir(), "Docs Authoring", "unusedImages");

                if (!existsSync(unusedImagesDirectory)) {
                    mkdirSync(unusedImagesDirectory);
                }

                unusedFiles.forEach((uf) => {
                    rename(join(uf.description, uf.label), join(unusedImagesDirectory, uf.label), (err) => {
                        if (err) {
                            output.appendLine(`failed to move ${uf.label}`);
                        }
                    });
                });
                resolve();
            });
        });
    } else { return Promise.resolve(); }
}

export async function removeUnused(progress: Progress<any>, workspacePath: string) {
    const unusedFiles = await getMdAndIncludesFiles(workspacePath);
    return new Promise((chainResolve, chainReject) =>
        recursive(workspacePath, [".git", ".github", ".vscode", ".vs", "node_module"], (err: any, files: string[]) => {
            if (err) {
                postError(err);
                chainReject();
            }
            const filePromises: Array<Promise<any>> = [];
            files.map((file, index) => {
                filePromises.push(removeUnusedImagesAndIncludes(progress, file, files, index, workspacePath, unusedFiles));
            });
            Promise.all(filePromises).then(() => {
                progress.report({ increment: 100, message: "Cleanup: Removal of unused images and includes completed." });
                showStatusMessage(`Cleanup: Removal of unused images and includes completed.`);
                setTimeout(() => {
                    chainResolve();
                }, 2000);
            });
        }));
}

export function getMdAndIncludesFiles(workspacePath: string): Promise<Array<{ label: any; description: any; }>> {
    const items: Array<{ label: any; description: any; }> = [];

    // recursively get all the files from the root folder
    const fileFilter = imageExtensions.concat(markdownExtensionFilter);
    return new Promise((resolve, reject) => {
        recursive(workspacePath,
            [".git", ".github", ".vscode", ".vs", "node_module", "*.yml"],
            (err: any, files: string[]) => {
                if (err) {
                    postError(err);
                    reject();
                }
                const filePromises: Array<Promise<any>> = [];
                files.filter((file: any) =>
                    fileFilter.indexOf(extname(file.toLowerCase())) !== -1).forEach((file: any) => {
                        if (!file.endsWith(".md")
                            || file.indexOf("includes") !== -1) {
                            filePromises.push(new Promise((res) => {
                                items.push({ label: basename(file), description: dirname(file) });
                                res();
                            }));
                        }
                    });
                Promise.all(filePromises).then(() => {
                    resolve(items);
                });
            },
        );
    });
}
