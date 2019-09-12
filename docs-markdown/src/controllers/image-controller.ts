
import { QuickPickItem, QuickPickOptions, window, workspace, Position, TextEditor, CompletionItem } from "vscode";
import { hasValidWorkSpaceRootPath, insertContentToEditor, isMarkdownFileCheck, isValidEditor, noActiveEditorMessage, postWarning, sendTelemetryData, setCursorPosition } from "../helper/common";

import { internalLinkBuilder } from "../helper/utility";
import Axios from "axios";

const path = require("path");
const dir = require("node-dir");
const os = require("os");
const fs = require("fs");
const telemetryCommandMedia: string = "insertMedia";
const telemetryCommandLink: string = "insertLink";
const imageExtensions = [".jpeg", ".jpg", ".png", ".gif", ".bmp"];
const markdownExtensionFilter = [".md"];
export const h1TextRegex = /\n {0,3}(#{1,6})(.*)/;
export const headingTextRegex = /^(#+)[\s](.*)[\r]?[\n]/gm;
export const yamlTextRegex = /^-{3}\s*\r?\n([\s\S]*?)-{3}\s*\r?\n([\s\S]*)/;

const telemetryCommand: string = "insertImage";
let commandOption: string;

export function insertImageCommand() {
    const commands = [
        { command: insertImage.name, callback: insertImage },
    ];
    return commands;
}
export function insertImage() {
    const opts: QuickPickOptions = { placeHolder: "Select an Image type" };
    const items: QuickPickItem[] = [];
    items.push({
        description: "",
        label: "Image",
    });
    items.push({
        description: "",
        label: "Icon image",
    });
    items.push({
        description: "",
        label: "Complex image",
    });
    items.push({
        description: "",
        label: "Add localization scope to image",
    });

    window.showQuickPick(items, opts).then((selection) => {
        if (!selection) {
            return;
        }
        switch (selection.label.toLowerCase()) {
            case "image":
                applyImage();
                commandOption = "image";
                break;
            case "icon image":
                applyIcon();
                commandOption = "icon";
                break;
            case "complex image":
                applyComplex();
                commandOption = "complex";
                break;
            case "add localization scope to image":
                applyLocScope();
                commandOption = "loc-scope";
                break;
        }
        sendTelemetryData(telemetryCommand, commandOption);
    });
}

async function applyImage() {
    // get editor, its needed to apply the output to editor window.
    const editor = window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }
    let image = "";
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    // if theres no selected text, add xref syntax as <xref:...>
    if (selectedText === "") {
        // Get images from repo as quickpick items
        // User should be given a list of quickpick items which list images from repo
        // const items: QuickPickItem[] = getFilesFromDirectory();
        const items: QuickPickItem[] = [];
        // allow user to select source items from quickpick
        const source = await window.showQuickPick(items, { placeHolder: "Select Image from repo" });
        if (!source) {
            // if user did not select source image then exit.
            return;
        } else {
            // Ask user input for alt text
            const altText: string | undefined = await window.showInputBox({ placeHolder: "Enter alt-text" });
            if (!altText) {
                // if user did not enter any alt text, then exit.
                return;
            } else {
                // output image content type
                image = `:::image type="content" source="${source}" alt-text="${altText}":::`;
                insertContentToEditor(editor, applyImage.name, image, true);
            }
        }
    } else {
        // If user has selected text, cancel operation?
        return;

    }
}
async function applyIcon() {
    // get editor to see if user has selected text
    const editor = window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }
    let image = "";
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    // if theres no selected text, add xref syntax as <xref:...>
    if (selectedText === "") {
        // Get images from repo as quickpick items
        // User should be given a list of quickpick items which list images from repo
        // const items: QuickPickItem[] = getFilesFromDirectory();
        const items: QuickPickItem[] = [];
        // allow user to select source items from quickpick
        const source = await window.showQuickPick(items, { placeHolder: "Select Image from repo" });
        if (!source) {
            return;
        } else {
            // output icon image type to editor window
            image = `:::image type="icon" source="${source}" :::`;
            insertContentToEditor(editor, applyImage.name, image, true);
        }
    } else {
        // if user has selected text then exit?
        return;
    }
    return;
}
async function applyComplex() {
    // get editor, its needed to apply the output to editor window.
    const editor = window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }
    let image = "";
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    if (selectedText === "") {
        // Get images from repo as quickpick items
        // User should be given a list of quickpick items which list images from repo
        // const items: QuickPickItem[] = getFilesFromDirectory();
        const items: QuickPickItem[] = [];
        // allow user to select source items from quickpick
        const source = await window.showQuickPick(items, { placeHolder: "Select Image from repo" });
        if (!source) {
            // if user did not select source image then exit.
            return;
        } else {
            // Ask user input for alt text
            const altText: string | undefined = await window.showInputBox({ placeHolder: "Enter alt-text" });
            if (!altText) {
                // if user did not enter any alt text, then exit.
                return;
            } else {
                // output image complex type
                image = `:::image type="complex" source="${source}" alt-text="${altText}":::

                :::image-end:::`;
                insertContentToEditor(editor, applyImage.name, image, true);
                // Set editor position to the middle of long description body
                setCursorPosition(editor, editor.selection.active.line + 1, editor.selection.active.character);
            }
        }
    } else {
        // If user has selected text, cancel operation?
        return;
    }
}
async function applyLocScope() {
    // get editor, its needed to apply the output to editor window.
    const editor = window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    if (selectedText === "") {
        // if user has not selected any text, then continue
        const RE_LOC_SCOPE = /:::image\s.+:::/g;
        const position = new Position(editor.selection.active.line, editor.selection.active.character);
        // get the current editor position and check if user is inside :::image::: tags
        const wordRange = editor.document.getWordRangeAtPosition(position, RE_LOC_SCOPE);
        if (wordRange) {
            // if user is inside :::image::: tag, then ask them for quickpick of products based on allow list
            const items: QuickPickItem[] = [];
            // call allowlist with API Auth Token
            // you will need auth token to call list
            const response = await Axios.get("https://docsmetadatatool.azurewebsites.net/allowlists")
            // get products from response
            const products = response.data.products;
            // push the response products into the list of quickpicks.
            products.map((item: { product: any }) => {
                items.push({
                    label: item.product,
                });
            });
            // show quickpick to user for products list.
            const product = await window.showQuickPick(items, { placeHolder: "Select from product list" });
            if (!product) {
                // if user did not select source image then exit.
                return;
            } else {
                // insert loc-sope into editor
                editor.edit((selected) => {
                    selected.insert(new Position(wordRange.end.line, wordRange.end.character - 3), ` loc-scope="${product}" `);
                });
            }
        }
    } else {
        // If user has selected text, cancel operation?
        return;
    }
    return;
}
export function getFilesShowQuickPick(isArt: any, altText: string) {
    const editor = window.activeTextEditor;
    if (!editor) {
        return;
    }
    const selection = editor.selection;
    const folderPath = workspace.rootPath;
    let selectedText = editor.document.getText(selection);

    const activeFileDir = path.dirname(editor.document.fileName);

    // recursively get all the files from the root folder
    dir.files(folderPath, (err: any, files: any) => {
        if (err) {
            window.showErrorMessage(err);
            throw err;
        }

        const items: QuickPickItem[] = [];
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
        const selectionPick = window.showQuickPick(items);
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
                    if (altText.length > 70) {
                        window.showWarningMessage("Alt text exceeds 70 characters!");
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

export function imageKeyWordHasBeenTyped(editor: any) {
    const RE_IMAGE = /image/g
    if (editor) {
        const position = new Position(editor.selection.active.line, editor.selection.active.character);
        const wordRange = editor.document.getWordRangeAtPosition(position, RE_IMAGE);
        if (wordRange) {
            return true;
        }
    }
}
export function imageCompletionProvider() {
    const completionItems: CompletionItem[] = [];
    completionItems.push(new CompletionItem(`:::image type="content" source="" alt-text="" loc-scope="":::`));
    completionItems.push(new CompletionItem(`:::image type="icon" source="" alt-text="" loc-scope="":::`));
    completionItems.push(new CompletionItem(`:::image type="complex" source="" alt-text="" loc-scope="":::`));
    return completionItems;
}

/**
 * Inserts a link or art.
 * @param {boolean} isArt - if true inserts art, if false inserts link.
 */
export function Insert(isArt: any) {

    let actionType: string = Insert.name;

    const editor = window.activeTextEditor;
    if (!editor) {
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
            window.showWarningMessage(activeFilePath +
                " is not saved.  Cannot accurately resolve path to create link.");
            return;
        }

        // Determine if there is selected text.  If selected text, no action.
        if (isArt && selectedText === "") {
            window.showInputBox({
                placeHolder: "Add alt text (up to 70 characters)",
            }).then((val) => {
                if (!val) {
                    getFilesShowQuickPick(isArt, "");
                    window.showInformationMessage("No alt entered or selected.  File name will be used.");
                } else if (val.length < 70) {
                    getFilesShowQuickPick(isArt, val);
                } else if (val.length > 70) {
                    window.showWarningMessage("Alt text exceeds 70 characters!");
                }
            });
        } else {
            getFilesShowQuickPick(isArt, selectedText);
        }
    }
}
