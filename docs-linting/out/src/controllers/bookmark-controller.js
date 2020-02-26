"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const node_dir_1 = require("node-dir");
const path_1 = require("path");
const vscode_1 = require("vscode");
const bookmark_builder_1 = require("../helper/bookmark-builder");
const common_1 = require("../helper/common");
const telemetryCommand = "insertBookmark";
let commandOption;
const markdownExtensionFilter = [".md"];
exports.headingTextRegex = /^ {0,3}(#{2,6})(.*)/gm;
exports.yamlTextRegex = /^-{3}\s*\r?\n([\s\S]*?)-{3}\s*\r?\n([\s\S]*)/;
function insertBookmarkCommands() {
    const commands = [
        { command: insertBookmarkExternal.name, callback: insertBookmarkExternal },
        { command: insertBookmarkInternal.name, callback: insertBookmarkInternal },
    ];
    return commands;
}
exports.insertBookmarkCommands = insertBookmarkCommands;
/**
 * Creates a bookmark to another file at the cursor position
 */
function insertBookmarkExternal() {
    commandOption = "external";
    let folderPath = "";
    let fullPath = "";
    const editor = vscode_1.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    const activeFileName = editor.document.fileName;
    const activeFilePath = path_1.dirname(activeFileName);
    // Check to see if the active file has been saved.  If it has not been saved, warn the user.
    // The user will still be allowed to add a link but it the relative path will not be resolved.
    const fileExists = require("file-exists");
    if (!fileExists(activeFileName)) {
        vscode_1.window.showWarningMessage(`${activeFilePath} is not saved.  Cannot accurately resolve path to create link.`);
        return;
    }
    if (vscode_1.workspace.workspaceFolders) {
        folderPath = vscode_1.workspace.workspaceFolders[0].uri.fsPath;
    }
    // recursively get all the files from the root folder
    node_dir_1.files(folderPath, (err, files) => {
        if (err) {
            vscode_1.window.showErrorMessage(err);
            throw err;
        }
        const items = [];
        files.sort();
        files.filter((file) => markdownExtensionFilter.indexOf(path_1.extname(file.toLowerCase())) !== -1).forEach((file) => {
            items.push({ label: path_1.basename(file), description: path_1.dirname(file) });
        });
        // show the quick pick menu
        const selectionPick = vscode_1.window.showQuickPick(items);
        selectionPick.then((qpSelection) => {
            let result = "";
            let bookmark = "";
            if (!qpSelection) {
                return;
            }
            if (qpSelection.description) {
                fullPath = path_1.join(qpSelection.description, qpSelection.label);
            }
            const content = fs_1.readFileSync(fullPath, "utf8");
            const headings = content.match(exports.headingTextRegex);
            if (!headings) {
                vscode_1.window.showErrorMessage("No headings found in file, cannot insert bookmark!");
                return;
            }
            const adjustedHeadingsItems = [];
            const adjustedHeadings = bookmark_builder_1.addbookmarkIdentifier(headings);
            adjustedHeadings.forEach((adjustedHeading) => {
                adjustedHeadingsItems.push({ label: adjustedHeading, detail: " " });
            });
            vscode_1.window.showQuickPick(adjustedHeadingsItems).then((headingSelection) => {
                if (!headingSelection) {
                    return;
                }
                if (path_1.resolve(activeFilePath) === path_1.resolve(qpSelection.label.split("\\").join("\\\\")) && path_1.basename(activeFileName) === qpSelection.label) {
                    bookmark = bookmark_builder_1.bookmarkBuilder(editor.document.getText(editor.selection), headingSelection.label, "");
                }
                else {
                    if (qpSelection.description) {
                        result = path_1.relative(activeFilePath, path_1.join(qpSelection.description, qpSelection.label).split("\\").join("\\\\"));
                    }
                    bookmark = bookmark_builder_1.bookmarkBuilder(editor.document.getText(editor.selection), headingSelection.label, result);
                }
                common_1.insertContentToEditor(editor, "InsertBookmarkExternal", bookmark, true, editor.selection);
            });
        });
    });
    common_1.sendTelemetryData(telemetryCommand, commandOption);
}
exports.insertBookmarkExternal = insertBookmarkExternal;
/**
 * Creates a bookmark at the current cursor position
 */
function insertBookmarkInternal() {
    commandOption = "internal";
    const editor = vscode_1.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const content = editor.document.getText();
    const headings = content.match(exports.headingTextRegex);
    if (!headings) {
        vscode_1.window.showErrorMessage("No headings found in file, cannot insert bookmark!");
        return;
    }
    // put number to duplicate names in position order
    const adjustedHeadings = bookmark_builder_1.addbookmarkIdentifier(headings);
    const adjustedHeadingsItems = [];
    adjustedHeadings.forEach((heading) => {
        adjustedHeadingsItems.push({ label: heading, detail: " " });
    });
    vscode_1.window.showQuickPick(adjustedHeadingsItems).then((headingSelection) => {
        if (!headingSelection) {
            return;
        }
        const bookmark = bookmark_builder_1.bookmarkBuilder(editor.document.getText(editor.selection), headingSelection.label, "");
        common_1.insertContentToEditor(editor, "InsertBookmarkInternal", bookmark, true, editor.selection);
    });
    common_1.sendTelemetryData(telemetryCommand, commandOption);
}
exports.insertBookmarkInternal = insertBookmarkInternal;
//# sourceMappingURL=bookmark-controller.js.map