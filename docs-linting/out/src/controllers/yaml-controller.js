"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const node_dir_1 = require("node-dir");
const path_1 = require("path");
const vscode_1 = require("vscode");
const log_messages_1 = require("../constants/log-messages");
const common_1 = require("../helper/common");
const telemetryCommand = "updateTOC";
let commandOption;
function yamlCommands() {
    // tslint:disable-next-line: no-shadowed-variable
    const commands = [
        { command: insertTocEntry.name, callback: insertTocEntry },
        { command: insertTocEntryWithOptions.name, callback: insertTocEntryWithOptions },
        { command: insertExpandableParentNode.name, callback: insertExpandableParentNode },
    ];
    return commands;
}
exports.yamlCommands = yamlCommands;
function insertTocEntry() {
    commandOption = "tocEntry";
    checkForPreviousEntry(false);
}
exports.insertTocEntry = insertTocEntry;
function insertTocEntryWithOptions() {
    commandOption = "tocEntryWithOptions";
    checkForPreviousEntry(true);
}
exports.insertTocEntryWithOptions = insertTocEntryWithOptions;
function insertExpandableParentNode() {
    commandOption = "expandableParentNode";
    createParentNode();
}
exports.insertExpandableParentNode = insertExpandableParentNode;
function showQuickPick(options) {
    const markdownExtensionFilter = [".md"];
    const headingTextRegex = /^(# )(.*)/gm;
    let folderPath = "";
    let fullPath = "";
    if (vscode_1.workspace.workspaceFolders) {
        folderPath = vscode_1.workspace.workspaceFolders[0].uri.fsPath;
    }
    // tslint:disable: no-shadowed-variable
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
            const editor = vscode_1.window.activeTextEditor;
            if (!editor) {
                common_1.noActiveEditorMessage();
                return;
            }
            if (!qpSelection) {
                return;
            }
            if (qpSelection.description) {
                fullPath = path_1.join(qpSelection.description, qpSelection.label);
            }
            const content = fs_1.readFileSync(fullPath, "utf8");
            const headings = content.match(headingTextRegex);
            if (!headings) {
                vscode_1.window.showErrorMessage(log_messages_1.noHeading);
                return;
            }
            let headingName = headings.toString().replace("# ", "");
            const activeFilePath = editor.document.fileName;
            const href = path_1.relative(activeFilePath, fullPath);
            // format href: remove addtional leading segment (support windows, macos and linux), set path separators to standard
            const formattedHrefPath = href.replace("..\\", "").replace("../", "").replace(/\\/g, "/");
            vscode_1.window.showInputBox({
                value: headingName,
                valueSelection: [0, 0],
            }).then((val) => {
                if (!val) {
                    vscode_1.window.showInformationMessage(log_messages_1.noHeadingSelected);
                }
                if (val) {
                    headingName = val;
                }
                createEntry(headingName, formattedHrefPath, options);
            });
        });
    });
}
exports.showQuickPick = showQuickPick;
function createEntry(name, href, options) {
    const editor = vscode_1.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const position = editor.selection.active;
    const cursorPosition = position.character;
    const attributeSpace = " ";
    if (cursorPosition === 0 && !options) {
        const tocEntryLineStart = `- name: ${name}
  href: ${href}`;
        common_1.insertContentToEditor(editor, insertTocEntry.name, tocEntryLineStart);
    }
    if (cursorPosition > 0 && !options) {
        const currentPosition = editor.selection.active.character;
        const tocEntryIndented = `- name: ${name}
  ${attributeSpace.repeat(currentPosition)}href: ${href}`;
        common_1.insertContentToEditor(editor, insertTocEntry.name, tocEntryIndented);
    }
    if (cursorPosition === 0 && options) {
        const tocEntryWithOptions = `- name: ${name}
  displayName: #optional string for searching TOC
  href: ${href}
  uid: #optional string
  expanded: #true or false, false is default`;
        common_1.insertContentToEditor(editor, insertTocEntryWithOptions.name, tocEntryWithOptions);
    }
    if (cursorPosition > 0 && options) {
        const currentPosition = editor.selection.active.character;
        const tocEntryWithOptionsIndented = `- name: ${name}
  ${attributeSpace.repeat(currentPosition)}displayName: #optional string for searching TOC
  ${attributeSpace.repeat(currentPosition)}href: ${href}
  ${attributeSpace.repeat(currentPosition)}uid: #optional string
  ${attributeSpace.repeat(currentPosition)}expanded: #true or false, false is default`;
        common_1.insertContentToEditor(editor, insertTocEntryWithOptions.name, tocEntryWithOptionsIndented);
    }
    common_1.showStatusMessage(log_messages_1.insertedTocEntry);
    common_1.sendTelemetryData(telemetryCommand, commandOption);
}
exports.createEntry = createEntry;
function checkForPreviousEntry(options) {
    const editor = vscode_1.window.activeTextEditor;
    if (!editor) {
        return;
    }
    // position variables
    const position = editor.selection.active;
    const cursorPosition = position.character;
    const currentLine = position.line;
    const totalLines = editor.document.lineCount;
    const startingCursorPosition = editor.selection.active.character;
    // scalar variables
    let itemsIndex = false;
    let itemsIndexFirstPosition = false;
    let nameIndex = false;
    // scalar regex
    const itemsScalarFirstPosition = /^items:/;
    const itemsScalar = /^\s+items:/;
    const nameScalarFirstPosition = /^-\sname:/;
    const nameScalar = /^\s+(-\sname:)/;
    const hrefScalar = /^\s+href:/;
    const displayNameScalar = /^\s+displayName:/;
    // check 1: opening items node
    const lineData = editor.document.lineAt(0);
    const lineText = lineData.text;
    if (lineText.match(itemsScalarFirstPosition)) {
        itemsIndexFirstPosition = true;
    }
    else {
        itemsIndexFirstPosition = false;
    }
    // case 1: opening items alignment
    if (currentLine === 1 && itemsIndexFirstPosition) {
        if (cursorPosition === 2) {
            launchQuickPick(options);
        }
        else {
            vscode_1.window.showErrorMessage(log_messages_1.invalidTocEntryPosition);
        }
    }
    // check 2: items node
    if (currentLine > 0) {
        for (let i = currentLine; i < totalLines; i--) {
            if (i === 0) {
                break;
            }
            const stopAtParent = editor.document.lineAt(i);
            if (stopAtParent.text.match(itemsScalar)) {
                if (stopAtParent.firstNonWhitespaceCharacterIndex === 2 && startingCursorPosition > 2) {
                    itemsIndex = false;
                    break;
                }
            }
            // next line should have a greater starting position
            if (i === currentLine
                && i + 1 !== totalLines) {
                const lineData = editor.document.lineAt(i + 1);
                if (lineData.firstNonWhitespaceCharacterIndex > startingCursorPosition) {
                    itemsIndex = false;
                    break;
                }
            }
            const lineData = editor.document.lineAt(i);
            const lineText = lineData.text;
            if (lineText.match(itemsScalar)) {
                const itemScalarPosition = lineData.firstNonWhitespaceCharacterIndex;
                if (startingCursorPosition === itemScalarPosition) {
                    itemsIndex = true;
                    break;
                }
                else {
                    itemsIndex = false;
                    continue;
                }
            }
        }
    }
    // check 3: name scalar
    if (currentLine > 0) {
        const startPosition = editor.selection.active.line;
        let i = startPosition;
        for (i = startPosition; i < totalLines; i--) {
            if (i === 0) {
                break;
            }
            if (startingCursorPosition === 0) {
                const checkChild = editor.document.lineAt(i + 1);
                if (checkChild.firstNonWhitespaceCharacterIndex === startingCursorPosition) {
                    nameIndex = true;
                    break;
                }
            }
            const stopAtParent = editor.document.lineAt(i);
            if (stopAtParent.text.match(nameScalar)) {
                if (stopAtParent.firstNonWhitespaceCharacterIndex === 0) {
                    nameIndex = false;
                    break;
                }
            }
            // next line should have a greater starting position
            if (i === currentLine
                && i + 1 !== totalLines) {
                const lineData = editor.document.lineAt(i + 1);
                if (lineData.firstNonWhitespaceCharacterIndex > startingCursorPosition) {
                    nameIndex = false;
                    break;
                }
            }
            const lineData = editor.document.lineAt(i);
            const lineText = lineData.text;
            if (lineText.match(nameScalar)) {
                const nameScalarPosition = lineData.firstNonWhitespaceCharacterIndex;
                if (nameScalarPosition === startingCursorPosition) {
                    nameIndex = true;
                    break;
                }
                else {
                    nameIndex = false;
                    continue;
                }
            }
        }
    }
    // check 4: name scalar in first position
    if (currentLine > 0) {
        const startPosition = editor.selection.active.line;
        const totalLines = editor.document.lineCount;
        let i = startPosition;
        for (i = startPosition; i < totalLines; i--) {
            if (i === 0) {
                break;
            }
            if (startingCursorPosition === 0) {
                const checkChild = editor.document.lineAt(i + 1);
                if (checkChild.firstNonWhitespaceCharacterIndex === startingCursorPosition) {
                    nameIndex = true;
                    break;
                }
            }
            const stopAtParent = editor.document.lineAt(i);
            if (stopAtParent.text.match(nameScalar)) {
                if (stopAtParent.firstNonWhitespaceCharacterIndex === 0) {
                    nameIndex = false;
                    break;
                }
            }
            // next line should have a greater starting position
            if (i === currentLine
                && i + 1 !== totalLines) {
                const lineData = editor.document.lineAt(i + 1);
                if (lineData.firstNonWhitespaceCharacterIndex > startingCursorPosition) {
                    nameIndex = false;
                    break;
                }
            }
            const lineData = editor.document.lineAt(i);
            const lineText = lineData.text;
            if (lineText.match(nameScalarFirstPosition)) {
                const nameScalarPosition = lineData.firstNonWhitespaceCharacterIndex;
                if (nameScalarPosition === startingCursorPosition) {
                    nameIndex = true;
                    break;
                }
                else {
                    nameIndex = false;
                    continue;
                }
            }
        }
    }
    // check if parent is href or displayName
    if (currentLine - 1 > 0) {
        if (editor.document.lineAt(currentLine - 1).text.match(hrefScalar)
            || editor.document.lineAt(currentLine - 1).text.match(displayNameScalar)) {
            if (editor.document.lineAt(currentLine - 1).firstNonWhitespaceCharacterIndex === startingCursorPosition) {
                nameIndex = false;
                itemsIndex = false;
            }
        }
    }
    // case 2: scalar alignment
    if (currentLine > 1) {
        if (itemsIndex) {
            launchQuickPick(options);
        }
        else if (nameIndex) {
            launchQuickPick(options);
        }
        else {
            vscode_1.window.showErrorMessage(log_messages_1.invalidTocEntryPosition);
        }
    }
    // case 3: beginning of toc/first line
    if (currentLine === 0) {
        if (cursorPosition === 0) {
            launchQuickPick(options);
        }
        else {
            vscode_1.window.showErrorMessage(log_messages_1.invalidTocEntryPosition);
        }
    }
}
exports.checkForPreviousEntry = checkForPreviousEntry;
function createParentNode() {
    const editor = vscode_1.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const position = editor.selection.active;
    const cursorPosition = position.character;
    const currentLine = position.line;
    const nameScalar = /^\s+(-\sname:)/;
    let nameIndex = false;
    const attributeSpace = " ";
    if (currentLine > 0) {
        const startPosition = editor.selection.active.line;
        let startingCursorPosition;
        const totalLines = editor.document.lineCount;
        let i = startPosition;
        for (i = startPosition; i < totalLines; i--) {
            startingCursorPosition = editor.selection.active.character;
            if (i === 0) {
                break;
            }
            const lineData = editor.document.lineAt(i);
            const lineText = lineData.text;
            if (lineText.match(nameScalar)) {
                const nameScalarPosition = lineData.firstNonWhitespaceCharacterIndex;
                if (nameScalarPosition === startingCursorPosition) {
                    nameIndex = true;
                    break;
                }
                else {
                    nameIndex = false;
                    continue;
                }
            }
        }
    }
    if (cursorPosition === 0) {
        const parentNodeLineStart = `- name:
  items:
  - name:
    href:`;
        common_1.insertContentToEditor(editor, insertTocEntry.name, parentNodeLineStart);
    }
    if (nameIndex && cursorPosition > 0) {
        const parentNodeLineStart = `- name:
    ${attributeSpace.repeat(cursorPosition - 2)}items:
    ${attributeSpace.repeat(cursorPosition - 2)}- name:
    ${attributeSpace.repeat(cursorPosition)}href:`;
        common_1.insertContentToEditor(editor, insertTocEntry.name, parentNodeLineStart);
    }
    if (!nameIndex && cursorPosition !== 0) {
        vscode_1.window.showErrorMessage(log_messages_1.invalidTocEntryPosition);
        return;
    }
}
exports.createParentNode = createParentNode;
function launchQuickPick(options) {
    if (!options) {
        showQuickPick(false);
    }
    else {
        showQuickPick(true);
    }
}
exports.launchQuickPick = launchQuickPick;
//# sourceMappingURL=yaml-controller.js.map