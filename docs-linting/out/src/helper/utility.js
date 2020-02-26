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
const common = require("./common");
const highlight_langs_1 = require("./highlight-langs");
const log = require("./log");
/**
 * Checks the user input for table creation.
 * Format - C:R.
 * Columns and Rows cannot be 0 or negative.
 * 4 Columns maximum.
 * @param {number} size - the number of array size after split user input with ':'
 * @param {string} colStr - the string of requested columns
 * @param {string} rowStr - the string of requested rows
 */
function validateTableRowAndColumnCount(size, colStr, rowStr) {
    const tableTextRegex = /^-?\d*$/;
    const col = tableTextRegex.test(colStr) ? Number.parseInt(colStr) : undefined;
    const row = tableTextRegex.test(rowStr) ? Number.parseInt(rowStr) : undefined;
    log.debug("Trying to create a table of: " + col + " columns and " + row + " rows.");
    if (col === undefined || row === undefined) {
        return undefined;
    }
    if (size !== 2 || isNaN(col) || isNaN(row)) {
        const errorMsg = "Please input the number of columns and rows as C:R e.g. 3:4";
        common.postWarning(errorMsg);
        return false;
    }
    else if (col <= 0 || row <= 0) {
        const errorMsg = "The number of rows or columns can't be zero or negative.";
        common.postWarning(errorMsg);
        return false;
    }
    else if (col > 4) {
        const errorMsg = "You can only insert up to four columns via Docs Markdown.";
        common.postWarning(errorMsg);
        return false;
    }
    else if (row > 50) {
        const errorMsg = "You can only insert up to 50 rows via Docs Markdown.";
        common.postWarning(errorMsg);
        return false;
    }
    else {
        return true;
    }
}
exports.validateTableRowAndColumnCount = validateTableRowAndColumnCount;
/**
 * Creates a string that represents a MarkDown table
 * @param {number} col - the number of columns in the table
 * @param {number} row - the number of rows in the table
 */
function tableBuilder(col, row) {
    let str = "\n";
    /// create header
    // DCR update: 893410 [Add leading pipe]
    // tslint:disable-next-line:no-shadowed-variable
    for (let c = 1; c <= col; c++) {
        str += "|" + "Column" + c + "  |";
        // tslint:disable-next-line:no-shadowed-variable
        for (c = 2; c <= col; c++) {
            str += "Column" + c + "  |";
        }
        str += "\n";
    }
    // DCR update: 893410 [Add leading pipe]
    // tslint:disable-next-line:no-shadowed-variable
    for (let c = 1; c <= col; c++) {
        str += "|" + "---------" + "|";
        // tslint:disable-next-line:no-shadowed-variable
        for (c = 2; c <= col; c++) {
            str += "---------" + "|";
        }
        str += "\n";
    }
    /// create each row
    for (let r = 1; r <= row; r++) {
        str += "|" + "Row" + r + "     |";
        for (let c = 2; c <= col; c++) {
            str += "         |";
        }
        str += "\n";
    }
    log.debug("Table created: \r\n" + str);
    return str;
}
exports.tableBuilder = tableBuilder;
/**
 * Finds the files, then lets user pick from match list, if more than 1 match.
 * @param {string} searchTerm - the keyword to search directories for
 * @param {string} fullPath - optional, the folder to start the search under.
 */
function search(editor, selection, folderPath, fullPath, crossReference) {
    return __awaiter(this, void 0, void 0, function* () {
        const dir = require("node-dir");
        const path = require("path");
        let language = "";
        let possibleLanguage = null;
        let selected;
        let activeFilePath;
        let snippetLink = "";
        if (!crossReference) {
            const searchTerm = yield vscode_1.window.showInputBox({ prompt: "Enter snippet search terms." });
            if (!searchTerm) {
                return;
            }
            if (fullPath == null) {
                fullPath = folderPath;
            }
            // searches for all files at the given directory path.
            const files = yield dir.promiseFiles(fullPath);
            const fileOptions = [];
            for (const file in files) {
                if (files.hasOwnProperty(file)) {
                    const baseName = (path.parse(files[file]).base);
                    const fileName = files[file];
                    if (fileName.includes(searchTerm)) {
                        fileOptions.push({ label: baseName, description: fileName });
                    }
                }
            }
            // select from all files found that match search term.
            selected = yield vscode_1.window.showQuickPick(fileOptions);
            activeFilePath = (path.parse(editor.document.fileName).dir);
            if (!selected) {
                return;
            }
            const target = path.parse(selected.description);
            const relativePath = path.relative(activeFilePath, target.dir);
            possibleLanguage = inferLanguageFromFileExtension(target.ext);
            // change path separator syntax for commonmark
            snippetLink = path.join(relativePath, target.base).replace(/\\/g, "/");
        }
        else {
            const inputRepoPath = yield vscode_1.window.showInputBox({ prompt: "Enter file path for Cross-Reference GitHub Repo" });
            if (inputRepoPath) {
                possibleLanguage = inferLanguageFromFileExtension(path.extname(inputRepoPath));
                snippetLink = `~/${crossReference}/${inputRepoPath}`;
            }
        }
        if (!!possibleLanguage) {
            language = possibleLanguage.aliases[0];
        }
        if (!language) {
            const supportedLanguages = highlight_langs_1.getLanguageIdentifierQuickPickItems();
            const options = {
                placeHolder: "Select a programming language (required)",
            };
            const qpSelection = yield vscode_1.window.showQuickPick(supportedLanguages, options);
            if (!qpSelection) {
                common.postWarning("No code language selected. Abandoning command.");
                return;
            }
            else {
                const selectedLang = highlight_langs_1.languages.find((lang) => lang.language === qpSelection.label);
                language = selectedLang ? selectedLang.aliases[0] : null;
            }
        }
        if (!language) {
            common.postWarning("Unable to determine language. Abandoning command.");
            return;
        }
        const selectionRange = new vscode_1.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);
        const selectorOptions = [];
        selectorOptions.push({ label: "Id", description: "Select code by id tag (for example: <Snippet1>)" });
        selectorOptions.push({ label: "Range", description: "Select code by line range (for example: 1-15,18,20)" });
        selectorOptions.push({ label: "None", description: "Select entire file" });
        const choice = yield vscode_1.window.showQuickPick(selectorOptions);
        if (choice) {
            let snippet;
            switch (choice.label.toLowerCase()) {
                case "id":
                    const id = yield vscode_1.window.showInputBox({ prompt: "Enter id to select" });
                    if (id) {
                        snippet = snippetBuilder(language, snippetLink, id, undefined);
                        common.insertContentToEditor(editor, search.name, snippet, true, selectionRange);
                    }
                    break;
                case "range":
                    const range = yield vscode_1.window.showInputBox({ prompt: "Enter line selection range" });
                    if (range) {
                        snippet = snippetBuilder(language, snippetLink, undefined, range);
                        common.insertContentToEditor(editor, search.name, snippet, true, selectionRange);
                    }
                    break;
                default:
                    snippet = snippetBuilder(language, snippetLink);
                    common.insertContentToEditor(editor, search.name, snippet, true, selectionRange);
                    break;
            }
        }
    });
}
exports.search = search;
function inferLanguageFromFileExtension(fileExtension) {
    const matches = highlight_langs_1.languages.filter((lang) => {
        return lang.extensions
            ? lang.extensions.some((ext) => ext === fileExtension)
            : false;
    });
    if (matches && matches.length) {
        return matches[0];
    }
    return null;
}
exports.inferLanguageFromFileExtension = inferLanguageFromFileExtension;
function internalLinkBuilder(isArt, pathSelection, selectedText = "", languageId) {
    const os = require("os");
    let link = "";
    let startBrace = "";
    if (isArt) {
        startBrace = "![";
    }
    else {
        startBrace = "[";
    }
    // replace the selected text with the properly formatted link
    if (pathSelection === "") {
        link = `${startBrace}${selectedText}]()`;
    }
    else {
        link = `${startBrace}${selectedText}](${pathSelection})`;
    }
    const langId = languageId || "markdown";
    const isYaml = langId === "yaml" && !isArt;
    if (isYaml) {
        link = pathSelection;
    }
    // The relative path comparison creates an additional level that is not needed and breaks linking.
    // The path module adds an additional level so we'll need to handle this in our code.
    // Update slashes bug 944097.
    if (os.type() === "Windows_NT") {
        link = link.replace(/\\/g, "/");
    }
    if (isArt) {
        // Art links need backslashes to preview and publish correctly.
        link = link.replace(/\\/g, "/");
    }
    return link;
}
exports.internalLinkBuilder = internalLinkBuilder;
function externalLinkBuilder(link, title = "") {
    if (title === "") {
        title = link;
    }
    const externalLink = `[${title}](${link})`;
    return externalLink;
}
exports.externalLinkBuilder = externalLinkBuilder;
function videoLinkBuilder(link) {
    const videoLink = `> [!VIDEO ${link}]`;
    return videoLink;
}
exports.videoLinkBuilder = videoLinkBuilder;
function includeBuilder(link, title) {
    // Include link syntax for reference: [!INCLUDE[sampleinclude](./includes/sampleinclude.md)]
    const include = `[!INCLUDE [${title}](${link})]`;
    return include;
}
exports.includeBuilder = includeBuilder;
function snippetBuilder(language, relativePath, id, range) {
    if (id) {
        return `:::code language="${language}" source="${relativePath}" id=${id}":::`;
    }
    else if (range) {
        return `:::code language="${language}" source="${relativePath}" range="${range}":::`;
    }
    else {
        return `:::code language="${language}" source="${relativePath}":::`;
    }
}
exports.snippetBuilder = snippetBuilder;
/**
 * Strip out BOM from a string if presented, to prevent exception from JSON.parse function.
 * In Javascript, \uFEFF represents the Byte Order Mark (BOM).
 * @param originalText - the original string of text
 */
function stripBOMFromString(originalText) {
    if (originalText === undefined) {
        return undefined;
    }
    return originalText.replace(/^\uFEFF/, "");
}
exports.stripBOMFromString = stripBOMFromString;
/**
 * Create child process.
 */
function createChildProcess(path, args, options) {
    const spawn = require("child-process-promise").spawn;
    const promise = spawn(path, args, options);
    const childProcess = promise.childProcess;
    return childProcess;
}
exports.createChildProcess = createChildProcess;
//# sourceMappingURL=utility.js.map