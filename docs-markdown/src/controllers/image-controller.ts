
import { CompletionItem, Position, QuickPickItem, QuickPickOptions, window, workspace } from "vscode";
import { hasValidWorkSpaceRootPath, insertContentToEditor, isMarkdownFileCheck, isValidEditor, noActiveEditorMessage, sendTelemetryData, setCursorPosition } from "../helper/common";

import Axios from "axios";

const path = require("path");
const dir = require("node-dir");
const telemetryCommandMedia: string = "insertMedia";
const telemetryCommandLink: string = "insertLink";
const imageExtensions = [".jpeg", ".jpg", ".png", ".gif", ".bmp", ".svg"];

const telemetryCommand: string = "insertImage";
let commandOption: string;

export function insertImageCommand() {
    const commands = [
        { command: insertImage.name, callback: insertImage },
        { command: applyImage.name, callback: applyImage },
        { command: applyIcon.name, callback: applyIcon },
        { command: applyComplex.name, callback: applyComplex },
        { command: applyLocScope.name, callback: applyLocScope },
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

export async function applyImage() {
    // get editor, its needed to apply the output to editor window.
    const editor = window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }
    let image = "";
    if (checkEditor(editor)) {
        // Get images from repo as quickpick items
        // User should be given a list of quickpick items which list images from repo
        const folderPath = workspace.rootPath;

        // recursively get all the files from the root folder
        dir.files(folderPath, async (err: any, files: any) => {
            if (err) {
                window.showErrorMessage(err);
            }

            const items: QuickPickItem[] = [];
            files.sort();

            files.filter((file: any) => imageExtensions.indexOf(path.extname(file.toLowerCase())) !== -1).forEach((file: any) => {
                items.push({ label: path.basename(file), description: path.dirname(file) });
            });

            // allow user to select source items from quickpick
            const source = await window.showQuickPick(items, { placeHolder: "Select Image from repo" });
            if (!source) {
                // if user did not select source image then exit.
                return;
            } else {
                const activeFileDir = path.dirname(editor.document.fileName);

                const sourcePath = path.relative(activeFileDir, path.join
                    (source.description, source.label).split("//").join("//"))
                    .replace(/\\/g, "/");

                // Ask user input for alt text
                const selection = editor.selection;
                const selectedText = editor.document.getText(selection);
                let altText: string | undefined = "";
                if (selectedText === "") {
                    // Ask user input for alt text
                    altText = await window.showInputBox({
                        placeHolder: "Add alt text (up to 70 characters)",
                        validateInput: (text: string) => text !== "" ? text.length <= 70 ? "" : "alt text should be less than 70 characters" : "alt-text input must not be empty"
                    });
                    if (!altText) {
                        // if user did not enter any alt text, then exit.
                        altText = "";
                    }
                } else {
                    altText = selectedText;
                }
                // output image content type
                image = `:::image type="content" source="${sourcePath}" alt-text="${altText}":::`;
                insertContentToEditor(editor, applyImage.name, image, true);
            }
        });
    }
}
function checkEditor(editor: any) {
    let actionType: string = "Get File for Image";

    // determines the name to set in the ValidEditor check
    actionType = "Art";
    commandOption = "art";
    sendTelemetryData(telemetryCommandMedia, commandOption);

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

    return true;
}
export async function applyIcon() {
    // get editor to see if user has selected text
    const editor = window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }
    let image = "";
    if (checkEditor(editor)) {
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        if (selectedText === "") {
            // Get images from repo as quickpick items
            // User should be given a list of quickpick items which list images from repo
            const folderPath = workspace.rootPath;

            // recursively get all the files from the root folder
            dir.files(folderPath, async (err: any, files: any) => {
                if (err) {
                    window.showErrorMessage(err);
                }

                const items: QuickPickItem[] = [];
                files.sort();

                files.filter((file: any) => imageExtensions.indexOf(path.extname(file.toLowerCase())) !== -1).forEach((file: any) => {
                    items.push({ label: path.basename(file), description: path.dirname(file) });
                });

                // allow user to select source items from quickpick
                const source = await window.showQuickPick(items, { placeHolder: "Select Image from repo" });
                if (!source) {
                    // if user did not select source image then exit.
                    return;
                } else {
                    const activeFileDir = path.dirname(editor.document.fileName);

                    const sourcePath = path.relative(activeFileDir, path.join
                        (source.description, source.label).split("//").join("//"))
                        .replace(/\\/g, "/");

                    // output image content type
                    image = `:::image type="icon" source="${sourcePath}":::`;
                    insertContentToEditor(editor, applyImage.name, image, true);
                }
            });
        }
    } else {
        // if user has selected text then exit?
        return;
    }
    return;
}
export async function applyComplex() {
    // get editor, its needed to apply the output to editor window.
    const editor = window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }
    let image = "";
    if (checkEditor(editor)) {
        // Get images from repo as quickpick items
        // User should be given a list of quickpick items which list images from repo
        const folderPath = workspace.rootPath;

        // recursively get all the files from the root folder
        dir.files(folderPath, async (err: any, files: any) => {
            if (err) {
                window.showErrorMessage(err);
            }

            const items: QuickPickItem[] = [];
            files.sort();

            files.filter((file: any) => imageExtensions.indexOf(path.extname(file.toLowerCase())) !== -1).forEach((file: any) => {
                items.push({ label: path.basename(file), description: path.dirname(file) });
            });

            // allow user to select source items from quickpick
            const source = await window.showQuickPick(items, { placeHolder: "Select Image from repo" });
            if (!source) {
                // if user did not select source image then exit.
                return;
            } else {
                const activeFileDir = path.dirname(editor.document.fileName);

                const sourcePath = path.relative(activeFileDir, path.join
                    (source.description, source.label).split("//").join("//"))
                    .replace(/\\/g, "/");

                const selection = editor.selection;
                const selectedText = editor.document.getText(selection);
                let altText: string | undefined = "";
                if (selectedText === "") {
                    // Ask user input for alt text
                    altText = await window.showInputBox({
                        placeHolder: "Add alt text (up to 70 characters)",
                        validateInput: (text: string) => text !== "" ? text.length <= 70 ? "" : "alt text should be less than 70 characters" : "alt-text input must not be empty"
                    });
                    if (!altText) {
                        // if user did not enter any alt text, then exit.
                        altText = "";
                    }
                } else {
                    altText = selectedText;
                }
                // output image content type
                // output image complex type
                image = `:::image type="complex" source="${sourcePath}" alt-text="${altText}":::

:::image-end:::`;
                insertContentToEditor(editor, applyImage.name, image, true);
                // Set editor position to the middle of long description body
                setCursorPosition(editor, editor.selection.active.line + 1, editor.selection.active.character);
            }
        });
    }
}
export async function applyLocScope() {
    // get editor, its needed to apply the output to editor window.
    const editor = window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }
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
        const response = await Axios.get("https://docs.microsoft.com/api/metadata/allowlists")
        // get products from response
        Object.keys(response.data)
            .filter((x) => x.startsWith("list:product"))
            .map((item: string) => {
                const set = item.split(":");
                if (set.length > 2) {
                    // push the response products into the list of quickpicks.
                    items.push({
                        label: set[2],
                    });
                }
            });
        // show quickpick to user for products list.
        const product = await window.showQuickPick(items, { placeHolder: "Select from product list" });
        if (!product) {
            // if user did not select source image then exit.
            return;
        } else {
            // insert loc-sope into editor
            editor.edit((selected) => {
                selected.insert(new Position(wordRange.end.line, wordRange.end.character - 3), ` loc-scope="${product.label}"`);
            });
        }
    }
    window.showErrorMessage("invalid cursor position. You must be inside :::image::: tags to use this command.")
    return;
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
