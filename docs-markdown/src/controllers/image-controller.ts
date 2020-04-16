
import Axios from "axios";
import { existsSync } from "fs";
import { basename, dirname, extname, join, relative } from "path";
import * as recursive from "recursive-readdir";
import { CompletionItem, Position, QuickPickItem, QuickPickOptions, window, workspace } from "vscode";
import { hasValidWorkSpaceRootPath, ignoreFiles, insertContentToEditor, isMarkdownFileCheck, isValidEditor, noActiveEditorMessage, setCursorPosition } from "../helper/common";
import { sendTelemetryData } from "../helper/telemetry";

const telemetryCommandMedia: string = "insertMedia";
const telemetryCommandLink: string = "insertLink";
const imageExtensions = [".jpeg", ".jpg", ".png", ".gif", ".bmp", ".svg"];

const telemetryCommand: string = "insertImage";
let commandOption: string;
const locScopeItems: QuickPickItem[] = [];

export function insertImageCommand() {
    const commands = [
        { command: pickImageType.name, callback: pickImageType },
        { command: applyImage.name, callback: applyImage },
        { command: applyIcon.name, callback: applyIcon },
        { command: applyComplex.name, callback: applyComplex },
        { command: applyLocScope.name, callback: applyLocScope },
        { command: applyLightbox.name, callback: applyLightbox },
    ];
    return commands;
}
export function pickImageType() {
    const opts: QuickPickOptions = { placeHolder: "Select an Image type" };
    const items: QuickPickItem[] = [];
    const config = workspace.getConfiguration("markdown");
    const alwaysIncludeLocScope = config.get<boolean>("alwaysIncludeLocScope");

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
    if (!alwaysIncludeLocScope) {
        items.push({
            description: "",
            label: "Add localization scope to image",
        });
    }
    items.push({
        description: "",
        label: "Add lightbox to image",
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
            case "image":
                applyImage();
                commandOption = "image (docs markdown)";
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
            case "add lightbox to image":
                applyLightbox();
                commandOption = "lightbox";
                break;
        }
        sendTelemetryData(telemetryCommand, commandOption);
    });
}

export async function applyImage() {
    // get editor, its needed to apply the output to editor window.
    const editor = window.activeTextEditor;
    let folderPath: string = "";

    if (!editor) {
        noActiveEditorMessage();
        return;
    }

    let image = "";
    if (checkEditor(editor)) {
        // Get images from repo as quickpick items
        // User should be given a list of quickpick items which list images from repo
        if (workspace.workspaceFolders) {
            folderPath = workspace.workspaceFolders[0].uri.fsPath;
        }

        // recursively get all the files from the root folder
        recursive(folderPath, ignoreFiles, async (err: any, files: any) => {
            if (err) {
                window.showErrorMessage(err);
            }

            const items: QuickPickItem[] = [];
            files.sort();

            files.filter((file: any) => imageExtensions.indexOf(extname(file.toLowerCase())) !== -1).forEach((file: any) => {
                items.push({ label: basename(file), description: dirname(file) });
            });

            // allow user to select source items from quickpick
            const source = await window.showQuickPick(items, { placeHolder: "Select Image from repo" });
            if (source && source.description) {

                const activeFileDir = dirname(editor.document.fileName);

                const sourcePath = relative(activeFileDir,
                    join(source.description, source.label).split("//").join("//"))
                    .replace(/\\/g, "/");

                // Ask user input for alt text
                const selection = editor.selection;
                const selectedText = editor.document.getText(selection);
                let altText: string | undefined = "";
                if (selectedText === "") {
                    // Ask user input for alt text
                    altText = await window.showInputBox({
                        placeHolder: "Add alt text (up to 250 characters)",
                        validateInput: (text: string) => text !== "" ? text.length <= 250 ? "" : "alt text should be less than 250 characters" : "alt-text input must not be empty",
                    });
                    if (!altText) {
                        // if user did not enter any alt text, then exit.
                        altText = "";
                    }
                } else {
                    altText = selectedText;
                }

                const config = workspace.getConfiguration("markdown");
                const alwaysIncludeLocScope = config.get<boolean>("alwaysIncludeLocScope");
                if (alwaysIncludeLocScope) {
                    const notCached = locScopeItems.length <= 0;
                    if (notCached) {
                        await getLocScopeProducts();
                    }
                    // show quickpick to user for products list.
                    const locScope = await window.showQuickPick(locScopeItems, { placeHolder: "Select from product list" });
                    if (locScope) {
                        image = `:::image type="content" source="${sourcePath}" alt-text="${altText}" loc-scope="${locScope.label}":::`;
                    }
                } else {
                    image = `:::image type="content" source="${sourcePath}" alt-text="${altText}":::`;
                }
                // output image content type
                insertContentToEditor(editor, applyImage.name, image, true);
            }
        });
    }
}

async function getLocScopeProducts() {
    // if user is inside :::image::: tag, then ask them for quickpick of products based on allow list
    // call allowlist with API Auth Token
    // you will need auth token to call list
    const response = await Axios.get("https://docs.microsoft.com/api/metadata/allowlists");
    // get products from response
    const products: string[] = [];
    Object.keys(response.data)
        .filter((x) => x.startsWith("list:product"))
        .map((item: string) => {
            const set = item.split(":");
            if (set.length > 2) {
                products.push(set[2]);
                Object.keys(response.data[item].values)
                    .map((prod: string) =>
                        // push the response products into the list of quickpicks.
                        products.push(prod),
                    );
            }
        });
    products.sort().map((item) => {
        locScopeItems.push({
            label: item,
        });
    });
    locScopeItems.push({
        label: "other",
    });
    locScopeItems.push({
        label: "third-party",
    });
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

    if (!existsSync(activeFileName)) {
        window.showWarningMessage(activeFilePath +
            " is not saved.  Cannot accurately resolve path to create link.");
        return;
    }

    return true;
}
export async function applyIcon() {
    // get editor to see if user has selected text
    const editor = window.activeTextEditor;
    let folderPath: string = "";

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
            if (workspace.workspaceFolders) {
                folderPath = workspace.workspaceFolders[0].uri.fsPath;
            }

            // recursively get all the files from the root folder
            recursive(folderPath, ignoreFiles, async (err: any, files: any) => {
                if (err) {
                    window.showErrorMessage(err);
                }

                const items: QuickPickItem[] = [];
                files.sort();

                files.filter((file: any) => imageExtensions.indexOf(extname(file.toLowerCase())) !== -1).forEach((file: any) => {
                    items.push({ label: basename(file), description: dirname(file) });
                });

                // allow user to select source items from quickpick
                const source = await window.showQuickPick(items, { placeHolder: "Select Image from repo" });
                if (source && source.description) {
                    const activeFileDir = dirname(editor.document.fileName);

                    const sourcePath = relative(activeFileDir,
                        join(source.description, source.label).split("//").join("//"))
                        .replace(/\\/g, "/");

                    // output image content type
                    image = `:::image type="icon" source="${sourcePath}" border="false":::`;
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
    let folderPath: string = "";

    if (!editor) {
        noActiveEditorMessage();
        return;
    }

    let image = "";
    if (checkEditor(editor)) {
        // Get images from repo as quickpick items
        // User should be given a list of quickpick items which list images from repo
        if (workspace.workspaceFolders) {
            folderPath = workspace.workspaceFolders[0].uri.fsPath;
        }

        // recursively get all the files from the root folder
        recursive(folderPath, ignoreFiles, async (err: any, files: any) => {
            if (err) {
                window.showErrorMessage(err);
            }

            const items: QuickPickItem[] = [];
            files.sort();

            files.filter((file: any) => imageExtensions.indexOf(extname(file.toLowerCase())) !== -1).forEach((file: any) => {
                items.push({ label: basename(file), description: dirname(file) });
            });

            // allow user to select source items from quickpick
            const source = await window.showQuickPick(items, { placeHolder: "Select Image from repo" });
            if (source && source.description) {
                const activeFileDir = dirname(editor.document.fileName);

                const sourcePath = relative(activeFileDir,
                    join(source.description, source.label).split("//").join("//"))
                    .replace(/\\/g, "/");

                const selection = editor.selection;
                const selectedText = editor.document.getText(selection);
                let altText: string | undefined = "";
                if (selectedText === "") {
                    // Ask user input for alt text
                    altText = await window.showInputBox({
                        placeHolder: "Add alt text (up to 250 characters)",
                        validateInput: (text: string) => text !== "" ? text.length <= 250 ? "" : "alt text should be less than 250 characters" : "alt-text input must not be empty",
                    });
                    if (!altText) {
                        // if user did not enter any alt text, then exit.
                        altText = "";
                    }
                } else {
                    altText = selectedText;
                }
                const config = workspace.getConfiguration("markdown");
                const alwaysIncludeLocScope = config.get<boolean>("alwaysIncludeLocScope");
                if (alwaysIncludeLocScope) {
                    const notCached = locScopeItems.length <= 0;
                    if (notCached) {
                        await getLocScopeProducts();
                    }
                    // show quickpick to user for products list.
                    const locScope = await window.showQuickPick(locScopeItems, { placeHolder: "Select from product list" });
                    if (locScope) {
                        image = `:::image type="complex" source="${sourcePath}" alt-text="${altText}" loc-scope="${locScope.label}":::

:::image-end:::`;
                    }
                } else {

                    // output image complex type
                    image = `:::image type="complex" source="${sourcePath}" alt-text="${altText}":::

:::image-end:::`;
                }

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
    const RE_LOC_SCOPE = /:::image\s+((source|type|alt-text|lightbox|border)="([a-zA-Z0-9_.\/ -]+)"\s*)+:::/gm;
    const position = new Position(editor.selection.active.line, editor.selection.active.character);
    // get the current editor position and check if user is inside :::image::: tags
    const wordRange = editor.document.getWordRangeAtPosition(position, RE_LOC_SCOPE);
    if (wordRange) {
        const start = RE_LOC_SCOPE.exec(editor.document.getText(wordRange));
        if (start) {
            const type = start[start.indexOf("type") + 1];
            if (type.toLowerCase() === "icon") {
                window.showErrorMessage("The loc-scope attribute should not be added to icons, which are not localized.");
                return;
            }
        }
        // if user is inside :::image::: tag, then ask them for quickpick of products based on allow list
        const notCached = locScopeItems.length <= 0;
        if (notCached) {
            await getLocScopeProducts();
        }
        // show quickpick to user for products list.
        const product = await window.showQuickPick(locScopeItems, { placeHolder: "Select from product list" });
        if (!product) {
            // if user did not select source image then exit.
            return;
        } else {
            // insert loc-sope into editor
            editor.edit((selected) => {
                selected.insert(new Position(wordRange.end.line, wordRange.end.character - 3), ` loc-scope="${product.label}"`);
            });
        }
    } else {
        const RE_LOC_SCOPE_EXISTS = /:::image\s+((source|type|alt-text|lightbox|border|loc-scope)="([a-zA-Z0-9_.\/ -]+)"\s*)+:::/gm;
        const locScopeAlreadyExists = editor.document.getWordRangeAtPosition(position, RE_LOC_SCOPE_EXISTS);
        if (locScopeAlreadyExists) {
            window.showErrorMessage("loc-scope attribute already exists on :::image::: tag.");
            return;
        }

        window.showErrorMessage("invalid cursor position. You must be inside :::image::: tags.");
    }
    return;
}

export async function applyLightbox() {
    // get editor, its needed to apply the output to editor window.
    const editor = window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }

    // if user has not selected any text, then continue
    const RE_LIGHTBOX = /:::image\s+((source|type|alt-text|loc-scope|border)="([a-zA-Z0-9_.\/ -]+)"\s*)+:::/gm;
    const position = new Position(editor.selection.active.line, editor.selection.active.character);
    // get the current editor position and check if user is inside :::image::: tags
    const wordRange = editor.document.getWordRangeAtPosition(position, RE_LIGHTBOX);
    if (wordRange) {
        let folderPath = "";
        if (workspace.workspaceFolders) {
            folderPath = workspace.workspaceFolders[0].uri.fsPath;
        }
        // get available files
        recursive(folderPath, ignoreFiles, async (err: any, files: any) => {
            if (err) {
                window.showErrorMessage(err);
            }

            const items: QuickPickItem[] = [];
            files.sort();

            files.filter((file: any) => imageExtensions.indexOf(extname(file.toLowerCase())) !== -1).forEach((file: any) => {
                items.push({ label: basename(file), description: dirname(file) });
            });

            // show quickpick to user available images.
            const image = await window.showQuickPick(items, { placeHolder: "Select Image from repo" });
            if (image && image.description) {
                // insert lightbox into editor
                const activeFileDir = dirname(editor.document.fileName);

                const imagePath = relative(activeFileDir,
                    join(image.description, image.label).split("//").join("//"))
                    .replace(/\\/g, "/");

                editor.edit((selected) => {
                    selected.insert(new Position(wordRange.end.line, wordRange.end.character - 3), ` lightbox="${imagePath}"`);
                });
            }
        });
    } else {
        const RE_LIGHTBOX_EXISTS = /:::image\s+((source|type|alt-text|lightbox|border|loc-scope)="([a-zA-Z0-9_.\/ -]+)"\s*)+:::/gm;
        const lightboxAlreadyExists = editor.document.getWordRangeAtPosition(position, RE_LIGHTBOX_EXISTS);
        if (lightboxAlreadyExists) {
            window.showErrorMessage("lightbox attribute already exists on :::image::: tag.");
            return;
        }

        window.showErrorMessage("invalid cursor position. You must be inside :::image::: tags.");
    }
    return;
}

export function imageKeyWordHasBeenTyped(editor: any) {
    const RE_IMAGE = /image/g;
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
