import { readFile, writeFile } from "graceful-fs"
import { postError, showStatusMessage } from "../../helper/common"
import { handleYamlMetadata } from "./handleYamlMetadata"
import { showProgress } from "./utilities"
import { handleLinksWithRegex } from "./microsoftLinks"
import { lowerCaseData } from "./capitalizationOfMetadata"
import { handleMarkdownMetadata } from "./handleMarkdownMetadata"
import { generateMasterRedirectionFile } from "../master-redirect-controller"
import { removeUnusedImagesAndIncludes } from "./remove-unused-assets-controller"
const jsdiff = require("diff")
const recursive = require("recursive-readdir")

/**
 * Run all Cleanup... scripts.
 * handleSingValuedMetadata() => cleans up Yaml Metadata values that have single array item;
 * microsoftLinks() => converts http:// to https:// for all microsoft links.
 * capitalizationOfMetadata() => lower cases all metadata found in .md files
 * generateMasterRedirectionFile() => creates master redirection file for root.
 */
export function runAll(progress: any, promises: Promise<any>[], file: string, percentComplete: number, files: string[] | null, index: number | null) {
    const message = "Everything"
    progress.report({ increment: 0, message })
    if (file.endsWith(".yml")) {
        promises.push(new Promise((resolve, reject) => {
            readFile(file, "utf8", (err, data) => {
                if (err) {
                    postError(`Error: ${err}`)
                    reject()
                }
                const origin = data
                data = handleYamlMetadata(data)
                const diff = jsdiff.diffChars(origin, data)
                    .some((part: { added: any; removed: any }) => part.added || part.removed)
                if (diff) {
                    promises.push(new Promise((resolve, reject) => {
                        writeFile(file, data, err => {
                            if (err) {
                                postError(`Error: ${err}`)
                                reject()
                            }
                            percentComplete = showProgress(index, files, percentComplete, progress, message)
                            resolve()
                        })
                    }).catch(error => {
                        postError(error)
                    }))
                }
                resolve()
            })
        }).catch(error => {
            postError(error)
        }))
    } else if (file.endsWith(".md")) {
        promises.push(new Promise((resolve, reject) => {
            readFile(file, "utf8", (err, data) => {
                if (err) {
                    postError(`Error: ${err}`)
                    reject()
                }
                const origin = data
                data = handleLinksWithRegex(data)
                if (data.startsWith("---")) {
                    data = lowerCaseData(data, "ms.author")
                    data = lowerCaseData(data, "author")
                    data = lowerCaseData(data, "ms.prod")
                    data = lowerCaseData(data, "ms.service")
                    data = lowerCaseData(data, "ms.subservice")
                    data = lowerCaseData(data, "ms.technology")
                    data = lowerCaseData(data, "ms.topic")
                    const regex = new RegExp("^(---)([^>]+?)(---)$", "m")
                    const metadataMatch = data.match(regex)
                    if (metadataMatch) {
                        data = handleMarkdownMetadata(data, metadataMatch[2])
                    }
                }
                const diff = jsdiff.diffChars(origin, data)
                    .some((part: { added: any; removed: any }) => part.added || part.removed)
                if (diff) {
                    promises.push(new Promise((resolve, reject) => {
                        writeFile(file, data, err => {
                            if (err) {
                                postError(`Error: ${err}`)
                                reject()
                            }
                            percentComplete = showProgress(index, files, percentComplete, progress, message)
                            resolve()
                        })
                    }).catch(error => {
                        postError(error)
                    }))
                }
                resolve()
            })
        }).catch(error => {
            postError(error)
        }))
    }
    return promises
}

export function runAllWorkspace(workspacePath: string, progress: any, resolve: any) {
    showStatusMessage("Cleanup: Everything started.")
    const message = "Everything"
    progress.report({ increment: 0, message })
    recursive(workspacePath,
        [".git", ".github", ".vscode", ".vs", "node_module"],
        (err: any, files: string[]) => {
            if (err) {
                postError(err)
            }
            let percentComplete = 0
            const promises: Promise<any>[] = []
            files.map((file, index) => {
                if (file.endsWith(".yml") || file.endsWith("docfx.json")) {
                    promises.push(new Promise((resolve, reject) => {
                        readFile(file, "utf8", (err, data) => {
                            if (err) {
                                postError(`Error: ${err}`)
                                reject()
                            }
                            const origin = data
                            data = handleYamlMetadata(data)
                            const diff = jsdiff.diffChars(origin, data)
                                .some((part: { added: any; removed: any }) => part.added || part.removed)
                            if (diff) {
                                promises.push(new Promise((resolve, reject) => {
                                    writeFile(file, data, err => {
                                        if (err) {
                                            postError(`Error: ${err}`)
                                            reject()
                                        }
                                        percentComplete = showProgress(index, files, percentComplete, progress, message)
                                        resolve()
                                    })
                                }).catch(error => {
                                    postError(error)
                                }))
                            }
                            resolve()
                        })
                    }).catch(error => {
                        postError(error)
                    }))
                } else if (file.endsWith(".md")) {
                    promises.push(new Promise((resolve, reject) => {
                        readFile(file, "utf8", (err, data) => {
                            if (err) {
                                postError(`Error: ${err}`)
                                reject()
                            }
                            const origin = data
                            data = handleLinksWithRegex(data)
                            if (data.startsWith("---")) {
                                data = lowerCaseData(data, "ms.author")
                                data = lowerCaseData(data, "author")
                                data = lowerCaseData(data, "ms.prod")
                                data = lowerCaseData(data, "ms.service")
                                data = lowerCaseData(data, "ms.subservice")
                                data = lowerCaseData(data, "ms.technology")
                                data = lowerCaseData(data, "ms.topic")
                                const regex = new RegExp("^(---)([^>]+?)(---)$", "m")
                                const metadataMatch = data.match(regex)
                                if (metadataMatch) {
                                    data = handleMarkdownMetadata(data, metadataMatch[2])
                                }
                            }
                            const diff = jsdiff.diffChars(origin, data)
                                .some((part: { added: any; removed: any }) => part.added || part.removed)
                            if (diff) {
                                promises.push(new Promise((resolve, reject) => {
                                    writeFile(file, data, err => {
                                        if (err) {
                                            postError(`Error: ${err}`)
                                            reject()
                                        }
                                        percentComplete = showProgress(index, files, percentComplete, progress, message)
                                        resolve()
                                    })
                                }).catch(error => {
                                    postError(error)
                                }))
                            }
                            resolve()
                        })
                    }).catch(error => {
                        postError(error)
                    }))
                }
            })
            promises.push(new Promise((resolve, reject) => {
                generateMasterRedirectionFile(workspacePath, resolve)
            }))
            promises.push(new Promise((resolve, reject) => {
                removeUnusedImagesAndIncludes(workspacePath, progress, promises, resolve)
            }))
            Promise.all(promises).then(() => {
                progress.report({ increment: 100, message: "Everything completed." })
                showStatusMessage("Cleanup: Everything completed.")
                resolve()
            }).catch(error => {
                postError(error)
            })
        }
    )
}
