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
const http_helper_1 = require("../helper/http-helper");
const telemetry_1 = require("../helper/telemetry");
const telemetryCommand = "applyXref";
const rootUrl = "https://xref.docs.microsoft.com";
const RE_XREF = /<xref:([A-Za-z_.\-\*\(\)\,\%0-9\`}{\[\]]+)?(\?)?(d)?(isplayProperty)?(=)?(fullName|nameWithType)?(>)?/g;
function xrefCompletionItemsMarkdown() {
    return [new vscode_1.CompletionItem("<xref:>")];
}
exports.xrefCompletionItemsMarkdown = xrefCompletionItemsMarkdown;
function xrefTagsCompletionItemsMarkdown(editor) {
    return __awaiter(this, void 0, void 0, function* () {
        const completionItems = [];
        let uid = "A";
        if (editor) {
            const position = new vscode_1.Position(editor.selection.active.line, editor.selection.active.character);
            const wordRange = editor.document.getWordRangeAtPosition(position, RE_XREF);
            const xref = editor.document.getText(wordRange);
            const captureGroup = RE_XREF.exec(xref);
            if (captureGroup && captureGroup[1]) {
                uid = captureGroup[1].trim();
            }
            const response = yield http_helper_1.getAsync(`${rootUrl}/autocomplete?text=${uid}`);
            response.data.map((item) => {
                completionItems.push(new vscode_1.CompletionItem(encodeSpecialCharacters(item.uid)));
            });
        }
        return completionItems;
    });
}
exports.xrefTagsCompletionItemsMarkdown = xrefTagsCompletionItemsMarkdown;
function xrefDisplayPropertyCompletionItemsMarkdown(editor) {
    const completionItems = [];
    completionItems.push(new vscode_1.CompletionItem("displayProperty=nameWithType"));
    completionItems.push(new vscode_1.CompletionItem("displayProperty=fullName"));
    return completionItems;
}
exports.xrefDisplayPropertyCompletionItemsMarkdown = xrefDisplayPropertyCompletionItemsMarkdown;
function xrefDisplayPropsCompletionItemsMarkdown(editor) {
    const completionItems = [];
    completionItems.push(new vscode_1.CompletionItem("nameWithType"));
    completionItems.push(new vscode_1.CompletionItem("fullName"));
    return completionItems;
}
exports.xrefDisplayPropsCompletionItemsMarkdown = xrefDisplayPropsCompletionItemsMarkdown;
function isCursorInsideXref(editor) {
    const range = new vscode_1.Range(editor.selection.start.line, 0, editor.selection.end.line, editor.selection.active.character);
    const cursorText = editor.document.getText(range);
    return cursorText.indexOf("<xref:") > -1;
}
exports.isCursorInsideXref = isCursorInsideXref;
function isCursorAfterXrefDisplayProperty(editor) {
    const position = new vscode_1.Position(editor.selection.active.line, editor.selection.active.character);
    const wordRange = editor.document.getWordRangeAtPosition(position, RE_XREF);
    if (wordRange) {
        const xref = editor.document.getText(wordRange);
        const captureGroup = RE_XREF.exec(xref);
        if (captureGroup && (captureGroup[5])) {
            return true;
        }
    }
    return false;
}
exports.isCursorAfterXrefDisplayProperty = isCursorAfterXrefDisplayProperty;
function isCursorAfterXrefUid(editor) {
    const position = new vscode_1.Position(editor.selection.active.line, editor.selection.active.character);
    const wordRange = editor.document.getWordRangeAtPosition(position, RE_XREF);
    if (wordRange) {
        const xref = editor.document.getText(wordRange);
        const captureGroup = RE_XREF.exec(xref);
        if (captureGroup && (captureGroup[2] || captureGroup[3] || captureGroup[4])) {
            return true;
        }
    }
    return false;
}
exports.isCursorAfterXrefUid = isCursorAfterXrefUid;
function isCursorStartAngleBracketsXref(editor) {
    const range = new vscode_1.Range(editor.selection.start.line, 0, editor.selection.end.line, editor.selection.active.character);
    const cursorText = editor.document.getText(range);
    const isCursorStartXref = cursorText.indexOf("<xref") > -1;
    if (!isCursorStartXref) {
        return cursorText.indexOf("<") > -1;
    }
    return isCursorStartXref;
}
exports.isCursorStartAngleBracketsXref = isCursorStartAngleBracketsXref;
function applyXrefCommand() {
    const commands = [
        { command: applyXref.name, callback: applyXref },
    ];
    return commands;
}
exports.applyXrefCommand = applyXrefCommand;
function applyXref() {
    return __awaiter(this, void 0, void 0, function* () {
        telemetry_1.reporter.sendTelemetryEvent(`${telemetryCommand}`);
        const editor = vscode_1.window.activeTextEditor;
        if (!editor) {
            common_1.noActiveEditorMessage();
            return;
        }
        else {
            if (!common_1.isMarkdownFileCheck(editor, false)) {
                return;
            }
        }
        let xref = "";
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        // if theres no selected text, add xref syntax as <xref:...>
        const xrefSelection = yield getXrefSelection();
        if (xrefSelection) {
            if (selectedText === "") {
                const displayProperty = yield getXrefDisplayProperty();
                if (displayProperty && displayProperty.label !== "none") {
                    xrefSelection.label = `${xrefSelection.label}?displayProperty=${displayProperty.label}`;
                }
                xref = `<xref:${encodeSpecialCharacters(xrefSelection.label)}>`;
            }
            else {
                xref = `[${selectedText}](xref:${xrefSelection.label})`;
            }
        }
        else {
            return;
        }
        common_1.insertContentToEditor(editor, applyXref.name, xref, true);
        // Gets the cursor position
        const position = editor.selection.active;
        const positionCharacter = applyXref.name === "applyXref" ? position.character + xref.length : position.character + 1;
        // Makes the cursor position in between syntaxs
        common_1.setCursorPosition(editor, position.line, positionCharacter);
        common_1.sendTelemetryData(telemetryCommand, "");
    });
}
exports.applyXref = applyXref;
function encodeSpecialCharacters(content) {
    content = content.replace(/\*/g, "%2A");
    content = content.replace(/#/g, "%23");
    content = content.replace(/`/g, "%60");
    return content;
}
function getXrefDisplayProperty() {
    return __awaiter(this, void 0, void 0, function* () {
        const items = [];
        items.push({
            description: "None (default)",
            label: "none",
        });
        items.push({
            description: "Name with Type",
            label: "nameWithType",
        });
        items.push({
            description: "Full Name",
            label: "fullName",
        });
        return vscode_1.window.showQuickPick(items, { placeHolder: "Select Display Property" }).then((selection) => {
            if (!selection) {
                return;
            }
            return selection;
        });
    });
}
function getXrefSelection() {
    return __awaiter(this, void 0, void 0, function* () {
        const items = [];
        const uid = yield vscode_1.window.showInputBox({ placeHolder: "Enter XREF Search Term" });
        if (uid) {
            const response = yield http_helper_1.getAsync(`${rootUrl}/autocomplete?text=${uid}`);
            if (response.status !== 200) {
                vscode_1.window.showErrorMessage("Failed to connect to XREF service. Please check your internet connection and try again.");
                return;
            }
            if (response.data.length === 0) {
                vscode_1.window.showErrorMessage(`No results found for "${uid}". Please check your search term.`);
                return;
            }
            response.data.map((item) => {
                items.push({
                    label: item.uid,
                });
            });
            return vscode_1.window.showQuickPick(items, { placeHolder: "Link to XREF" }).then((selection) => {
                if (!selection) {
                    return;
                }
                return selection;
            });
        }
    });
}
//# sourceMappingURL=xref-controller.js.map