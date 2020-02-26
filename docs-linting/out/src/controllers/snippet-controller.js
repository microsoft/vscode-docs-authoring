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
const dir = require("node-dir");
const vscode = require("vscode");
const common_1 = require("../helper/common");
const utility_1 = require("../helper/utility");
const vscode_1 = require("vscode");
const path_1 = require("path");
const fs = require("fs");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const telemetryCommand = "insertSnippet";
function insertSnippetCommand() {
    const commands = [
        { command: insertSnippet.name, callback: insertSnippet },
    ];
    return commands;
}
exports.insertSnippetCommand = insertSnippetCommand;
/**
 * Creates a snippet at the current cursor position.
 */
function insertSnippet() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    if (!common_1.isValidEditor(editor, false, insertSnippet.name)) {
        return;
    }
    if (!common_1.isMarkdownFileCheck(editor, false)) {
        return;
    }
    if (!common_1.hasValidWorkSpaceRootPath(telemetryCommand)) {
        return;
    }
    searchRepo();
    common_1.sendTelemetryData(telemetryCommand, "");
}
exports.insertSnippet = insertSnippet;
// finds the directories to search, passes this and the search term to the search function.
function searchRepo() {
    const editor = vscode.window.activeTextEditor;
    let folderPath = "";
    if (!editor) {
        common_1.noActiveEditorMessage();
        return;
    }
    if (vscode_1.workspace.workspaceFolders) {
        folderPath = vscode_1.workspace.workspaceFolders[0].uri.fsPath;
    }
    const selected = editor.selection;
    // There are two kinds of repo searching, whole repo, and scoped folder (both recursive)
    const scopeOptions = [];
    scopeOptions.push({ label: "Full Search", description: "Look in all directories for snippet" });
    scopeOptions.push({ label: "Scoped Search", description: "Look in specific directories for snippet" });
    scopeOptions.push({ label: "Cross-Repository Reference", description: "Reference GitHub repository" });
    vscode.window.showQuickPick(scopeOptions).then(function searchType(selection) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!selection) {
                return;
            }
            const searchSelection = selection.label;
            switch (searchSelection) {
                case "Full Search":
                    utility_1.search(editor, selected, folderPath);
                    break;
                case "Scoped Search":
                    // gets all subdirectories to populate the scope search function.
                    dir.subdirs(folderPath, (err, subdirs) => {
                        if (err) {
                            vscode.window.showErrorMessage(err);
                            throw err;
                        }
                        const dirOptions = [];
                        for (const folders in subdirs) {
                            if (subdirs.hasOwnProperty(folders)) {
                                dirOptions.push({ label: subdirs[folders], description: "sub directory" });
                            }
                        }
                        vscode.window.showQuickPick(dirOptions).then((directory) => {
                            if (directory) {
                                utility_1.search(editor, selected, directory.label);
                            }
                        });
                    });
                default:
                    if (vscode_1.workspace) {
                        if (vscode_1.workspace.workspaceFolders) {
                            const repoRoot = vscode_1.workspace.workspaceFolders[0].uri.fsPath;
                            // get openpublishing.json at root
                            const openPublishingRepos = yield getOpenPublishingFile(repoRoot);
                            if (openPublishingRepos) {
                                const openPublishingOptions = [];
                                openPublishingRepos.map((repo) => {
                                    openPublishingOptions.push({ label: repo.path_to_root, description: repo.url });
                                });
                                vscode.window.showQuickPick(openPublishingOptions).then((repo) => {
                                    if (repo) {
                                        utility_1.search(editor, selected, "", "", repo.label);
                                    }
                                });
                            }
                        }
                    }
                    break;
            }
        });
    });
}
exports.searchRepo = searchRepo;
function getOpenPublishingFile(repoRoot) {
    return __awaiter(this, void 0, void 0, function* () {
        const openPublishingFilePath = path_1.resolve(repoRoot, ".openpublishing.publish.config.json");
        const openPublishingFile = yield readFile(openPublishingFilePath, "utf8");
        // filePath = filePath.replace(ROOTPATH_RE, repoRoot);
        const openPublishingJson = JSON.parse(openPublishingFile);
        return openPublishingJson.dependent_repositories;
    });
}
//# sourceMappingURL=snippet-controller.js.map