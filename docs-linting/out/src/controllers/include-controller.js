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
const glob = require("glob");
const os = require("os");
const path = require("path");
const vscode_1 = require("vscode");
const common_1 = require("../helper/common");
const utility_1 = require("../helper/utility");
const telemetryCommand = "insertInclude";
const markdownExtension = ".md";
function insertIncludeCommand() {
    const commands = [
        { command: insertInclude.name, callback: insertInclude },
    ];
    return commands;
}
exports.insertIncludeCommand = insertIncludeCommand;
/**
 * transforms the current selection into an include.
 */
function insertInclude() {
    return __awaiter(this, void 0, void 0, function* () {
        const editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            common_1.noActiveEditorMessage();
            return;
        }
        const activeFileDir = path.dirname(editor.document.fileName);
        let folderPath = "";
        if (vscode_1.workspace.workspaceFolders) {
            folderPath = vscode_1.workspace.workspaceFolders[0].uri.fsPath;
        }
        if (!common_1.isMarkdownFileCheck(editor, false)) {
            return;
        }
        if (!common_1.hasValidWorkSpaceRootPath(telemetryCommand)) {
            return;
        }
        if (!folderPath) {
            return;
        }
        yield glob("**/includes/**/*.md", { cwd: folderPath, nocase: true, realpath: true }, (er, files) => __awaiter(this, void 0, void 0, function* () {
            const items = [];
            files.forEach((file) => items.push({
                description: path.dirname(file),
                label: path.basename(file),
            }));
            const descSelector = (item) => item && item.description || "";
            items.sort((a, b) => {
                const [aDesc, bDesc] = [descSelector(a), descSelector(b)];
                if (aDesc < bDesc) {
                    return -1;
                }
                if (aDesc > bDesc) {
                    return 1;
                }
                return 0;
            });
            // show the quick pick menu
            const qpSelection = yield vscode_1.window.showQuickPick(items);
            // replace the selected text with the properly formatted link
            if (!qpSelection) {
                return;
            }
            let result;
            const position = editor.selection.active;
            // strip markdown extension from label text.
            const includeText = qpSelection.label.replace(markdownExtension, "");
            switch (os.type()) {
                case "Windows_NT":
                    result = utility_1.includeBuilder((path.relative(activeFileDir, path.join(qpSelection.description || "Unknown", qpSelection.label).split("\\").join("\\\\"))), includeText);
                    break;
                case "Darwin":
                    result = utility_1.includeBuilder((path.relative(activeFileDir, path.join(qpSelection.description || "Unknown", qpSelection.label).split("//").join("//"))), includeText);
                    break;
            }
            editor.edit((editBuilder) => {
                editBuilder.insert(position, result.replace(/\\/g, "/"));
            });
        }));
        common_1.sendTelemetryData(telemetryCommand, "");
    });
}
exports.insertInclude = insertInclude;
//# sourceMappingURL=include-controller.js.map