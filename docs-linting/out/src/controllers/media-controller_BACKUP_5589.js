"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const bookmark_controller_1 = require("../controllers/bookmark-controller");
const common_1 = require("../helper/common");
const utility_1 = require("../helper/utility");
const telemetryCommandMedia = "insertMedia";
const telemetryCommandLink = "insertLink";
let commandOption;
function insertLinksAndMediaCommands() {
    const commands = [
        { command: insertVideo.name, callback: insertVideo },
        { command: insertURL.name, callback: insertURL },
        { command: insertLink.name, callback: insertLink },
        { command: selectLinkType.name, callback: selectLinkType },
        { command: selectLinkTypeToolbar.name, callback: selectLinkTypeToolbar },
        { command: selectMediaType.name, callback: selectMediaType },
    ];
    return commands;
}
exports.insertLinksAndMediaCommands = insertLinksAndMediaCommands;
const imageExtensions = [".jpeg", ".jpg", ".png", ".gif", ".bmp"];
const markdownExtensionFilter = [".md"];
exports.h1TextRegex = /\n {0,3}(#{1,6})(.*)/;
exports.headingTextRegex = /^(#+)[\s](.*)[\r]?[\n]/gm;
exports.yamlTextRegex = /^-{3}\s*\r?\n([\s\S]*?)-{3}\s*\r?\n([\s\S]*)/;
var MediaType;
(function (MediaType) {
    MediaType[MediaType["Link"] = 0] = "Link";
    MediaType[MediaType["ImageOrVideo"] = 1] = "ImageOrVideo";
    MediaType[MediaType["GrayBorderImage"] = 2] = "GrayBorderImage";
})(MediaType = exports.MediaType || (exports.MediaType = {}));
function insertVideo() {
    commandOption = "video";
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    else {
        const validateInput = (urlInput) => {
            const urlLowerCase = urlInput.toLowerCase();
            return urlLowerCase.startsWith("https://channel9.msdn.com")
                && urlLowerCase.split("?")[0].endsWith("player")
                || urlLowerCase.startsWith("https://www.youtube.com/embed")
                || urlLowerCase.startsWith("https://www.microsoft.com/en-us/videoplayer/embed")
                ? ""
                : "https://channel9.msdn.com, https://www.youtube.com/embed or https://www.microsoft.com/en-us/videoplayer/embed are required prefixes for video URLs. Link will not be added if prefix is not present.";
        };
        vscode.window.showInputBox({
            placeHolder: "Enter URL; Begin typing to see the allowed video URL prefixes.",
            validateInput: validateInput
        }).then((val) => {
            // If the user adds a link that doesn't include the http(s) protocol, show a warning and don't add the link.
            if (val === undefined) {
                common_1.postWarning("Incorrect link syntax. For YouTube videos, use the embed syntax, https://www.youtube.com/embed/<videoID>. For Channel9videos, use the player syntax, https://channel9.msdn.com/. For Red Tiger, use, https://www.microsoft.com/en-us/embed/<videoID>/player");
                return;
            }
            const contentToInsert = utility_1.videoLinkBuilder(val);
            common_1.insertContentToEditor(editor, insertVideo.name, contentToInsert);
        });
    }
    common_1.sendTelemetryData(telemetryCommandMedia, commandOption);
}
exports.insertVideo = insertVideo;
/**
 * Creates an external URL with the current selection.
 */
function insertURL() {
    commandOption = "external";
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);
    const options = {
        placeHolder: "Enter URL",
        validateInput: (urlInput) => urlInput.startsWith("http://") || urlInput.startsWith("https://") ? "" :
            "http:// or https:// is required for URLs. Link will not be added if prefix is not present.",
    };
    vscode.window.showInputBox(options).then((val) => {
        // If the user adds a link that doesn't include the http(s) protocol, show a warning and don't add the link.
        if (val === undefined) {
            common_1.postWarning("Incorrect link syntax. Abandoning command.");
        }
        else {
            let contentToInsert;
            if (selection.isEmpty) {
                contentToInsert = utility_1.externalLinkBuilder(val);
                common_1.insertContentToEditor(editor, insertURL.name, contentToInsert);
            }
            else {
                contentToInsert = utility_1.externalLinkBuilder(val, selectedText);
                common_1.insertContentToEditor(editor, insertURL.name, contentToInsert, true);
            }
            common_1.setCursorPosition(editor, selection.start.line, selection.start.character + contentToInsert.length);
        }
    });
    common_1.sendTelemetryData(telemetryCommandLink, commandOption);
}
exports.insertURL = insertURL;
/**
 * Inserts a link
 */
function insertLink() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    const languageId = editor.document.languageId;
    const isMarkdown = languageId === "markdown";
    const isYaml = languageId === "yaml";
    if (!isMarkdown && !isYaml) {
        common_1.unsupportedFileMessage(languageId);
        return;
    }
    Insert(MediaType.Link, { languageId });
}
exports.insertLink = insertLink;
function insertImage() {
    Insert(MediaType.ImageOrVideo);
}
exports.insertImage = insertImage;
function getFilesShowQuickPick(mediaType, altText, options) {
    const path = require("path");
    const dir = require("node-dir");
    const os = require("os");
    const fs = require("fs");
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    const selection = editor.selection;
    let folderPath = "";
    let selectedText = editor.document.getText(selection);
    const activeFileDir = path.dirname(editor.document.fileName);
    if (vscode.workspace.workspaceFolders) {
        folderPath = vscode.workspace.workspaceFolders[0].uri.fsPath;
    }
    // recursively get all the files from the root folder
    dir.files(folderPath, (err, files) => {
        if (err) {
            vscode.window.showErrorMessage(err);
            throw err;
        }
        const items = [];
        files.sort();
        const isArt = mediaType !== MediaType.Link;
        if (isArt) {
            files.filter((file) => imageExtensions.indexOf(path.extname(file.toLowerCase())) !== -1).forEach((file) => {
                items.push({ label: path.basename(file), description: path.dirname(file) });
            });
        }
        else {
            files.filter((file) => markdownExtensionFilter.indexOf(path.extname(file.toLowerCase()))
                !== -1).forEach((file) => {
                items.push({ label: path.basename(file), description: path.dirname(file) });
            });
        }
        // show the quick pick menu
        const selectionPick = vscode.window.showQuickPick(items);
        selectionPick.then((qpSelection) => {
            if (!qpSelection) {
                return;
            }
            else {
                let result = "";
                const altTextFileName = qpSelection.label;
                // Gets the H1 content as default name if unselected text. Will filter undefinition H1, non-MD file.
                if (!isArt && selectedText === "") {
                    // gets the content for chosen file with utf-8 format
                    const fullPath = path.join(qpSelection.description, qpSelection.label);
                    let content = fs.readFileSync(fullPath, "utf8");
                    // Separation yaml.
                    const yamlMatch = content.match(exports.yamlTextRegex);
                    if (yamlMatch != null) {
                        content = yamlMatch[2];
                    }
                    content = "\n" + content;
                    const match = content.match(exports.h1TextRegex);
                    if (match != null) {
                        selectedText = match[2].trim();
                    }
                }
                const languageId = options ? options.languageId : undefined;
                // Construct and write out links
                if (isArt && altText) {
                    if (altText.length > 250) {
                        vscode.window.showWarningMessage("Alt text exceeds 250 characters!");
                    }
                    else {
                        result = utility_1.internalLinkBuilder(isArt, path.relative(activeFileDir, path.join(qpSelection.description, qpSelection.label).split("\\").join("\\\\")), altText, languageId);
                    }
                }
                else if (isArt && altText === "") {
                    result = utility_1.internalLinkBuilder(isArt, path.relative(activeFileDir, path.join(qpSelection.description, qpSelection.label).split("\\").join("\\\\")), altTextFileName, languageId);
                }
                else if (!isArt) {
                    result = utility_1.internalLinkBuilder(isArt, path.relative(activeFileDir, path.join(qpSelection.description, qpSelection.label).split("\\").join("\\\\")), selectedText, languageId);
                }
                if (os.type() === "Darwin") {
                    if (isArt) {
                        result = utility_1.internalLinkBuilder(isArt, path.relative(activeFileDir, path.join(qpSelection.description, qpSelection.label).split("//").join("//")), altText, languageId);
                    }
                    else {
                        result = utility_1.internalLinkBuilder(isArt, path.relative(activeFileDir, path.join(qpSelection.description, qpSelection.label).split("//").join("//")), selectedText, languageId);
                    }
                }
                if (!!result) {
                    // Insert content into topic
                    common_1.insertContentToEditor(editor, Insert.name, result, true);
                    if (!isArt) {
                        common_1.setCursorPosition(editor, selection.start.line, selection.start.character + result.length);
                    }
                }
            }
        });
    });
}
exports.getFilesShowQuickPick = getFilesShowQuickPick;
/**
 * Inserts various media types.
 * @param {MediaType} mediaType - the media type to insert.
 * @param {IOptions} [options] - optionally specifies the language identifier of the target file.
 */
function Insert(mediaType, options) {
    let actionType = Insert.name;
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    else {
        const selectedText = editor.document.getText(editor.selection);
        // Determines the name to set in the ValidEditor check
        switch (mediaType) {
            case MediaType.ImageOrVideo:
                actionType = "Art";
                commandOption = "art";
                common_1.sendTelemetryData(telemetryCommandMedia, commandOption);
                break;
            case MediaType.Link:
                actionType = "Link";
                commandOption = "internal";
                common_1.sendTelemetryData(telemetryCommandLink, commandOption);
                break;
        }
        // Checks for valid environment
        if (!common_1.isValidEditor(editor, false, actionType)) {
            return;
        }
        // We have some cross-over functionality in both YAML and Markdown
        if (!common_1.isValidFileCheck(editor, ["markdown", "yaml"])) {
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
            vscode.window.showWarningMessage(`${activeFilePath} is not saved. Cannot accurately resolve path to create link.`);
            return;
        }
        // Determine if there is selected text.  If selected text, no action.
        const languageId = !!options ? options.languageId : undefined;
        if (selectedText === "" && languageId !== "yaml") {
            vscode.window.showInputBox({
                placeHolder: "Add alt text (up to 250 characters)",
            }).then((val) => {
                if (!val) {
                    getFilesShowQuickPick(mediaType, "", options);
                    vscode.window.showInformationMessage("No alt entered or selected.  File name will be used.");
                }
                else if (val.length < 250) {
                    getFilesShowQuickPick(mediaType, val, options);
                }
                else if (val.length > 250) {
                    vscode.window.showWarningMessage("Alt text exceeds 250 characters!");
                }
            });
        }
        else {
            getFilesShowQuickPick(mediaType, selectedText, options);
        }
    }
}
exports.Insert = Insert;
/**
 * Creates an entry point for creating an internal (link type) or external link (url type).
 */
function selectLinkType() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    else {
        if (!common_1.isValidEditor(editor, false, "insert link")) {
            return;
        }
        if (!common_1.isMarkdownFileCheck(editor, false)) {
            return;
        }
        const linkTypes = ["Heading in this file", "Heading in another file"];
        vscode.window.showQuickPick(linkTypes).then((qpSelection) => {
            if (qpSelection === linkTypes[0]) {
                bookmark_controller_1.insertBookmarkInternal();
            }
            else if (qpSelection === linkTypes[1]) {
                bookmark_controller_1.insertBookmarkExternal();
            }
        });
    }
}
exports.selectLinkType = selectLinkType;
/**
 * Creates an entry point for creating an internal (link type) or external link (url type).
 */
function selectLinkTypeToolbar(toolbar) {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    if (!common_1.isValidEditor(editor, false, "insert link")) {
        return;
    }
    if (!common_1.isMarkdownFileCheck(editor, false)) {
        return;
    }
    const linkTypes = ["External", "Internal", "Bookmark in this file", "Bookmark in another file"];
    vscode.window.showQuickPick(linkTypes).then((qpSelection) => {
        if (qpSelection === linkTypes[0]) {
            insertURL();
        }
        else if (qpSelection === linkTypes[1]) {
            Insert(MediaType.Link);
        }
        else if (qpSelection === linkTypes[2]) {
            bookmark_controller_1.insertBookmarkInternal();
        }
        else if (qpSelection === linkTypes[3]) {
            bookmark_controller_1.insertBookmarkExternal();
        }
    });
}
exports.selectLinkTypeToolbar = selectLinkTypeToolbar;
/**
 * Creates an entry point for creating an internal (link type) or external link (url type).
 */
function selectMediaType() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    else {
        if (!common_1.isValidEditor(editor, false, "insert media")) {
            return;
        }
        if (!common_1.isMarkdownFileCheck(editor, false)) {
            return;
        }
        const mediaTypes = ["Image", "Video"];
        vscode.window.showQuickPick(mediaTypes).then((qpSelection) => {
            if (qpSelection === mediaTypes[0]) {
                Insert(MediaType.ImageOrVideo);
            }
            else if (qpSelection === mediaTypes[1]) {
                insertVideo();
            }
        });
    }
}
exports.selectMediaType = selectMediaType;
//# sourceMappingURL=media-controller_BACKUP_5589.js.map