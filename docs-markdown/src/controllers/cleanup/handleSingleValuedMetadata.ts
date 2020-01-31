import { reporter } from "../../helper/telemetry";
const telemetryCommand: string = "applyCleanup";
let commandOption: string;
/**
 * Searches through all directories from rootPath
 * and cleans up Yaml Metadata values that have single array items
 * then converts the array to single item.
 */
export function handleSingleValuedMetadata(progress: any, promises: Array<Promise<any>>, file: string, percentComplete: number, files: Array<string> | null, index: number | null) {
    reporter.sendTelemetryEvent("command", { command: telemetryCommand });
    const message = "Single-Valued metadata";
    progress.report({ increment: 0, message });
    if (file.endsWith(".yml")) {
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
                    writeFile(file, data, (err) => {
                        promises.push(new Promise((resolve, reject) => {
                            if (err) {
                                postError(`Error: ${err}`);
                                reject();
                            }
                            percentComplete = showProgress(index, files, percentComplete, progress, message);
                            resolve();
                        }).catch((error) => {
                            postError(error);
                        }));
                    });
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
                }
                if (data.startsWith("---")) {
                    const regex = new RegExp(`^(---)([^>]+?)(---)$`, "m");
                    const metadataMatch = data.match(regex);
                    if (metadataMatch) {
                        const origin = data;
                        data = handleMarkdownMetadata(data, metadataMatch[2]);
                        const diff = jsdiff.diffChars(origin, data)
                            .some((part: { added: any; removed: any; }) => {
                                return part.added || part.removed;
                            });
                        if (diff) {
                            writeFile(file, data, err => {
                                promises.push(new Promise((resolve, reject) => {
                                    if (err) {
                                        postError(`Error: ${err}`);
                                        reject();
                                    }
                                    percentComplete = showProgress(index, files, percentComplete, progress, message);
                                }).catch((error) => {
                                    postError(error);
                                }));
                            });
                        }
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