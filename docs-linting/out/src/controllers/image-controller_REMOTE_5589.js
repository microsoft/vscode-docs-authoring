"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const common_1 = require("../helper/common");
const axios_1 = require("axios");
const path = require("path");
const dir = require("node-dir");
const telemetryCommandMedia = "insertMedia";
const telemetryCommandLink = "insertLink";
const imageExtensions = [".jpeg", ".jpg", ".png", ".gif", ".bmp", ".svg"];
const telemetryCommand = "insertImage";
let commandOption;
function insertImageCommand() {
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
exports.insertImageCommand = insertImageCommand;
function pickImageType() {
    const opts = { placeHolder: "Select an Image type" };
    const items = [];
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
    items.push({
        description: "",
        label: "Add lightbox to image",
    });
    vscode_1.window.showQuickPick(items, opts).then((selection) => {
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
            case "add lightbox to image":
                applyLightbox();
                commandOption = "lightbox";
                break;
        }
        common_1.sendTelemetryData(telemetryCommand, commandOption);
    });
}
exports.pickImageType = pickImageType;
function applyImage() {
    return __awaiter(this, void 0, void 0, function* () {
        // get editor, its needed to apply the output to editor window.
        const editor = vscode_1.window.activeTextEditor;
        let folderPath = "";
        if (!editor) {
            common_1.noActiveEditorMessage();
            return;
        }
        let image = "";
        if (checkEditor(editor)) {
            // Get images from repo as quickpick items
            // User should be given a list of quickpick items which list images from repo
            if (vscode_1.workspace.workspaceFolders) {
                folderPath = vscode_1.workspace.workspaceFolders[0].uri.fsPath;
            }
            // recursively get all the files from the root folder
            dir.files(folderPath, (err, files) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    vscode_1.window.showErrorMessage(err);
                }
                const items = [];
                files.sort();
                files.filter((file) => imageExtensions.indexOf(path.extname(file.toLowerCase())) !== -1).forEach((file) => {
                    items.push({ label: path.basename(file), description: path.dirname(file) });
                });
                // allow user to select source items from quickpick
                const source = yield vscode_1.window.showQuickPick(items, { placeHolder: "Select Image from repo" });
                if (!source) {
                    // if user did not select source image then exit.
                    return;
                }
                else {
                    const activeFileDir = path.dirname(editor.document.fileName);
                    const sourcePath = path.relative(activeFileDir, path.join(source.description, source.label).split("//").join("//"))
                        .replace(/\\/g, "/");
                    // Ask user input for alt text
                    const selection = editor.selection;
                    const selectedText = editor.document.getText(selection);
                    let altText = "";
                    if (selectedText === "") {
                        // Ask user input for alt text
                        altText = yield vscode_1.window.showInputBox({
                            placeHolder: "Add alt text (up to 250 characters)",
                            validateInput: (text) => text !== "" ? text.length <= 250 ? "" : "alt text should be less than 250 characters" : "alt-text input must not be empty"
                        });
                        if (!altText) {
                            // if user did not enter any alt text, then exit.
                            altText = "";
                        }
                    }
                    else {
                        altText = selectedText;
                    }
                    // output image content type
                    image = `:::image type="content" source="${sourcePath}" alt-text="${altText}":::`;
                    common_1.insertContentToEditor(editor, applyImage.name, image, true);
                }
            }));
        }
    });
}
exports.applyImage = applyImage;
function checkEditor(editor) {
    let actionType = "Get File for Image";
    // determines the name to set in the ValidEditor check
    actionType = "Art";
    commandOption = "art";
    common_1.sendTelemetryData(telemetryCommandMedia, commandOption);
    // checks for valid environment
    if (!common_1.isValidEditor(editor, false, actionType)) {
        return;
    }
    if (!common_1.isMarkdownFileCheck(editor, false)) {
        return;
    }
    if (!common_1.hasValidWorkSpaceRootPath(telemetryCommandLink)) {
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
        vscode_1.window.showWarningMessage(activeFilePath +
            " is not saved.  Cannot accurately resolve path to create link.");
        return;
    }
    return true;
}
function applyIcon() {
    return __awaiter(this, void 0, void 0, function* () {
        // get editor to see if user has selected text
        const editor = vscode_1.window.activeTextEditor;
        let folderPath = "";
        if (!editor) {
            common_1.noActiveEditorMessage();
            return;
        }
        let image = "";
        if (checkEditor(editor)) {
            const selection = editor.selection;
            const selectedText = editor.document.getText(selection);
            if (selectedText === "") {
                // Get images from repo as quickpick items
                // User should be given a list of quickpick items which list images from repo
                if (vscode_1.workspace.workspaceFolders) {
                    folderPath = vscode_1.workspace.workspaceFolders[0].uri.fsPath;
                }
                // recursively get all the files from the root folder
                dir.files(folderPath, (err, files) => __awaiter(this, void 0, void 0, function* () {
                    if (err) {
                        vscode_1.window.showErrorMessage(err);
                    }
                    const items = [];
                    files.sort();
                    files.filter((file) => imageExtensions.indexOf(path.extname(file.toLowerCase())) !== -1).forEach((file) => {
                        items.push({ label: path.basename(file), description: path.dirname(file) });
                    });
                    // allow user to select source items from quickpick
                    const source = yield vscode_1.window.showQuickPick(items, { placeHolder: "Select Image from repo" });
                    if (!source) {
                        // if user did not select source image then exit.
                        return;
                    }
                    else {
                        const activeFileDir = path.dirname(editor.document.fileName);
                        const sourcePath = path.relative(activeFileDir, path.join(source.description, source.label).split("//").join("//"))
                            .replace(/\\/g, "/");
                        // output image content type
                        image = `:::image type="icon" source="${sourcePath}":::`;
                        common_1.insertContentToEditor(editor, applyImage.name, image, true);
                    }
                }));
            }
        }
        else {
            // if user has selected text then exit?
            return;
        }
        return;
    });
}
exports.applyIcon = applyIcon;
function applyComplex() {
    return __awaiter(this, void 0, void 0, function* () {
        // get editor, its needed to apply the output to editor window.
        const editor = vscode_1.window.activeTextEditor;
        let folderPath = "";
        if (!editor) {
            common_1.noActiveEditorMessage();
            return;
        }
        let image = "";
        if (checkEditor(editor)) {
            // Get images from repo as quickpick items
            // User should be given a list of quickpick items which list images from repo
            if (vscode_1.workspace.workspaceFolders) {
                folderPath = vscode_1.workspace.workspaceFolders[0].uri.fsPath;
            }
            // recursively get all the files from the root folder
            dir.files(folderPath, (err, files) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    vscode_1.window.showErrorMessage(err);
                }
                const items = [];
                files.sort();
                files.filter((file) => imageExtensions.indexOf(path.extname(file.toLowerCase())) !== -1).forEach((file) => {
                    items.push({ label: path.basename(file), description: path.dirname(file) });
                });
                // allow user to select source items from quickpick
                const source = yield vscode_1.window.showQuickPick(items, { placeHolder: "Select Image from repo" });
                if (!source) {
                    // if user did not select source image then exit.
                    return;
                }
                else {
                    const activeFileDir = path.dirname(editor.document.fileName);
                    const sourcePath = path.relative(activeFileDir, path.join(source.description, source.label).split("//").join("//"))
                        .replace(/\\/g, "/");
                    const selection = editor.selection;
                    const selectedText = editor.document.getText(selection);
                    let altText = "";
                    if (selectedText === "") {
                        // Ask user input for alt text
                        altText = yield vscode_1.window.showInputBox({
                            placeHolder: "Add alt text (up to 250 characters)",
                            validateInput: (text) => text !== "" ? text.length <= 250 ? "" : "alt text should be less than 250 characters" : "alt-text input must not be empty"
                        });
                        if (!altText) {
                            // if user did not enter any alt text, then exit.
                            altText = "";
                        }
                    }
                    else {
                        altText = selectedText;
                    }
                    // output image content type
                    // output image complex type
                    image = `:::image type="complex" source="${sourcePath}" alt-text="${altText}":::

:::image-end:::`;
                    common_1.insertContentToEditor(editor, applyImage.name, image, true);
                    // Set editor position to the middle of long description body
                    common_1.setCursorPosition(editor, editor.selection.active.line + 1, editor.selection.active.character);
                }
            }));
        }
    });
}
exports.applyComplex = applyComplex;
const items = [];
function applyLocScope() {
    return __awaiter(this, void 0, void 0, function* () {
        // get editor, its needed to apply the output to editor window.
        const editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            common_1.noActiveEditorMessage();
            return;
        }
        // if user has not selected any text, then continue
        const RE_LOC_SCOPE = /:::image\s+((source|type|alt-text|lightbox|border)="([a-zA-Z0-9_.\/ -]+)"\s*)+:::/gm;
        const position = new vscode_1.Position(editor.selection.active.line, editor.selection.active.character);
        // get the current editor position and check if user is inside :::image::: tags
        const wordRange = editor.document.getWordRangeAtPosition(position, RE_LOC_SCOPE);
        if (wordRange) {
            const start = RE_LOC_SCOPE.exec(editor.document.getText(wordRange));
            if (start) {
                const type = start[start.indexOf("type") + 1];
                if (type.toLowerCase() === "icon") {
                    vscode_1.window.showErrorMessage("The loc-scope attribute should not be added to icons, which are not localized.");
                    return;
                }
            }
            // if user is inside :::image::: tag, then ask them for quickpick of products based on allow list
            const cached = items.length <= 0;
            if (cached) {
                // call allowlist with API Auth Token
                // you will need auth token to call list
                const response = yield axios_1.default.get("https://docs.microsoft.com/api/metadata/allowlists");
                // get products from response
                let products = [];
                Object.keys(response.data)
                    .filter((x) => x.startsWith("list:product"))
                    .map((item) => {
                    const set = item.split(":");
                    if (set.length > 2) {
                        products.push(set[2]);
                        Object.keys(response.data[item].values)
                            .map((prod) => 
                        // push the response products into the list of quickpicks.
                        products.push(prod));
                    }
                });
                products.sort().map((item) => {
                    items.push({
                        label: item
                    });
                });
                items.push({
                    label: "other"
                });
                items.push({
                    label: "third-party"
                });
            }
            // show quickpick to user for products list.
            const product = yield vscode_1.window.showQuickPick(items, { placeHolder: "Select from product list" });
            if (!product) {
                // if user did not select source image then exit.
                return;
            }
            else {
                // insert loc-sope into editor
                editor.edit((selected) => {
                    selected.insert(new vscode_1.Position(wordRange.end.line, wordRange.end.character - 3), ` loc-scope="${product.label}"`);
                });
            }
        }
        else {
            const RE_LOC_SCOPE_EXISTS = /:::image\s+((source|type|alt-text|lightbox|border|loc-scope)="([a-zA-Z0-9_.\/ -]+)"\s*)+:::/gm;
            const locScopeAlreadyExists = editor.document.getWordRangeAtPosition(position, RE_LOC_SCOPE_EXISTS);
            if (locScopeAlreadyExists) {
                vscode_1.window.showErrorMessage("loc-scope attribute already exists on :::image::: tag.");
                return;
            }
            vscode_1.window.showErrorMessage("invalid cursor position. You must be inside :::image::: tags.");
        }
        return;
    });
}
exports.applyLocScope = applyLocScope;
function applyLightbox() {
    return __awaiter(this, void 0, void 0, function* () {
        // get editor, its needed to apply the output to editor window.
        const editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            common_1.noActiveEditorMessage();
            return;
        }
        // if user has not selected any text, then continue
        const RE_LIGHTBOX = /:::image\s+((source|type|alt-text|loc-scope|border)="([a-zA-Z0-9_.\/ -]+)"\s*)+:::/gm;
        const position = new vscode_1.Position(editor.selection.active.line, editor.selection.active.character);
        // get the current editor position and check if user is inside :::image::: tags
        const wordRange = editor.document.getWordRangeAtPosition(position, RE_LIGHTBOX);
        if (wordRange) {
            let folderPath = "";
            if (vscode_1.workspace.workspaceFolders) {
                folderPath = vscode_1.workspace.workspaceFolders[0].uri.fsPath;
            }
            //get available files
            dir.files(folderPath, (err, files) => __awaiter(this, void 0, void 0, function* () {
                if (err) {
                    vscode_1.window.showErrorMessage(err);
                }
                const items = [];
                files.sort();
                files.filter((file) => imageExtensions.indexOf(path.extname(file.toLowerCase())) !== -1).forEach((file) => {
                    items.push({ label: path.basename(file), description: path.dirname(file) });
                });
                // show quickpick to user available images.
                const image = yield vscode_1.window.showQuickPick(items, { placeHolder: "Select Image from repo" });
                if (!image) {
                    // if user did not select source image then exit.
                    return;
                }
                else {
                    // insert lightbox into editor
                    const activeFileDir = path.dirname(editor.document.fileName);
                    const imagePath = path.relative(activeFileDir, path.join(image.description, image.label).split("//").join("//"))
                        .replace(/\\/g, "/");
                    editor.edit((selected) => {
                        selected.insert(new vscode_1.Position(wordRange.end.line, wordRange.end.character - 3), ` lightbox="${imagePath}"`);
                    });
                }
            }));
        }
        else {
            const RE_LIGHTBOX_EXISTS = /:::image\s+((source|type|alt-text|lightbox|border|loc-scope)="([a-zA-Z0-9_.\/ -]+)"\s*)+:::/gm;
            const lightboxAlreadyExists = editor.document.getWordRangeAtPosition(position, RE_LIGHTBOX_EXISTS);
            if (lightboxAlreadyExists) {
                vscode_1.window.showErrorMessage("lightbox attribute already exists on :::image::: tag.");
                return;
            }
            vscode_1.window.showErrorMessage("invalid cursor position. You must be inside :::image::: tags.");
        }
        return;
    });
}
exports.applyLightbox = applyLightbox;
function imageKeyWordHasBeenTyped(editor) {
    const RE_IMAGE = /image/g;
    if (editor) {
        const position = new vscode_1.Position(editor.selection.active.line, editor.selection.active.character);
        const wordRange = editor.document.getWordRangeAtPosition(position, RE_IMAGE);
        if (wordRange) {
            return true;
        }
    }
}
exports.imageKeyWordHasBeenTyped = imageKeyWordHasBeenTyped;
function imageCompletionProvider() {
    const completionItems = [];
    completionItems.push(new vscode_1.CompletionItem(`:::image type="content" source="" alt-text="" loc-scope="":::`));
    completionItems.push(new vscode_1.CompletionItem(`:::image type="icon" source="" alt-text="" loc-scope="":::`));
    completionItems.push(new vscode_1.CompletionItem(`:::image type="complex" source="" alt-text="" loc-scope="":::`));
    return completionItems;
}
exports.imageCompletionProvider = imageCompletionProvider;
//# sourceMappingURL=image-controller_REMOTE_5589.js.map