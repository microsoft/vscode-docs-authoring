import { window, workspace } from "vscode";
import { join } from "path";
import { existsSync, readFile } from "fs";
import { pathToFileURL } from "url";
export const validateModuleName = "Please provide metadata tag names";
const recursive = require("recursive-readdir");
var glob = require("glob");
let fileSet: any = [];
export async function extractMetadata() {
    let tagInput = await window.showInputBox({
        prompt: "Extract Metadata by typing comma separated tag names (ms.author, author, ms.technology etc..) or leave blank to extract all",
        validateInput: (userInput) => {
            return ""
        },
    });
    let directoryInput = await window.showInputBox({
        prompt: "Enter a directory to extract from, or leave blank to extract from docset root",
        validateInput: (userInput) => {
            return ""
        },
    })
    const rootDir = tryGetRootDir();
    if (rootDir) {

        let directory = handleDirectoryInput(rootDir, directoryInput);
        if (directory) {
            GetMetadataFiles(rootDir, directory, getFiles)
                .then(() => {
                    const tags = handleMetadataTagInput(tagInput)
                    let metadata = extractMetadataFromFiles([...new Set([].concat(...fileSet))], tags)
                }).catch((error: string) => {
                    console.log(error);
                });
        }
    } else {
        window.showErrorMessage("Unable to find the root directory.")
    }

}

export class Metadata {
    public file: string;
    public tag: string;
    public action: string;
    public value: string;
    public format: string;
    constructor(file: string, tag: string, action: string, value: string, format: string) {
        this.file = file;
        this.tag = tag;
        this.action = action;
        this.value = value;
        this.format = format;
    }
}

function extractMetadataFromFiles(files: string[] | undefined, tags: string[]) {
    if (files) {
        const promises: Array<Promise<{} | void>> = [];
        files.map(file => {
            if (file.endsWith(".yml")) {
                promises.push(new Promise((reject, resolve) => {
                    readFile(file, "utf-8", (err, data) => {
                        if (err) {
                            console.log(err);
                            reject()
                        }

                        resolve(data);
                    })
                }))
            } else if (file.endsWith(".md")) {
                promises.push(new Promise((reject, resolve) => {
                    readFile(file, "utf-8", (err, data) => {
                        if (err) {
                            console.log(err);
                            reject()
                        }

                        resolve(data);
                    })
                }))
            }

        })

        Promise.all(promises)
    }
}

function handleMetadataTagInput(tagInput: string | undefined): string[] {
    if (tagInput) {
        return tagInput.split(",").map(tag => {
            return tag.trim()
        })
    } else {
        return ["*"];
    }
}

async function getFiles(directory: string | undefined, resolveCb: any, includedFiles?: string[][] | undefined) {
    if (directory) {
        let promises: Promise<{} | void>[] = [];
        if (includedFiles) {
            if (includedFiles.length > 0) {
                includedFiles.map(filePatterns => {
                    filePatterns.map(pattern => {
                        promises.push(new Promise((reject, resolve) => {
                            glob(pattern, { cwd: directory }, (err: any, files: string[]) => {
                                if (err) {
                                    console.log(err);
                                    reject();
                                }
                                fileSet.push(files);
                                resolve();
                            })
                        }).catch(err => {
                            console.log(err);
                        }))
                    })
                })
            }
        }
        else {
            promises.push(new Promise((reject, resolve) => {
                recursive(directory,
                    [".git", ".github", ".vscode", ".vs", "node_module"],
                    (err: any, files: string[]) => {
                        if (err) {
                            console.log(err);
                            reject()
                        }
                        fileSet.push(files);
                        resolve()
                    })
            }).catch(err => {
                console.log(err);
            }))

        }
        return Promise.all(promises)

    }
}

function GetMetadataFiles(rootDir: string, directory: string, cb: any) {
    const docfxFile = join(rootDir, "docfx.json");
    if (existsSync(docfxFile)) {
        readFile(docfxFile, 'utf8', (err, data) => {
            if (err) {
                console.log(err);
            }
            let docfx = JSON.parse(data);
            if (docfx.build) {
                if (docfx.build.content.length > 0) {
                    let fileTypes = docfx.build.content.map((item: { files: any; }) => {
                        if (item.files.length > 0) {
                            return item.files.map((fileType: any) => {
                                return fileType;
                            })
                        }
                    })

                    return cb(directory, fileTypes)
                }
            }
        })
    } else {
        console.log("docfx file does not exist.")
        return cb(directory)
    }
}


function handleDirectoryInput(rootDir: string, directoryInput: string | undefined) {
    if (!directoryInput) {
        return rootDir
    } else {
        if (!existsSync(directoryInput)) {
            console.log("Directory does not exist.")
            return;
        } else {
            console.log(directoryInput)
            return directoryInput;
        }
    }
}

function tryGetRootDir() {
    const editor = window.activeTextEditor;
    if (editor) {
        const folder = workspace.getWorkspaceFolder(editor.document.uri);
        if (folder) {
            const workspacePath = folder.uri.fsPath;

            if (workspacePath == null) {
                console.log("No workspace is opened.");
                return null;
            } else {
                return workspacePath
            }
        }
    }

    return null;
}
