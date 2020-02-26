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
const fs = require("fs");
const path = require("path");
const vscode_1 = require("vscode");
const common_1 = require("../helper/common");
function insertMetadataCommands() {
    return [
        { command: updateMetadataDate.name, callback: updateMetadataDate },
        { command: updateImplicitMetadataValues.name, callback: updateImplicitMetadataValues },
    ];
}
exports.insertMetadataCommands = insertMetadataCommands;
class ReplacementFormat {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
    toReplacementString() {
        return `${this.type}: ${this.value}`;
    }
}
const authorRegex = /^author:\s*\b(.+?)$/mi;
const managerRegex = /^manager:\s*\b(.+?)$/mi;
const titleSuffixRegex = /^titleSuffix:\s*\b(.+?)$/mi;
const msAuthorRegex = /ms.author:\s*\b(.+?)$/mi;
const msDateRegex = /ms.date:\s*\b(.+?)$/mi;
const msServiceRegex = /ms.service:\s*\b(.+?)$/mi;
const msSubserviceRegex = /ms.subservice:\s*\b(.+?)$/mi;
const metadataExpressions = new Map([
    ["author", authorRegex],
    ["manager", managerRegex],
    ["titleSuffix", titleSuffixRegex],
    ["ms.author", msAuthorRegex],
    ["ms.date", msDateRegex],
    ["ms.service", msServiceRegex],
    ["ms.subservice", msSubserviceRegex],
]);
function updateImplicitMetadataValues() {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            common_1.noActiveEditorMessage();
            return;
        }
        if (!common_1.isMarkdownFileCheck(editor, false)) {
            return;
        }
        const content = editor.document.getText();
        if (content) {
            const replacementFormats = yield getMetadataReplacements(editor);
            if (replacementFormats) {
                const replacements = [];
                for (let i = 0; i < replacementFormats.length; ++i) {
                    const replacementFormat = replacementFormats[i];
                    if (replacementFormat) {
                        const expression = metadataExpressions.get(replacementFormat.type);
                        const replacement = findReplacement(editor, content, replacementFormat.toReplacementString(), expression);
                        if (replacement) {
                            replacements.push(replacement);
                        }
                    }
                }
                yield applyReplacements(replacements, editor);
                yield saveAndSendTelemetry();
            }
        }
    });
}
exports.updateImplicitMetadataValues = updateImplicitMetadataValues;
function findReplacement(editor, content, value, expression) {
    const result = expression ? expression.exec(content) : null;
    if (result !== null && result.length) {
        const match = result[0];
        if (match) {
            const index = result.index;
            const startPosition = editor.document.positionAt(index);
            const endPosition = editor.document.positionAt(index + match.length);
            const selection = new vscode_1.Selection(startPosition, endPosition);
            return { selection, value };
        }
    }
    return undefined;
}
function applyReplacements(replacements, editor) {
    return __awaiter(this, void 0, void 0, function* () {
        if (replacements) {
            yield editor.edit((builder) => {
                replacements.forEach((replacement) => builder.replace(replacement.selection, replacement.value));
            });
        }
    });
}
function getMetadataReplacements(editor) {
    return __awaiter(this, void 0, void 0, function* () {
        const folder = vscode_1.workspace.getWorkspaceFolder(editor.document.uri);
        if (folder) {
            // Read the DocFX.json file, search for metadata defaults.
            const docFxJson = common_1.tryFindFile(folder.uri.fsPath, "docfx.json");
            if (!!docFxJson && fs.existsSync(docFxJson)) {
                const jsonBuffer = fs.readFileSync(docFxJson);
                const metadata = JSON.parse(jsonBuffer.toString());
                if (metadata && metadata.build && metadata.build.fileMetadata) {
                    const replacements = [];
                    const fsPath = editor.document.uri.fsPath;
                    const fileMetadata = metadata.build.fileMetadata;
                    const tryAssignReplacement = (filePath, type, globs) => {
                        if (globs) {
                            const value = getReplacementValue(globs, filePath);
                            if (value) {
                                replacements.push(new ReplacementFormat(type, value));
                                return true;
                            }
                        }
                        return false;
                    };
                    // Fall back to templates config, if unable to find author and ms.author
                    if (!tryAssignReplacement(fsPath, "author", fileMetadata.author)) {
                        const gitHubId = vscode_1.workspace.getConfiguration("docs.templates").githubid;
                        if (gitHubId) {
                            replacements.push(new ReplacementFormat("author", gitHubId));
                        }
                    }
                    if (!tryAssignReplacement(fsPath, "ms.author", fileMetadata["ms.author"])) {
                        const alias = vscode_1.workspace.getConfiguration("docs.templates").alias;
                        if (alias) {
                            replacements.push(new ReplacementFormat("ms.author", alias));
                        }
                    }
                    tryAssignReplacement(fsPath, "manager", fileMetadata["manager"]);
                    tryAssignReplacement(fsPath, "titleSuffix", fileMetadata["titleSuffix"]);
                    tryAssignReplacement(fsPath, "ms.service", fileMetadata["ms.service"]);
                    tryAssignReplacement(fsPath, "ms.subservice", fileMetadata["ms.subservice"]);
                    replacements.push(new ReplacementFormat("ms.date", toShortDate(new Date())));
                    return replacements;
                }
            }
        }
        return [];
    });
}
function getReplacementValue(globs, fsPath) {
    if (globs && fsPath) {
        let segments = fsPath.split(path.sep);
        const globKeys = Object.keys(globs).map((key) => ({ key, segments: key.split("/") }));
        const firstSegment = globKeys[0].segments[0];
        segments = segments.slice(segments.indexOf(firstSegment));
        const length = segments.length;
        for (let i = 0; i < globKeys.length; ++i) {
            const globKey = globKeys[i];
            if (length <= globKey.segments.length) {
                let equals = false;
                for (let f = 0; f < segments.length - 1; ++f) {
                    const left = segments[f];
                    const right = globKey.segments[f];
                    if (right.startsWith("*")) {
                        break;
                    }
                    equals = left.toLowerCase() === right.toLowerCase();
                }
                if (equals) {
                    return globs[globKey.key];
                }
            }
        }
    }
    return undefined;
}
function updateMetadataDate() {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            common_1.noActiveEditorMessage();
            return;
        }
        if (!common_1.isMarkdownFileCheck(editor, false)) {
            return;
        }
        const content = editor.document.getText();
        if (content) {
            const replacement = findReplacement(editor, content, `ms.date: ${toShortDate(new Date())}`, msDateRegex);
            if (replacement) {
                yield applyReplacements([replacement], editor);
                yield saveAndSendTelemetry();
            }
        }
    });
}
exports.updateMetadataDate = updateMetadataDate;
function saveAndSendTelemetry() {
    return __awaiter(this, void 0, void 0, function* () {
        yield vscode_1.commands.executeCommand("workbench.action.files.save");
        const telemetryCommand = "updateMetadata";
        common_1.sendTelemetryData(telemetryCommand, updateMetadataDate.name);
    });
}
function toShortDate(date) {
    const year = date.getFullYear();
    const month = (1 + date.getMonth()).toString();
    const monthStr = month.length > 1 ? month : `0${month}`;
    const day = date.getDate().toString();
    const dayStr = day.length > 1 ? day : `0${day}`;
    return `${monthStr}/${dayStr}/${year}`;
}
//# sourceMappingURL=metadata-controller.js.map