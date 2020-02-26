"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * TODO: Update functions to remove interaction with the VSCode editor, to allow for unit testing of functionality.
 * TODO: Add function comments
 * TODO: Use common support functions instead of repetitious calls to VSCode directly.
 */
const vscode = require("vscode");
const list_type_1 = require("../constants/list-type");
const common = require("./common");
const line_object_model_1 = require("./line-object-model");
const list_object_model_1 = require("./list-object-model");
exports.numberedListRegex = /^( )*[0-9]+\.( )/;
exports.alphabetListRegex = /^( )*[a-z]{1}\.( )/;
exports.bulletedListRegex = /^( )*\-( )/;
exports.numberedListWithIndentRegexTemplate = "^( ){{0}}[0-9]+\\.( )";
exports.alphabetListWithIndentRegexTemplate = "^( ){{0}}[a-z]{1}\\.( )";
exports.fixedBulletedListRegex = /^( )*\-( )$/;
exports.fixedNumberedListWithIndentRegexTemplate = "^( ){{0}}[0-9]+\\.( )$";
exports.fixedAlphabetListWithIndentRegexTemplate = "^( ){{0}}[a-z]{1}\\.( )$";
exports.startAlphabet = "a";
exports.numberedListValue = "1";
exports.tabPattern = "    ";
/**
 * Creates a list(numbered or bulleted) in the vscode editor.
 */
function insertList(editor, listType) {
    const cursorPosition = editor.selection.active;
    const lineText = editor.document.lineAt(cursorPosition.line).text;
    const listObjectModel = createListObjectModel(editor);
    let previousOuterNumbered = listObjectModel.previousOuter != null && listType === list_type_1.ListType.Numbered ? listObjectModel.previousOuter.listNumber : 0;
    let previousNestedNumbered = exports.startAlphabet.charCodeAt(0) - 1;
    const endInnerListedLine = listObjectModel.nextNested != null ? listObjectModel.nextNested.line : cursorPosition.line;
    const indentCount = CountIndent(lineText);
    let newNumberedLines = [];
    if (indentCount > 0 && indentCount !== 4) {
        newNumberedLines.push(listType === list_type_1.ListType.Numbered ? " ".repeat(indentCount) + "1. " : " ".repeat(indentCount) + "- ");
        insertEmptyList(editor, newNumberedLines.join("\n"));
        common.setCursorPosition(editor, cursorPosition.line, newNumberedLines[0].length);
    }
    else {
        if (indentCount === 0) {
            const newlineText = listType === list_type_1.ListType.Numbered ? ++previousOuterNumbered + ". " : "- ";
            newNumberedLines.push(newlineText);
        }
        else {
            const newlineText = listType === list_type_1.ListType.Numbered ? exports.tabPattern + String.fromCharCode(++previousNestedNumbered) + ". " : exports.tabPattern + "- ";
            newNumberedLines.push(newlineText);
        }
        const updatedInnerListed = updateOrderedNumberedList(editor, cursorPosition.line + 1, endInnerListedLine, previousNestedNumbered, exports.tabPattern.length, list_type_1.ListType.Alphabet);
        const updatedOuterListed = updateOrderedNumberedList(editor, endInnerListedLine + 1, editor.document.lineCount - 1, previousOuterNumbered, 0, list_type_1.ListType.Numbered);
        newNumberedLines = newNumberedLines.concat(updatedInnerListed).concat(updatedOuterListed);
        const endLine = cursorPosition.line + updatedInnerListed.length + updatedOuterListed.length;
        const range = new vscode.Range(cursorPosition.line, 0, endLine, editor.document.lineAt(endLine).text.length);
        common.insertContentToEditor(editor, insertList.name, newNumberedLines.join("\n"), true, range);
        common.setCursorPosition(editor, cursorPosition.line, newNumberedLines[0].length);
    }
}
exports.insertList = insertList;
/**
 * Created a number list from existing text.
 */
function createNumberedListFromText(editor) {
    const listObjectModel = createListObjectModel(editor);
    const startSelected = editor.selection.start;
    const endSelected = editor.selection.end;
    let previousNestedListNumbered = listObjectModel.previousNested != null ? listObjectModel.previousNested.listNumber : exports.startAlphabet.charCodeAt(0) - 1;
    let previousNestedListType = listObjectModel.previousNested != null ? listObjectModel.previousNested.listType : list_type_1.ListType.Alphabet;
    const numberedListLines = [];
    const casetype = createNumberedListCaseType(editor, list_type_1.ListType.Numbered);
    // Update selected text
    for (let i = startSelected.line; i <= endSelected.line; i++) {
        let lineText = editor.document.lineAt(i).text;
        const indentCount = CountIndent(lineText);
        const numberedListType = getListTypeOfNumberedList(lineText);
        if (lineText.trim().length === 0) {
            numberedListLines.push(lineText);
            // previousOuterNumbered = 0;
            previousNestedListNumbered = exports.startAlphabet.charCodeAt(0) - 1;
            previousNestedListType = list_type_1.ListType.Alphabet;
            continue;
        }
        lineText = getTextOfNumberedList(lineText, numberedListType);
        switch (casetype) {
            case CaseType.TextType:
                numberedListLines.push(lineText);
                break;
            case CaseType.UnIndentNestedType:
                numberedListLines.push(exports.numberedListValue + ". " + lineText);
                break;
            case CaseType.IndentType:
                if (indentCount === 0) {
                    numberedListLines.push(exports.numberedListValue + ". " + lineText);
                    previousNestedListNumbered = exports.startAlphabet.charCodeAt(0) - 1;
                    previousNestedListType = list_type_1.ListType.Alphabet;
                }
                else {
                    if (previousNestedListType === list_type_1.ListType.Numbered) {
                        numberedListLines.push(exports.tabPattern + ++previousNestedListNumbered + ". " + lineText);
                    }
                    else if (previousNestedListType === list_type_1.ListType.Alphabet) {
                        numberedListLines.push(exports.tabPattern + String.fromCharCode(++previousNestedListNumbered) + ". " + lineText);
                    }
                    else {
                        numberedListLines.push(exports.tabPattern + lineText);
                    }
                }
                break;
        }
    }
    if (casetype === CaseType.TextType) {
        // previousOuterNumbered = 0;
        previousNestedListNumbered = exports.startAlphabet.charCodeAt(0) - 1;
        previousNestedListType = list_type_1.ListType.Alphabet;
    }
    else if (casetype === CaseType.UnIndentNestedType) {
        previousNestedListNumbered = exports.startAlphabet.charCodeAt(0) - 1;
        previousNestedListType = list_type_1.ListType.Alphabet;
    }
    const newSelection = new vscode.Selection(new vscode.Position(startSelected.line, 0), new vscode.Position(endSelected.line, numberedListLines[numberedListLines.length - 1].length));
    // const endInnerListedLine = listObjectModel.nextNested != null && CountIndent(editor.document.lineAt(endSelected.line).text) > 0 ? listObjectModel.nextNested.line : endSelected.line;
    const endLine = endSelected.line;
    const range = new vscode.Range(new vscode.Position(startSelected.line, 0), new vscode.Position(endLine, editor.document.lineAt(endLine).text.length));
    common.insertContentToEditor(editor, createNumberedListFromText.name, numberedListLines.join("\n"), true, range);
    editor.selection = newSelection;
}
exports.createNumberedListFromText = createNumberedListFromText;
function updateOrderedNumberedList(editor, startLine, endLine, currentNumber, indentCount, listType) {
    const newNumberedLines = [];
    for (let lineNumber = startLine; lineNumber <= endLine; lineNumber++) {
        const lineText = editor.document.lineAt(lineNumber).text;
        if (lineText.trim() === "") {
            break;
        }
        const lineTextIndentCount = CountIndent(lineText);
        const lineTextListType = getListTypeOfNumberedList(lineText);
        if (lineTextIndentCount === indentCount && (lineTextListType === list_type_1.ListType.Numbered || lineTextListType === list_type_1.ListType.Alphabet)) {
            const newlineText = " ".repeat(indentCount) + (listType === list_type_1.ListType.Numbered ? "1" : "1") + ". " + getTextOfNumberedList(lineText, lineTextListType);
            newNumberedLines.push(newlineText);
        }
        else {
            newNumberedLines.push(lineText);
            if (lineTextIndentCount === indentCount) {
                currentNumber = listType === list_type_1.ListType.Numbered ? 0 : exports.startAlphabet.charCodeAt(0) - 1;
            }
        }
    }
    return newNumberedLines;
}
exports.updateOrderedNumberedList = updateOrderedNumberedList;
function updateNumberedList(editor, startLine, endLine, currentNumber, indent, isNested) {
    let lineNumber = startLine;
    const newNumberedLines = [];
    // Update only the numbered list which is the indent are the same
    const regex = new RegExp(exports.numberedListWithIndentRegexTemplate.replace("{0}", indent.length.toString()));
    for (; lineNumber <= endLine; lineNumber++) {
        let lineText = editor.document.lineAt(lineNumber).text;
        if (lineText.trim() === "") {
            break;
        }
        if (getNumberedLineWithRegex(regex, lineText) > 0 || (isNested && editor.selection.start.line === lineNumber)) {
            lineText = lineText.substring(lineText.indexOf(".", 0) + 1, lineText.length).trim();
            newNumberedLines.push(indent + (exports.numberedListValue) + ". " + lineText);
        }
        else {
            newNumberedLines.push(lineText);
        }
    }
    return newNumberedLines;
}
exports.updateNumberedList = updateNumberedList;
/**
 * Update the nested list of numbers.
 * @param {vscode.TextEditor} editor - The document associated with this text editor.
 * @param {number} startLine - Numbered list start the index of the line.
 * @param {number} endLine - Numbered list end the index of the line.
 * @param {number} currentLineCode - The current line of the number/alphabet number of the char code.
 * @param {string} indent - Indent string.
 * @param {enum} listType - Numbered list of types.
 */
function updateNestedNumberedList(editor, startLine, endLine, currentLineCode, indent, listType) {
    const newNumberedLines = [];
    for (let lineNumber = startLine; lineNumber <= endLine; lineNumber++) {
        const lineText = editor.document.lineAt(lineNumber).text;
        if (lineText.trim() === "") {
            break;
        }
        const lineListType = getListTypeOfNumberedList(lineText);
        switch (listType) {
            case list_type_1.ListType.Numbered:
                if (lineListType === list_type_1.ListType.Numbered || lineListType === list_type_1.ListType.Alphabet) {
                    newNumberedLines.push(indent + ++currentLineCode + ". " + getTextOfNumberedList(lineText, lineListType));
                }
                else {
                    newNumberedLines.push(lineText);
                    if (CountIndent(lineText) === indent.length) {
                        currentLineCode = 0;
                    }
                }
                break;
            case list_type_1.ListType.Alphabet:
                if (lineListType === list_type_1.ListType.Numbered || lineListType === list_type_1.ListType.Alphabet) {
                    newNumberedLines.push(indent + String.fromCharCode(++currentLineCode) + ". " + getTextOfNumberedList(lineText, lineListType));
                }
                else {
                    newNumberedLines.push(lineText);
                    if (CountIndent(lineText) === indent.length) {
                        currentLineCode = exports.startAlphabet.charCodeAt(0) - 1;
                    }
                }
                break;
            case list_type_1.ListType.Bulleted:
                newNumberedLines.push(indent + "- " + getTextOfNumberedList(lineText, lineListType));
                break;
        }
    }
    return newNumberedLines;
}
exports.updateNestedNumberedList = updateNestedNumberedList;
function getNumberTextOfNumberedList(text, listType) {
    switch (listType) {
        case list_type_1.ListType.Numbered:
        case list_type_1.ListType.Alphabet:
            text = text.substring(0, text.indexOf(".")).trim();
            break;
        case list_type_1.ListType.Bulleted:
            text = text.substring(0, text.indexOf("-")).trim();
            break;
    }
    return text;
}
exports.getNumberTextOfNumberedList = getNumberTextOfNumberedList;
function getTextOfNumberedList(text, listType) {
    switch (listType) {
        case list_type_1.ListType.Numbered:
        case list_type_1.ListType.Alphabet:
            text = text.substring(text.indexOf(".") + 2);
            break;
        case list_type_1.ListType.Bulleted:
            text = text.substring(text.indexOf("-") + 2);
            break;
        case list_type_1.ListType.Other:
            text = text.substring(CountIndent(text));
            break;
    }
    return text;
}
exports.getTextOfNumberedList = getTextOfNumberedList;
function getListTypeOfNumberedList(text) {
    let listType;
    if (exports.numberedListRegex.test(text)) {
        listType = list_type_1.ListType.Numbered;
    }
    else if (exports.alphabetListRegex.test(text)) {
        listType = list_type_1.ListType.Alphabet;
    }
    else if (exports.bulletedListRegex.test(text)) {
        listType = list_type_1.ListType.Bulleted;
    }
    else {
        listType = list_type_1.ListType.Other;
    }
    return listType;
}
exports.getListTypeOfNumberedList = getListTypeOfNumberedList;
function updateNestedAlphabetList(editor, startLine, endLine, currentAlphabet, indent) {
    let lineNumber = startLine;
    const newAlphabetLines = [];
    // const numberRegex = new RegExp(numberedListWithIndentRegexTemplate.replace("{0}", indent.length.toString()));
    const alphabetRegex = new RegExp(exports.alphabetListWithIndentRegexTemplate.replace("{0}", indent.length.toString()));
    for (; lineNumber <= endLine; lineNumber++) {
        let lineText = editor.document.lineAt(lineNumber).text;
        if (lineText.trim() === "") {
            break;
        }
        if (getAlphabetLineWithRegex(alphabetRegex, lineText) > 0 || editor.selection.start.line === lineNumber) {
            lineText = lineText.substring(lineText.indexOf(".", 0) + 1, lineText.length).trim();
            newAlphabetLines.push(indent + String.fromCharCode(++currentAlphabet) + ". " + lineText);
        }
        else {
            newAlphabetLines.push(lineText);
        }
    }
    return newAlphabetLines;
}
exports.updateNestedAlphabetList = updateNestedAlphabetList;
/**
 * Creates a new bulleted list from the current selection.
 * @param {vscode.TextEditor} editor - the current vscode active editor.
 */
function createBulletedListFromText(editor) {
    const startSelected = editor.selection.start;
    const endSelected = editor.selection.end;
    const numberedListLines = [];
    const casetype = createNumberedListCaseType(editor, list_type_1.ListType.Bulleted);
    for (let line = startSelected.line; line <= endSelected.line; line++) {
        let lineText = editor.document.lineAt(line).text;
        if (lineText.trim() === "") {
            numberedListLines.push(lineText);
            continue;
        }
        const indentCount = CountIndent(lineText);
        const numberedListType = getListTypeOfNumberedList(lineText);
        lineText = getTextOfNumberedList(lineText, numberedListType);
        switch (casetype) {
            case CaseType.TextType:
                numberedListLines.push(lineText);
                break;
            case CaseType.UnIndentNestedType:
                numberedListLines.push("- " + lineText);
                break;
            case CaseType.IndentType:
                if (indentCount === 0) {
                    numberedListLines.push("- " + lineText);
                }
                else {
                    numberedListLines.push(exports.tabPattern + "- " + lineText);
                }
                break;
        }
    }
    /*     if (casetype === CaseType.TextType || casetype === CaseType.UnIndentNestedType) {
        } */
    const newSelection = new vscode.Selection(new vscode.Position(startSelected.line, 0), new vscode.Position(endSelected.line, numberedListLines[numberedListLines.length - 1].length));
    const endLine = endSelected.line;
    const range = new vscode.Range(new vscode.Position(startSelected.line, 0), new vscode.Position(endLine, editor.document.lineAt(endLine).text.length));
    common.insertContentToEditor(editor, createBulletedListFromText.name, numberedListLines.join("\n"), true, range);
    editor.selection = newSelection;
}
exports.createBulletedListFromText = createBulletedListFromText;
function checkEmptyLine(editor) {
    const cursorPosition = editor.selection.active;
    const selectedLine = editor.document.lineAt(cursorPosition);
    return editor.selection.isEmpty && selectedLine.text.trim() === "";
}
exports.checkEmptyLine = checkEmptyLine;
function checkEmptySelection(editor) {
    for (let i = editor.selection.start.line; i <= editor.selection.end.line; i++) {
        if (!editor.document.lineAt(i).isEmptyOrWhitespace) {
            return false;
        }
    }
    return true;
}
exports.checkEmptySelection = checkEmptySelection;
function insertEmptyList(editor, list) {
    const cursorPosition = editor.selection.active;
    editor.edit((update) => {
        update.insert(cursorPosition.with(cursorPosition.line, 0), list);
    });
}
exports.insertEmptyList = insertEmptyList;
function isBulletedLine(text) {
    return (text.trim() !== "" && (text.trim() === "-" || text.substring(0, 2) === "- "));
}
exports.isBulletedLine = isBulletedLine;
/**
 * Get the list line number.
 * @param {vscode.TextEditor} editor - The document associated with this text editor.
 * @param {number} line - A line number in [0, lineCount].
 * @param {enum} listType - Numbered list of types.
 * @param {number} start - The zero-based index number indicating the beginning of the substring.
 */
function getListLineNumber(editor, line, listType, start) {
    if (line > -1 && line < editor.document.lineCount) {
        const text = start == null ? editor.document.lineAt(line).text : editor.document.lineAt(line).text.substring(start);
        switch (listType) {
            case list_type_1.ListType.Numbered:
                return getNumberedLine(text);
            case list_type_1.ListType.Alphabet:
                return getAlphabetLine(text);
            case list_type_1.ListType.Bulleted:
                return getBulletedLine(text);
        }
    }
    return -1;
}
exports.getListLineNumber = getListLineNumber;
function getNumberedLine(text) {
    const match = exports.numberedListRegex.exec(text);
    if (match != null) {
        const numbered = match[0].split(".")[0];
        return +numbered;
    }
    return -1;
}
exports.getNumberedLine = getNumberedLine;
function getNumberedLineWithRegex(regex, text) {
    const match = regex.exec(text);
    if (match != null) {
        const numbered = match[0].split(".")[0];
        return +numbered;
    }
    return -1;
}
exports.getNumberedLineWithRegex = getNumberedLineWithRegex;
function getAlphabetLine(text) {
    const match = exports.alphabetListRegex.exec(text);
    if (match != null) {
        const alphabet = match[0].split(".")[0].trim();
        return alphabet.charCodeAt(0) < "z".charCodeAt(0) ? alphabet.charCodeAt(0) : -1;
    }
    return -1;
}
exports.getAlphabetLine = getAlphabetLine;
function getAlphabetLineWithRegex(regex, text) {
    const match = regex.exec(text);
    if (match != null) {
        const alphabet = match[0].split(".")[0].trim();
        return alphabet.charCodeAt(0) < "z".charCodeAt(0) ? alphabet.charCodeAt(0) : -1;
    }
    return -1;
}
exports.getAlphabetLineWithRegex = getAlphabetLineWithRegex;
function getBulletedLine(text) {
    const match = exports.bulletedListRegex.exec(text);
    if (match != null) {
        return "-".charCodeAt(0);
    }
    return -1;
}
exports.getBulletedLine = getBulletedLine;
function addIndent(line) {
    const stringTrim = line.trim();
    return line.substring(0, line.indexOf(stringTrim));
}
exports.addIndent = addIndent;
function CountIndent(text) {
    // tslint:disable-next-line:no-var-keyword
    for (var i = 0; i < text.length; i++) {
        if (text[i] !== " ") {
            return i;
        }
    }
    return i;
}
exports.CountIndent = CountIndent;
function findCurrentNumberedListNextLine(editor, currentLine) {
    const nextLine = 0;
    if (currentLine >= editor.document.lineCount) {
        return nextLine;
    }
    const indentCount = CountIndent(editor.document.lineAt(currentLine).text);
    const regex = new RegExp(exports.numberedListWithIndentRegexTemplate.replace("{0}", indentCount.toString()));
    while (++currentLine < editor.document.lineCount && editor.document.lineAt(currentLine).text.trim() !== "") {
        // tslint:disable-next-line:variable-name
        const number = getNumberedLineWithRegex(regex, editor.document.lineAt(currentLine).text);
        if (number > 0) {
            return currentLine;
        }
    }
    return nextLine;
}
exports.findCurrentNumberedListNextLine = findCurrentNumberedListNextLine;
function findCurrentAlphabetListNextLine(editor, currentLine) {
    const nextLine = 0;
    if (currentLine >= editor.document.lineCount) {
        return nextLine;
    }
    const indentCount = CountIndent(editor.document.lineAt(currentLine).text);
    const regex = new RegExp(exports.alphabetListWithIndentRegexTemplate.replace("{0}", indentCount.toString()));
    while (++currentLine < editor.document.lineCount && editor.document.lineAt(currentLine).text.trim() !== "") {
        // tslint:disable-next-line:variable-name
        const number = getAlphabetLineWithRegex(regex, editor.document.lineAt(currentLine).text);
        if (number > 0) {
            return currentLine;
        }
    }
    return nextLine;
}
exports.findCurrentAlphabetListNextLine = findCurrentAlphabetListNextLine;
function findCurrentNumberedListLastLine(editor, currentLine, indentAdjust) {
    let lastLine = -1;
    if (currentLine >= editor.document.lineCount) {
        return lastLine;
    }
    let indentCount = CountIndent(editor.document.lineAt(currentLine).text);
    if (indentAdjust != null) {
        indentCount = indentCount - indentAdjust;
    }
    while (++currentLine < editor.document.lineCount && editor.document.lineAt(currentLine).text.trim() !== "") {
        const regex = new RegExp(exports.numberedListWithIndentRegexTemplate.replace("{0}", indentCount.toString()));
        // tslint:disable-next-line:variable-name
        const number = getNumberedLineWithRegex(regex, editor.document.lineAt(currentLine).text);
        if (number > 0) {
            lastLine = currentLine;
        }
    }
    return lastLine;
}
exports.findCurrentNumberedListLastLine = findCurrentNumberedListLastLine;
function findCurrentAlphabetListLastLine(editor, currentLine) {
    if (currentLine >= editor.document.lineCount) {
        return editor.document.lineCount - 1;
    }
    const indentCount = CountIndent(editor.document.lineAt(currentLine).text);
    while (currentLine < editor.document.lineCount && editor.document.lineAt(currentLine).text.trim() !== "") {
        const regex = new RegExp(exports.alphabetListWithIndentRegexTemplate.replace("{0}", indentCount.toString()));
        if (getAlphabetLineWithRegex(regex, editor.document.lineAt(currentLine).text) > 0 || editor.selection.start.line === currentLine) {
            currentLine++;
        }
        else {
            break;
        }
    }
    return currentLine - 1;
}
exports.findCurrentAlphabetListLastLine = findCurrentAlphabetListLastLine;
// Find the previous number in current indent
function findCurrentNumberedListPreviousNumber(editor, currentLine, indentAdjust) {
    let previousListNumbered = 0;
    if (currentLine >= editor.document.lineCount) {
        return previousListNumbered;
    }
    let indentCount = CountIndent(editor.document.lineAt(currentLine).text);
    if (indentAdjust != null) {
        indentCount = indentCount - indentAdjust;
    }
    const regex = new RegExp(exports.numberedListWithIndentRegexTemplate.replace("{0}", indentCount.toString()));
    while (--currentLine >= 0 && editor.document.lineAt(currentLine).text.trim() !== "") {
        previousListNumbered = getNumberedLineWithRegex(regex, editor.document.lineAt(currentLine).text);
        previousListNumbered = previousListNumbered !== -1 ? previousListNumbered : 0;
        if (previousListNumbered > 0) {
            return previousListNumbered;
        }
    }
    return previousListNumbered;
}
exports.findCurrentNumberedListPreviousNumber = findCurrentNumberedListPreviousNumber;
function autolistAlpha(editor, cursorPosition, alphabet) {
    // Check numbered block
    const lineNumber = cursorPosition.line;
    const firstLine = editor.document.lineAt(lineNumber).text.substring(cursorPosition.character, editor.document.lineAt(lineNumber).text.length);
    const indentCount = CountIndent(editor.document.lineAt(lineNumber).text);
    const indent = " ".repeat(indentCount);
    let alphabetLines = [];
    // Add a new line
    alphabetLines.push("\n" + indent + exports.numberedListValue + ". " + firstLine);
    const listObjectModel = createListObjectModel(editor);
    const endInnerListedLine = listObjectModel.nextNested != null && indentCount > 0 ? listObjectModel.nextNested.line : lineNumber;
    const previousOuterNumbered = listObjectModel.previousOuter != null ? listObjectModel.previousOuter.listNumber : 0;
    const updatedInnerListed = updateOrderedNumberedList(editor, lineNumber + 1, endInnerListedLine, alphabet, indentCount, list_type_1.ListType.Alphabet);
    const updatedOuterListed = updateOrderedNumberedList(editor, endInnerListedLine + 1, editor.document.lineCount - 1, previousOuterNumbered, 0, list_type_1.ListType.Numbered);
    alphabetLines = alphabetLines.concat(updatedInnerListed).concat(updatedOuterListed);
    const endLine = lineNumber + updatedInnerListed.length + updatedOuterListed.length;
    // Replace editer's text and range assignment
    const range = new vscode.Range(lineNumber, cursorPosition.character, endLine, editor.document.lineAt(endLine).text.length);
    const replacementText = alphabetLines.join("\n");
    common.insertContentToEditor(editor, autolistAlpha.name, replacementText, true, range);
    // set cursor position
    common.setCursorPosition(editor, lineNumber + 1, String.fromCharCode(alphabet).toString().length + indentCount + 2);
}
exports.autolistAlpha = autolistAlpha;
function autolistNumbered(editor, cursorPosition, numbered) {
    // Check numbered block
    const lineNumber = cursorPosition.line;
    const firstLine = editor.document.lineAt(cursorPosition.line).text.substring(cursorPosition.character, editor.document.lineAt(cursorPosition.line).text.length);
    const indentCount = CountIndent(editor.document.lineAt(cursorPosition.line).text);
    const indent = " ".repeat(indentCount);
    let numberedLines = [];
    // Add a new line
    numberedLines.push("\n" + indent + exports.numberedListValue + ". " + firstLine);
    const listObjectModel = createListObjectModel(editor);
    const endInnerListedLine = listObjectModel.nextNested != null && indentCount > 0 ? listObjectModel.nextNested.line : lineNumber;
    let previousOuterNumbered = 0;
    if (indentCount === 0) {
        previousOuterNumbered = numbered;
    }
    else if (listObjectModel.previousOuter != null) {
        previousOuterNumbered = listObjectModel.previousOuter.listNumber;
    }
    const updatedInnerListed = updateOrderedNumberedList(editor, lineNumber + 1, endInnerListedLine, numbered, indentCount, list_type_1.ListType.Numbered);
    const updatedOuterListed = updateOrderedNumberedList(editor, endInnerListedLine + 1, editor.document.lineCount - 1, previousOuterNumbered, 0, list_type_1.ListType.Numbered);
    numberedLines = numberedLines.concat(updatedInnerListed).concat(updatedOuterListed);
    const endLine = lineNumber + updatedInnerListed.length + updatedOuterListed.length;
    const range = new vscode.Range(cursorPosition.line, cursorPosition.character, endLine, editor.document.lineAt(endLine).text.length);
    common.insertContentToEditor(editor, autolistAlpha.name, numberedLines.join("\n"), true, range);
    // set cursor position
    common.setCursorPosition(editor, cursorPosition.line + 1, (numbered).toString().length + indentCount + 2);
}
exports.autolistNumbered = autolistNumbered;
function nestedNumberedList(editor, cursorPosition, indentCount) {
    const previousLine = cursorPosition.line - 1;
    const nextLine = cursorPosition.line + 1;
    const previousInnerNumbered = getListLineNumber(editor, previousLine, list_type_1.ListType.Numbered, cursorPosition.character);
    const previousaphabet = getListLineNumber(editor, previousLine, list_type_1.ListType.Alphabet, cursorPosition.character);
    const nextnumbered = getListLineNumber(editor, nextLine, list_type_1.ListType.Numbered, cursorPosition.character);
    const nextalphabet = getListLineNumber(editor, nextLine, list_type_1.ListType.Alphabet, cursorPosition.character);
    const newIndentCount = CountIndent(exports.tabPattern + editor.document.lineAt(cursorPosition.line).text);
    let cursorIndex = (exports.tabPattern + exports.tabPattern.repeat(indentCount) + exports.startAlphabet + ". ").length;
    // When have next/previous inner number list
    if (previousInnerNumbered > 0 || (previousaphabet <= 0 && nextnumbered > 0)) {
        const listObjectModel = createListObjectModel(editor);
        const previousOuterNumbered = listObjectModel.previousOuter != null ? listObjectModel.previousOuter.listNumber : 0;
        const numbered = previousInnerNumbered > 0 ? previousInnerNumbered : 0;
        const endInnerListedLine = listObjectModel.nextNested != null ? listObjectModel.nextNested.line : cursorPosition.line;
        const endOuterListedLine = listObjectModel.nextOuter != null ? listObjectModel.nextOuter.line : endInnerListedLine;
        // Update inner numbered list
        const updatedInnerListed = updateNestedNumberedList(editor, cursorPosition.line, endInnerListedLine, numbered, exports.tabPattern.repeat(newIndentCount / 4), list_type_1.ListType.Numbered);
        const updatedOuterListed = updateOrderedNumberedList(editor, endInnerListedLine + 1, endOuterListedLine, previousOuterNumbered, indentCount, list_type_1.ListType.Numbered);
        const updatedListedText = updatedInnerListed.concat(updatedOuterListed).length > 0 ? updatedInnerListed.concat(updatedOuterListed).join("\n") : "";
        const range = new vscode.Range(cursorPosition.line, 0, endOuterListedLine, editor.document.lineAt(endOuterListedLine).text.length);
        common.insertContentToEditor(editor, nestedNumberedList.name, updatedListedText, true, range);
        cursorIndex = updatedInnerListed.length > 0 ? updatedInnerListed[0].indexOf(". ") + 2 : cursorIndex;
    }
    else if (previousaphabet > 0 || nextalphabet > 0) {
        const listObjectModel = createListObjectModel(editor);
        const previousOuterNumbered = listObjectModel.previousOuter != null ? listObjectModel.previousOuter.listNumber : 0;
        const alphabet = previousaphabet > 0 ? previousaphabet : exports.startAlphabet.charCodeAt(0) - 1;
        const endInnerListedLine = listObjectModel.nextNested != null ? listObjectModel.nextNested.line : cursorPosition.line;
        const endOuterListedLine = listObjectModel.nextOuter != null ? listObjectModel.nextOuter.line : endInnerListedLine;
        // Update inner alphabet list
        const updatedInnerListed = updateNestedNumberedList(editor, cursorPosition.line, endInnerListedLine, alphabet, exports.tabPattern.repeat(newIndentCount / 4), list_type_1.ListType.Alphabet);
        const updatedOuterListed = updateOrderedNumberedList(editor, endInnerListedLine + 1, endOuterListedLine, previousOuterNumbered, indentCount, list_type_1.ListType.Numbered);
        const updatedListedText = updatedInnerListed.concat(updatedOuterListed).length > 0 ? updatedInnerListed.concat(updatedOuterListed).join("\n") : "";
        const range = new vscode.Range(cursorPosition.line, 0, endOuterListedLine, editor.document.lineAt(endOuterListedLine).text.length);
        common.insertContentToEditor(editor, nestedNumberedList.name, updatedListedText, true, range);
    }
    else {
        const lineText = editor.document.lineAt(cursorPosition.line).text;
        const lineCount = CountIndent(lineText);
        const listObjectModel = createListObjectModel(editor);
        let previousOuterNumbered = listObjectModel.previousOuter != null ? listObjectModel.previousOuter.listNumber : 0;
        let previousOuterListType = list_type_1.ListType.Numbered;
        let previousNestedNumbered = listObjectModel.previousNested != null ? listObjectModel.previousNested.listNumber : exports.startAlphabet.charCodeAt(0) - 1;
        let previousNestedListType = listObjectModel.previousNested != null ? listObjectModel.previousNested.listType : list_type_1.ListType.Alphabet;
        let endInnerListedLine = listObjectModel.nextNested != null ? listObjectModel.nextNested.line : cursorPosition.line;
        let endOuterListedLine = listObjectModel.nextOuter != null ? listObjectModel.nextOuter.line : endInnerListedLine;
        let numberedListLines = [];
        const lineTextListType = getListTypeOfNumberedList(lineText);
        // const lineTextListNumbered = getNumberTextOfNumberedList(lineText, lineTextListType);
        switch (lineTextListType) {
            case list_type_1.ListType.Numbered:
            case list_type_1.ListType.Alphabet:
                let newNumber = exports.numberedListValue;
                if (lineCount === 0) {
                    newNumber = exports.numberedListValue;
                }
                let newLineText = " ".repeat(newIndentCount) + (newNumber) + ". " + getTextOfNumberedList(lineText, lineTextListType);
                numberedListLines.push(newLineText);
                break;
            case list_type_1.ListType.Bulleted:
            case list_type_1.ListType.Other:
                newLineText = " ".repeat(newIndentCount) + getNumberTextOfNumberedList(lineText, lineTextListType) + getTextOfNumberedList(lineText, lineTextListType);
                if (lineCount === 0) {
                    previousNestedNumbered = exports.startAlphabet.charCodeAt(0) - 1;
                    previousNestedListType = list_type_1.ListType.Alphabet;
                }
                break;
        }
        if (lineCount > 0) {
            endOuterListedLine = endInnerListedLine;
            previousOuterNumbered = previousNestedNumbered;
            previousOuterListType = previousNestedListType;
            endInnerListedLine = cursorPosition.line;
            previousNestedNumbered = exports.startAlphabet.charCodeAt(0) - 1;
            previousNestedListType = list_type_1.ListType.Alphabet;
        }
        const updatedInnerListed = updateNestedNumberedList(editor, cursorPosition.line + 1, endInnerListedLine, previousNestedNumbered, exports.tabPattern.repeat(newIndentCount / 4), previousNestedListType);
        const updatedOuterListed = updateOrderedNumberedList(editor, endInnerListedLine + 1, endOuterListedLine, previousOuterNumbered, indentCount, previousOuterListType);
        numberedListLines = numberedListLines.concat(updatedInnerListed.concat(updatedOuterListed));
        cursorIndex = cursorPosition.character + numberedListLines[0].length - lineText.length;
        const range = new vscode.Range(cursorPosition.line, 0, endOuterListedLine, editor.document.lineAt(endOuterListedLine).text.length);
        common.insertContentToEditor(editor, nestedNumberedList.name, numberedListLines.join("\n"), true, range);
    }
    // set cursor position
    common.setCursorPosition(editor, cursorPosition.line, cursorIndex > 0 ? cursorIndex : 0);
}
exports.nestedNumberedList = nestedNumberedList;
function removeNestedListSingleLine(editor) {
    const cursorPosition = editor.selection.active;
    const startSelected = editor.selection.start;
    const endSelected = editor.selection.end;
    const text = editor.document.getText(new vscode.Range(cursorPosition.with(cursorPosition.line, 0), cursorPosition.with(cursorPosition.line, endSelected.character)));
    const indentCount = CountIndent(editor.document.lineAt(cursorPosition.line).text);
    const numberedRegex = new RegExp(exports.fixedNumberedListWithIndentRegexTemplate.replace("{0}", indentCount.toString()));
    const alphabetRegex = new RegExp(exports.fixedAlphabetListWithIndentRegexTemplate.replace("{0}", indentCount.toString()));
    // If it contain number or bullet list
    if (exports.fixedBulletedListRegex.exec(text) != null) {
        if (indentCount >= 4) {
            editor.edit((update) => {
                update.delete(new vscode.Range(cursorPosition.with(cursorPosition.line, 0), cursorPosition.with(cursorPosition.line, 4)));
            });
        }
        else if (indentCount < 4) {
            editor.edit((update) => {
                update.delete(new vscode.Range(cursorPosition.with(cursorPosition.line, 0), cursorPosition.with(cursorPosition.line, endSelected.character)));
            });
        }
    }
    else if (getNumberedLineWithRegex(numberedRegex, text) > 0) {
        if (indentCount >= 4) {
            const listObjectModel = createListObjectModel(editor);
            const previousOuterNumbered = listObjectModel.previousOuter != null ? listObjectModel.previousOuter.listNumber : 0;
            let previousNestedNumbered = exports.startAlphabet.charCodeAt(0) - 1;
            let previousNestedListType = list_type_1.ListType.Alphabet;
            if (cursorPosition.line < editor.document.lineCount - 1) {
                const nextLineText = editor.document.lineAt(cursorPosition.line + 1).text;
                const nextListType = getListTypeOfNumberedList(nextLineText);
                if (CountIndent(nextLineText) === exports.tabPattern.length && nextListType === list_type_1.ListType.Numbered) {
                    previousNestedListType = list_type_1.ListType.Numbered;
                    previousNestedNumbered = 0;
                }
            }
            const endInnerListedLine = listObjectModel.nextNested != null ? listObjectModel.nextNested.line : cursorPosition.line;
            const endOuterListedLine = listObjectModel.nextOuter != null ? listObjectModel.nextOuter.line : endInnerListedLine;
            const updatedListed = updateNumberedList(editor, cursorPosition.line, cursorPosition.line, previousOuterNumbered, exports.tabPattern.repeat((indentCount / 4) - 1), true);
            const updatedInnerListed = updateNestedNumberedList(editor, cursorPosition.line + 1, endInnerListedLine, previousNestedNumbered, exports.tabPattern.repeat(indentCount / 4), previousNestedListType);
            const updatedOuterListed = updateOrderedNumberedList(editor, endInnerListedLine + 1, endOuterListedLine, previousOuterNumbered, indentCount - exports.tabPattern.length, list_type_1.ListType.Numbered);
            const updatedListedText = updatedListed.concat(updatedInnerListed).concat(updatedOuterListed).length > 0 ? updatedListed.concat(updatedInnerListed).concat(updatedOuterListed).join("\n") : "";
            editor.edit((update) => {
                update.replace(new vscode.Range(cursorPosition.line, 0, endOuterListedLine, editor.document.lineAt(endOuterListedLine).text.length), updatedListedText);
            });
            const cursorIndex = updatedListed.length > 0 ? updatedListed[0].indexOf(". ") + 2 : cursorPosition.character - indentCount;
            common.setCursorPosition(editor, cursorPosition.line, cursorIndex);
        }
        else if (indentCount < 4) {
            let lineText = editor.document.lineAt(cursorPosition.line).text;
            lineText = lineText.substring(lineText.indexOf(".", 0) + 1, lineText.length).trim();
            let newNumberedLines = [lineText];
            const updatedOuterListed = updateOrderedNumberedList(editor, cursorPosition.line + 1, editor.document.lineCount - 1, 0, 0, list_type_1.ListType.Numbered);
            newNumberedLines = newNumberedLines.concat(updatedOuterListed);
            const endLine = cursorPosition.line + updatedOuterListed.length;
            const range = new vscode.Range(cursorPosition.line, 0, endLine, editor.document.lineAt(endLine).text.length);
            common.insertContentToEditor(editor, removeNestedListSingleLine.name, newNumberedLines.join("\n"), true, range);
            common.setSelectorPosition(editor, cursorPosition.line, 0, cursorPosition.line, 0);
        }
    }
    else if (getAlphabetLineWithRegex(alphabetRegex, text) > 0) {
        if (indentCount >= 4) {
            const listObjectModel = createListObjectModel(editor);
            let lineText = editor.document.lineAt(cursorPosition.line).text;
            lineText = lineText.substring(lineText.indexOf(".", 0) + 1, lineText.length).trim();
            const previousOuterNumbered = listObjectModel.previousOuter != null ? listObjectModel.previousOuter.listNumber : 0;
            const endInnerListedLine = listObjectModel.nextNested != null ? listObjectModel.nextNested.line : cursorPosition.line;
            const endOuterListedLine = listObjectModel.nextOuter != null ? listObjectModel.nextOuter.line : endInnerListedLine;
            const updatedListed = updateNumberedList(editor, cursorPosition.line, cursorPosition.line, previousOuterNumbered, exports.tabPattern.repeat((indentCount / 4) - 1), true);
            const updatedInnerListed = updateNestedNumberedList(editor, cursorPosition.line + 1, endInnerListedLine, exports.startAlphabet.charCodeAt(0) - 1, exports.tabPattern.repeat(indentCount / 4), list_type_1.ListType.Alphabet);
            const updatedOuterListed = updateOrderedNumberedList(editor, endInnerListedLine + 1, endOuterListedLine, previousOuterNumbered, indentCount - 4, list_type_1.ListType.Numbered);
            const updatedListedText = updatedListed.concat(updatedInnerListed).concat(updatedOuterListed).length > 0 ? updatedListed.concat(updatedInnerListed).concat(updatedOuterListed).join("\n") : "";
            editor.edit((update) => {
                update.replace(new vscode.Range(cursorPosition.line, 0, endOuterListedLine, editor.document.lineAt(endOuterListedLine).text.length), updatedListedText);
            });
            const cursorIndex = updatedListed.length > 0 ? updatedListed[0].indexOf(". ") + 2 : cursorPosition.character - indentCount;
            common.setCursorPosition(editor, cursorPosition.line, cursorIndex);
        }
        else if (indentCount < 4) {
            editor.edit((update) => {
                update.delete(new vscode.Range(cursorPosition.with(cursorPosition.line, 0), cursorPosition.with(cursorPosition.line, endSelected.character)));
            });
        }
    }
    else {
        // If selected text > 0
        if (Math.abs(endSelected.character - startSelected.character) > 0) {
            removeNestedListMultipleLine(editor);
        }
        else if (startSelected.character !== 0) {
            editor.edit((update) => {
                update.delete(new vscode.Range(cursorPosition.with(cursorPosition.line, startSelected.character - 1), cursorPosition.with(cursorPosition.line, startSelected.character)));
            });
        }
        else if (startSelected.character === 0) {
            if (startSelected.line !== 0) {
                const lineText = editor.document.lineAt(startSelected.line - 1).text;
                // Replace editor's text
                editor.edit((update) => {
                    update.replace(new vscode.Range(startSelected.line - 1, 0, endSelected.line, 0), lineText);
                });
            }
        }
    }
}
exports.removeNestedListSingleLine = removeNestedListSingleLine;
function removeNestedListMultipleLine(editor) {
    const startSelected = editor.selection.start;
    const endSelected = editor.selection.end;
    const numberedListLines = [];
    const startLineNotSelectedText = editor.document.lineAt(startSelected.line).text.substring(0, startSelected.character);
    const endLineNotSelectedText = editor.document.lineAt(endSelected.line).text.substring(endSelected.character);
    if (startLineNotSelectedText.trim().length > 0 || endLineNotSelectedText.trim().length > 0) {
        numberedListLines.push(endLineNotSelectedText);
    }
    const endLine = endSelected.line;
    const range = new vscode.Range(startSelected.line, startSelected.character, endLine, editor.document.lineAt(endLine).text.length);
    common.insertContentToEditor(editor, removeNestedListMultipleLine.name, numberedListLines.join("\n"), true, range);
    common.setCursorPosition(editor, startSelected.line, startSelected.character);
}
exports.removeNestedListMultipleLine = removeNestedListMultipleLine;
function createListObjectModel(editor) {
    const startPosition = editor.selection.start;
    const endPosition = editor.selection.end;
    let startLine = startPosition.line;
    const listObjectModel = new list_object_model_1.ListObjectModel();
    let flag = true;
    while (--startLine >= 0) {
        const lineText = editor.document.lineAt(startLine).text;
        const indentCount = CountIndent(lineText);
        const listType = getListTypeOfNumberedList(lineText);
        if (lineText.trim() === "") {
            break;
        }
        if (indentCount === 0) {
            if (listType === list_type_1.ListType.Numbered) {
                listObjectModel.previousOuter = createLineObjectModel(editor, startLine);
            }
            break;
        }
        if (flag && indentCount === exports.tabPattern.length) {
            if (listType === list_type_1.ListType.Numbered || listType === list_type_1.ListType.Alphabet) {
                listObjectModel.previousNested = createLineObjectModel(editor, startLine);
            }
            flag = false;
        }
    }
    let endLine = endPosition.line;
    flag = true;
    while (++endLine < editor.document.lineCount) {
        const lineText = editor.document.lineAt(endLine).text;
        const indentCount = CountIndent(lineText);
        if (lineText.trim() === "") {
            listObjectModel.nextOuter = createLineObjectModel(editor, endLine - 1);
            if (flag && listObjectModel.nextNested == null && CountIndent(editor.document.lineAt(endLine - 1).text) > 0) {
                listObjectModel.nextNested = createLineObjectModel(editor, endLine - 1);
            }
            break;
        }
        else if (endLine === editor.document.lineCount - 1) {
            listObjectModel.nextOuter = createLineObjectModel(editor, endLine);
            if (flag && listObjectModel.nextNested == null && indentCount > 0) {
                listObjectModel.nextNested = createLineObjectModel(editor, endLine);
            }
        }
        else if (flag && indentCount === 0) {
            if (CountIndent(editor.document.lineAt(endLine - 1).text) > 0) {
                listObjectModel.nextNested = createLineObjectModel(editor, endLine - 1);
            }
            flag = false;
        }
    }
    return listObjectModel;
}
exports.createListObjectModel = createListObjectModel;
function createLineObjectModel(editor, line) {
    if (line < 0 || line >= editor.document.lineCount) {
        return null;
    }
    const lineText = editor.document.lineAt(line).text;
    const indent = " ".repeat(CountIndent(lineText));
    const listType = getListTypeOfNumberedList(lineText);
    const listNumber = listType === list_type_1.ListType.Numbered ? +getNumberTextOfNumberedList(lineText, listType) : getNumberTextOfNumberedList(lineText, listType).charCodeAt(0);
    const listText = getTextOfNumberedList(lineText, listType);
    return new line_object_model_1.LineObjectModel(line, indent, listType, listNumber, listText);
}
exports.createLineObjectModel = createLineObjectModel;
function createNumberedListCaseType(editor, listType) {
    const startSelectedLine = editor.selection.start.line;
    const endSelectedLine = editor.selection.end.line;
    let isUnIndentNestedType = true;
    let isTextType = true;
    for (let line = startSelectedLine; line <= endSelectedLine; line++) {
        const lineText = editor.document.lineAt(line).text;
        if (lineText.trim() === "") {
            continue;
        }
        const lineCount = CountIndent(lineText);
        const lineListType = getListTypeOfNumberedList(lineText);
        switch (listType) {
            case list_type_1.ListType.Bulleted:
                if (lineCount > 0 || lineListType !== list_type_1.ListType.Bulleted) {
                    isTextType = false;
                    if ((lineCount === 0 && lineListType !== list_type_1.ListType.Bulleted) || lineCount !== exports.tabPattern.length || lineListType !== list_type_1.ListType.Bulleted) {
                        isUnIndentNestedType = false;
                        line = endSelectedLine + 1;
                    }
                }
                break;
            case list_type_1.ListType.Numbered:
                if (lineCount > 0 || lineListType !== list_type_1.ListType.Numbered) {
                    isTextType = false;
                    if ((lineCount === 0 && lineListType !== list_type_1.ListType.Numbered) || lineCount !== exports.tabPattern.length || (lineListType !== list_type_1.ListType.Numbered && lineListType !== list_type_1.ListType.Alphabet)) {
                        isUnIndentNestedType = false;
                        line = endSelectedLine + 1;
                    }
                }
                break;
        }
    }
    let caseType = CaseType.IndentType;
    if (isTextType) {
        caseType = CaseType.TextType;
    }
    else if (isUnIndentNestedType) {
        caseType = CaseType.UnIndentNestedType;
    }
    return caseType;
}
exports.createNumberedListCaseType = createNumberedListCaseType;
var CaseType;
(function (CaseType) {
    CaseType[CaseType["IndentType"] = 0] = "IndentType";
    CaseType[CaseType["UnIndentNestedType"] = 1] = "UnIndentNestedType";
    CaseType[CaseType["TextType"] = 2] = "TextType";
})(CaseType = exports.CaseType || (exports.CaseType = {}));
//# sourceMappingURL=list.js.map