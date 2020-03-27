"use strict"

import * as fs from "fs"
import { homedir } from "os"
import { join } from "path"
import { generateTimestamp, postError } from "../../helper/common"
import { imageExtensions, markdownExtensionFilter } from "../media-controller"
import { showProgress } from "./utilities"
import { readFile } from "fs"
import { output } from "../../helper/output"
const recursive = require("recursive-readdir")

export function getUnusedImagesAndIncludesCommand() {
    const command = [
        { command: removeUnusedImagesAndIncludes.name, callback: removeUnusedImagesAndIncludes }
    ]

    return command
}

/* tslint:disable:max-classes-per-file variable-name */

export class RemoveUnusedAssets {
    constructor() {

    }
}

function showStatusMessage(message: string) {
    const { msTimeValue } = generateTimestamp()
    output.appendLine(`[${msTimeValue}] - ` + message)
    output.show()
}

/**
 * Removes all unused images and includes.
 */
const INCLUDE_RE = /\[!include \[.*\]\((.*)\)\]|<img[^>]+src="([^">]+)"|\((.*?.(?:png|jpg|jpeg|svg|tiff|gif))\s*(?:".*")*\)|source\s*=\s*"(.*?)"|lightbox\s*=\s*"(.*?)"|"\s*source_path\s*"\s*:\s*"(.*?)"|href\s*:\s*(.*)"/gmi
export function removeUnusedImagesAndIncludes(workspacePath: string, progress: any, promises: any, resolve: any) {
    const message = "Removing unused images and includes. This could take several minutes."

    // get a list of all images
    let unusedFiles = getFiles(workspacePath)

    // loop through, and see what images and includes are used
    progress.report({ increment: 0, message })
    recursive(workspacePath,
        [".git", ".github", ".vscode", ".vs", "node_module"],
        (err: any, files: string[]) => {
            if (err) {
                postError(err)
            }
            let percentComplete = 0
            const promises: Promise<{} | void>[] = []
            files.map((file, index) => {
                if (file.endsWith(".md") ||
                    file.endsWith(".openpublishing.redirection.json") ||
                    file.endsWith("toc.yml")) {
                    promises.push(new Promise<any>((resolve, reject) => {
                        readFile(file, "utf8", (err, data) => {
                            // read through data and get images and includes,
                            // cross them with our list of images and includes
                            let match: any
                            while (match = INCLUDE_RE.exec(data)) {
                                unusedFiles = unusedFiles.filter(ff => {
                                    const ffPath = decodeURI((match[1] || match[2] || match[3] || match[4] || match[5] || match[6] || match[7]).toLowerCase())
                                    return !ffPath.includes(ff.label.toLowerCase())
                                })
                            }
                            unusedFiles

                            promises.push(new Promise<any>((resolve, reject) => {
                                percentComplete = showProgress(index, files, percentComplete, progress, message)
                                resolve()
                            }).catch(error => {
                                postError(error)
                            }))

                            resolve()
                        })
                    }).catch(error => {
                        postError(error)
                    }))
                }
            })

            Promise.all(promises).then(() => {
                // now copy the unused files over :)
                const unusedImagesDirectory = join(homedir(), "Docs Authoring", "unusedImages")

                if (!fs.existsSync(unusedImagesDirectory)) {
                    fs.mkdirSync(unusedImagesDirectory)
                }

                unusedFiles.forEach(async uf => {
                    fs.rename(join(uf.description, uf.label), join(unusedImagesDirectory, uf.label), err => {
                        output.appendLine(`failed to move ${uf.label}`)
                    })
                })

                progress.report({ increment: 100, message: "Cleanup: Removal of unused images and includes completed." })
                showStatusMessage("Cleanup: Removal of unused images and includes completed.")
                resolve()
            }).catch(error => {
                postError(error)
            })
        })
}

function getFiles(workspacePath: string, isArt = true) {
    const items: { label: any; description: any }[] = []
    const path = require("path")

    // recursively get all the files from the root folder
    const fileFilter = imageExtensions.concat(markdownExtensionFilter)
    recursive(workspacePath,
        [".git", ".github", ".vscode", ".vs", "node_module", "*.yml"],
        (err: any, files: string[]) => {
            if (err) {
                postError(err)
            }

            files.filter((file: any) => fileFilter.includes(path.extname(file.toLowerCase()))).forEach((file: any) => {
                if (!file.endsWith(".md") ||
                    file.indexOf("includes") != -1) {
                    items.push({ label: path.basename(file), description: path.dirname(file) })
                }
            })
        }
    )

    return items
}
