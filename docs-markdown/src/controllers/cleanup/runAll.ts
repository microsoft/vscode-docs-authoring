import { readFile, writeFile } from "graceful-fs";
import { postError, showStatusMessage } from "../../helper/common";
import { reporter } from "../../helper/telemetry";
import { generateMasterRedirectionFile } from "../master-redirect-controller";
import { lowerCaseData } from "./capitalizationOfMetadata";
import { handleMarkdownMetadata } from "./handleMarkdownMetadata";
import { handleYamlMetadata } from "./handleYamlMetadata";
import { handleLinksWithRegex } from "./microsoftLinks";
import { getMdAndIncludesFiles, removeUnusedImagesAndIncludes } from "./remove-unused-assets-controller";
import { readWriteFileWithProgress, showProgress } from "./utilities";
// tslint:disable-next-line: no-var-requires
const jsdiff = require("diff");
// tslint:disable-next-line: no-var-requires
const recursive = require("recursive-readdir");
const telemetryCommand: string = "applyCleanup";

/**
 * Run all Cleanup... scripts.
 * handleSingValuedMetadata() => cleans up Yaml Metadata values that have single array item;
 * microsoftLinks() => converts http:// to https:// for all microsoft links.
 * capitalizationOfMetadata() => lower cases all metadata found in .md files
 * generateMasterRedirectionFile() => creates master redirection file for root.
 */
export function runAll(progress: any, file: string, files: string[] | null, index: number | null) {
    const message = "Everything";
    reporter.sendTelemetryEvent("command", { command: telemetryCommand });
    if (file.endsWith(".yml") || file.endsWith(".md")) {
        return readWriteFileWithProgress(progress,
            file,
            message,
            files,
            index,
            (data: string) => {
                if (file.endsWith(".yml")) {
                    data = handleYamlMetadata(data);
                } else if (file.endsWith(".md")) {
                    data = handleLinksWithRegex(data);
                    if (data.startsWith("---")) {
                        data = lowerCaseData(data, "ms.author");
                        data = lowerCaseData(data, "author");
                        data = lowerCaseData(data, "ms.prod");
                        data = lowerCaseData(data, "ms.service");
                        data = lowerCaseData(data, "ms.subservice");
                        data = lowerCaseData(data, "ms.technology");
                        data = lowerCaseData(data, "ms.topic");
                        const regex = new RegExp(`^(---)([^>]+?)(---)$`, "m");
                        const metadataMatch = data.match(regex);
                        if (metadataMatch) {
                            data = handleMarkdownMetadata(data, metadataMatch[2]);
                        }
                    }
                }
                return data;
            });
    } else { return Promise.resolve(); }
}
export async function runAllWorkspace(workspacePath: string, progress: any, resolve: any) {
    showStatusMessage("Cleanup: Everything started.");
    const message = "Everything";
    progress.report({ increment: 0, message });
    const unusedFiles = await getMdAndIncludesFiles(workspacePath);
    return new Promise((chainResolve, chainReject) =>
        recursive(workspacePath,
            [".git", ".github", ".vscode", ".vs", "node_module"],
            (err: any, files: string[]) => {
                if (err) {
                    postError(err);
                    chainReject();
                }
                const promises: Array<Promise<any>> = [];
                files.map((file, index) => {
                    promises.push(removeUnusedImagesAndIncludes(progress, file, files, index, workspacePath, unusedFiles));
                    if (file.endsWith(".yml") || file.endsWith("docfx.json")) {
                        promises.push(new Promise((resolve, reject) => {
                            readFile(file, "utf8", (err, data) => {
                                if (err) {
                                    postError(`Error: ${err}`);
                                    reject();
                                }
                                const origin = data;
                                data = handleYamlMetadata(data);
                                const diff = jsdiff.diffChars(origin, data)
                                    .some((part: { added: any; removed: any; }) => {
                                        return part.added || part.removed;
                                    });
                                if (diff) {
                                    promises.push(new Promise((resolve, reject) => {
                                        writeFile(file, data, (err) => {
                                            if (err) {
                                                postError(`Error: ${err}`);
                                                reject();
                                            }
                                            showProgress(index, files, progress, message);
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
                    } else if (file.endsWith(".md")) {
                        promises.push(new Promise((resolve, reject) => {
                            readFile(file, "utf8", (err, data) => {
                                if (err) {
                                    postError(`Error: ${err}`);
                                    reject();
                                }
                                const origin = data;
                                data = handleLinksWithRegex(data);
                                if (data.startsWith("---")) {
                                    data = lowerCaseData(data, "ms.author");
                                    data = lowerCaseData(data, "author");
                                    data = lowerCaseData(data, "ms.prod");
                                    data = lowerCaseData(data, "ms.service");
                                    data = lowerCaseData(data, "ms.subservice");
                                    data = lowerCaseData(data, "ms.technology");
                                    data = lowerCaseData(data, "ms.topic");
                                    const regex = new RegExp(`^(---)([^>]+?)(---)$`, "m");
                                    const metadataMatch = data.match(regex);
                                    if (metadataMatch) {
                                        data = handleMarkdownMetadata(data, metadataMatch[2]);
                                    }
                                }
                                const diff = jsdiff.diffChars(origin, data)
                                    .some((part: { added: any; removed: any; }) => {
                                        return part.added || part.removed;
                                    });
                                if (diff) {
                                    promises.push(new Promise((resolve, reject) => {
                                        writeFile(file, data, (err) => {
                                            if (err) {
                                                postError(`Error: ${err}`);
                                                reject();
                                            }
                                            showProgress(index, files, progress, message);
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
                    }
                });
                promises.push(new Promise((resolve, reject) => {
                    generateMasterRedirectionFile(workspacePath, resolve);
                }));
                Promise.all(promises).then(() => {
                    progress.report({ increment: 100, message: "Everything completed." });
                    showStatusMessage(`Cleanup: Everything completed.`);
                    setTimeout(() => {
                        chainResolve();
                        resolve();
                    }, 2000);
                }).catch((error) => {
                    postError(error);
                });
            },
        ),
    );
}
