"use strict";

import * as vscode from "vscode";
import { insertBookmarkExternal, insertBookmarkInternal } from "../controllers/bookmark-controller";
import { hasValidWorkSpaceRootPath, insertContentToEditor, isMarkdownFileCheck, isValidEditor, noActiveEditorMessage, postWarning, sendTelemetryData, setCursorPosition } from "../helper/common";
import { externalLinkBuilder, internalLinkBuilder, videoLinkBuilder } from "../helper/utility";

const telemetryCommandMedia: string = "insertMedia";
const telemetryCommandLink: string = "insertLink";
let commandOption: string;

export function insertLinksAndMediaCommands() {
    const commands = [
        { command: insertVideo.name, callback: insertVideo },
        { command: insertURL.name, callback: insertURL },
        { command: insertLink.name, callback: insertLink },
        // { command: insertImage.name, callback: insertImage },
        { command: selectLinkType.name, callback: selectLinkType },
        { command: selectLinkTypeToolbar.name, callback: selectLinkTypeToolbar },
        { command: selectMediaType.name, callback: selectMediaType },
    ];
    return commands;
}

const imageExtensions = [".jpeg", ".jpg", ".png", ".gif", ".bmp"];
const markdownExtensionFilter = [".md"];

export const h1TextRegex = /\n {0,3}(#{1,6})(.*)/;
export const headingTextRegex = /^(#+)[\s](.*)[\r]?[\n]/gm;
export const yamlTextRegex = /^-{3}\s*\r?\n([\s\S]*?)-{3}\s*\r?\n([\s\S]*)/;

export function insertVideo() {
    commandOption = "video";
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    } else {
        vscode.window.showInputBox({
            placeHolder: "Enter URL; https://channel9.msdn.com or https://www.youtube.com is a required prefix for video URLs",
            validateInput: (urlInput) => urlInput.startsWith("https://channel9.msdn.com") && urlInput.split("?")[0].endsWith("player") ||
                urlInput.startsWith("https://www.youtube.com/embed") ? "" :
                "https://channel9.msdn.com or https://www.youtube.com/embed are required prefixes for video URLs. Link will not be added if prefix is not present.",
        }).then((val) => {
            // If the user adds a link that doesn't include the http(s) protocol, show a warning and don't add the link.
            if (val === undefined) {
                postWarning("Incorrect link syntax. For YouTube videos, use the embed syntax, https://www.youtube.com/embed/<videoID>. For Channel9videos, use the player syntax, https://channel9.msdn.com/<videoID>/player");
                return;
            }
            const contentToInsert = videoLinkBuilder(val);
            insertContentToEditor(editor, insertVideo.name, contentToInsert);
        });
    }
    sendTelemetryData(telemetryCommandMedia, commandOption);
}

/**
 * Creates an external URL with the current selection.
 */
export function insertURL() {
    commandOption = "external";
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    const options: vscode.InputBoxOptions = {
        placeHolder: "Enter URL",
        validateInput: (urlInput) => urlInput.startsWith("http://") || urlInput.startsWith("https://") ? "" :
            "http:// or https:// is required for URLs. Link will not be added if prefix is not present.",
    };

    vscode.window.showInputBox(options).then((val) => {
        // If the user adds a link that doesn't include the http(s) protocol, show a warning and don't add the link.
        if (val === undefined) {
            postWarning("Incorrect link syntax. Abandoning command.");
        } else {
            let contentToInsert;
            if (selection.isEmpty) {
                contentToInsert = externalLinkBuilder(val);
                insertContentToEditor(editor, insertURL.name, contentToInsert);
            } else {
                contentToInsert = externalLinkBuilder(val, selectedText);
                insertContentToEditor(editor, insertURL.name, contentToInsert, true);
            }
            setCursorPosition(editor, selection.start.line, selection.start.character + contentToInsert.length);
        }
    });
    sendTelemetryData(telemetryCommandLink, commandOption);
}

/**
 * Inserts a link
 */
export function insertLink() {
    Insert(false);
}

/**
 * Triggers the insert function and passes in the true value to signify it is an art insert.
 */
export function insertImage() {
    Insert(true);
}

export function getFilesShowQuickPick(isArt: any, altText: string) {
    const path = require("path");
    const dir = require("node-dir");
    const os = require("os");
    const fs = require("fs");

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }
    const selection = editor.selection;
    const folderPath = vscode.workspace.rootPath;
    let selectedText = editor.document.getText(selection);

    const activeFileDir = path.dirname(editor.document.fileName);

    // recursively get all the files from the root folder
    dir.files(folderPath, (err: any, files: any) => {
        if (err) {
            vscode.window.showErrorMessage(err);
            throw err;
        }

        const items: vscode.QuickPickItem[] = [];
        files.sort();

        if (isArt) {

            files.filter((file: any) => imageExtensions.indexOf(path.extname(file.toLowerCase())) !== -1).forEach((file: any) => {
                items.push({ label: path.basename(file), description: path.dirname(file) });

            });
        } else {
            files.filter((file: any) => markdownExtensionFilter.indexOf(path.extname(file.toLowerCase()))
                !== -1).forEach((file: any) => {
                    items.push({ label: path.basename(file), description: path.dirname(file) });
                });
        }

        // show the quick pick menu
        const selectionPick = vscode.window.showQuickPick(items);
        selectionPick.then((qpSelection) => {
            if (!qpSelection) {
                return;
            } else {
                let result: any;
                const altTextFileName = qpSelection.label;
                // Gets the H1 content as default name if unselected text. Will filter undefinition H1, non-MD file.
                if (!isArt && selectedText === "") {
                    // gets the content for chosen file with utf-8 format
                    const fullPath = path.join(qpSelection.description, qpSelection.label);
                    let content = fs.readFileSync(fullPath, "utf8");
                    // Separation yaml.
                    const yamlMatch = content.match(yamlTextRegex);
                    if (yamlMatch != null) {
                        content = yamlMatch[2];
                    }
                    content = "\n" + content;
                    const match = content.match(h1TextRegex);
                    if (match != null) {
                        selectedText = match[2].trim();
                    }
                }

                // Construct and write out links
                if (isArt && altText) {
                    if (altText.length > 250) {
                        vscode.window.showWarningMessage("Alt text exceeds 250 characters!");
                    } else {
                        result = internalLinkBuilder(isArt, path.relative(activeFileDir, path.join
                            (qpSelection.description, qpSelection.label).split("\\").join("\\\\")), altText);
                    }

                } else if (isArt && altText === "") {
                    result = internalLinkBuilder(isArt, path.relative(activeFileDir, path.join
                        (qpSelection.description, qpSelection.label).split("\\").join("\\\\")), altTextFileName);
                } else if (!isArt) {
                    result = internalLinkBuilder(isArt, path.relative(activeFileDir, path.join
                        (qpSelection.description, qpSelection.label).split("\\").join("\\\\")), selectedText);
                }

                if (os.type() === "Darwin") {
                    result = internalLinkBuilder(isArt, path.relative(activeFileDir, path.join
                        (qpSelection.description, qpSelection.label).split("//").join("//")), selectedText);
                }

                // Insert content into topic
                insertContentToEditor(editor, Insert.name, result, true);
                if (!isArt) {
                    setCursorPosition(editor, selection.start.line, selection.start.character + result.length);
                }
            }
        });
    });
}

/**
 * Inserts a link or art.
 * @param {boolean} isArt - if true inserts art, if false inserts link.
 */
export function Insert(isArt: any) {

    let actionType: string = Insert.name;

    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    } else {
        const selectedText = editor.document.getText(editor.selection);

        // determines the name to set in the ValidEditor check
        if (isArt) {
            actionType = "Art";
            commandOption = "art";
            sendTelemetryData(telemetryCommandMedia, commandOption);
        } else {
            actionType = "Link";
            commandOption = "internal";
            sendTelemetryData(telemetryCommandLink, commandOption);
        }

        // checks for valid environment
        if (!isValidEditor(editor, false, actionType)) {
            return;
        }

        if (!isMarkdownFileCheck(editor, false)) {
            return;
        }

        if (!hasValidWorkSpaceRootPath(telemetryCommandLink)) {
            return;
        }

        // The active file should be used as the origin for relative links.
        // The path is split so the file type is not included when resolving the path.
        const activeFileName = editor.document.fileName;
        const pathDelimited = editor.document.fileName.split(".");
        const activeFilePath = pathDelimited[0];

        // Check to see if the active file has been saved.  If it has not been saved, warn the user.
        // The user will still be allowed to add a link but it the relative path will not be resolved.
        const fileExists = require("file-exists");

        if (!fileExists(activeFileName)) {
            vscode.window.showWarningMessage(activeFilePath +
                " is not saved.  Cannot accurately resolve path to create link.");
            return;
        }

        // Determine if there is selected text.  If selected text, no action.
        if (isArt && selectedText === "") {
            vscode.window.showInputBox({
                placeHolder: "Add alt text (up to 250 characters)",
            }).then((val) => {
                if (!val) {
                    getFilesShowQuickPick(isArt, "");
                    vscode.window.showInformationMessage("No alt entered or selected.  File name will be used.");
                } else if (val.length < 70) {
                    getFilesShowQuickPick(isArt, val);
                } else if (val.length > 70) {
                    vscode.window.showWarningMessage("Alt text exceeds 250 characters!");
                }
            });
        } else {
            getFilesShowQuickPick(isArt, selectedText);
        }
    }
}

/**
 * Creates an entry point for creating an internal (link type) or external link (url type).
 */
export function selectLinkType() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    } else {
        if (!isValidEditor(editor, false, "insert link")) {
            return;
        }

        if (!isMarkdownFileCheck(editor, false)) {
            return;
        }

        const linkTypes = ["Heading in this file", "Heading in another file"];
        vscode.window.showQuickPick(linkTypes).then((qpSelection) => {
            if (qpSelection === linkTypes[0]) {
                insertBookmarkInternal();
            } else if (qpSelection === linkTypes[1]) {
                insertBookmarkExternal();
            }
        });
    }
}

/**
 * Creates an entry point for creating an internal (link type) or external link (url type).
 */
export function selectLinkTypeToolbar(toolbar?: boolean) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }

    if (!isValidEditor(editor, false, "insert link")) {
        return;
    }

    if (!isMarkdownFileCheck(editor, false)) {
        return;
    }

    const linkTypes = ["External", "Internal", "Bookmark in this file", "Bookmark in another file"];
    vscode.window.showQuickPick(linkTypes).then((qpSelection) => {
        if (qpSelection === linkTypes[0]) {
            insertURL();
        } else if (qpSelection === linkTypes[1]) {
            Insert(false);
        } else if (qpSelection === linkTypes[2]) {
            insertBookmarkInternal();
        } else if (qpSelection === linkTypes[3]) {
            insertBookmarkExternal();
        }
    });
}

/**
 * Creates an entry point for creating an internal (link type) or external link (url type).
 */
export function selectMediaType() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    } else {
        if (!isValidEditor(editor, false, "insert media")) {
            return;
        }

        if (!isMarkdownFileCheck(editor, false)) {
            return;
        }

        const mediaTypes = ["Image", "Video"];
        vscode.window.showQuickPick(mediaTypes).then((qpSelection) => {
            if (qpSelection === mediaTypes[0]) {
                Insert(true);
            } else if (qpSelection === mediaTypes[1]) {
                insertVideo();
            }
        });
    }
}
