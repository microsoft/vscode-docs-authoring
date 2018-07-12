"use-strict";

import * as vscode from "vscode";
import * as common from "./common";
import * as log from "./log";

/**
 * Checks the user input for table creation.
 * Format - C:R.
 * Columns and Rows cannot be 0 or negative.
 * 4 Columns maximum.
 * @param {number} size - the number of array size after split user input with ':'
 * @param {string} colStr - the string of requested columns
 * @param {string} rowStr - the string of requested rows
 */
export function validateTableRowAndColumnCount(size: number, colStr: string, rowStr: string) {
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
    } else if (col <= 0 || row <= 0) {
        const errorMsg = "The number of columns and rows cannot be zero or negatives.";
        common.postWarning(errorMsg);
        return false;
    } else if (col > 4) {
        const errorMsg = "Per Docs content guidelines, you can only insert up to four columns via the Docs authoring extension. You can add more columns manually if necessary.";
        common.postWarning(errorMsg);
        return false;
    } else if (row >= 100) {
        const errorMsg = "You can only insert a table with fewer than one hundred rows via the Docs authoring extension.";
        common.postWarning(errorMsg);
        return false;
    } else {
        return true;
    }
}

/**
 * Creates a string that represents a MarkDown table
 * @param {number} col - the number of columns in the table
 * @param {number} row - the number of rows in the table
 */
export function tableBuilder(col: number, row: number) {
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

/**
 * Finds the files, then lets user pick from match list, if more than 1 match.
 * @param {string} searchTerm - the keyword to search directories for
 * @param {string} fullPath - optional, the folder to start the search under.
 */

export function search(editor: vscode.TextEditor, selection: vscode.Selection, searchTerm: string, folderPath: string, fullPath?: string) {
    const dir = require("node-dir");
    const path = require("path");

    if (fullPath == null) {
        fullPath = folderPath;
    }

    // searches for all files at the given directory path.
    dir.files(fullPath, (err: any, files: any) => {
        if (err) {
            throw err;
        }

        const fileOptions: vscode.QuickPickItem[] = [];

        for (const file in files) {
            if (files.hasOwnProperty(file)) {
                const baseName: string = (path.parse(files[file]).base);
                const fileName: string = files[file];
                if (fileName.includes(searchTerm)) {
                    fileOptions.push({ label: baseName, description: fileName });
                }
            }
        }

        // select from all files found that match search term.
        vscode.window.showQuickPick(fileOptions).then(function searchType(selected) {
            const activeFilePath = (path.parse(editor.document.fileName).dir);
            if (!selected) {
                return;
            } else {
                const target = path.parse(selected.description);
                const relativePath = path.relative(activeFilePath, target.dir);
                const ext: string = target.ext;
                // change path separator syntax for commonmark
                const snippetLink = path.join(relativePath, target.base).replace(/\\/g, "/");
                const snippet: string = snippetBuilder(ext.substr(1), target.name, snippetLink);
                const range = new vscode.Range(selection.start.line, selection.start.character, selection.end.line, selection.end.character);

                common.insertContentToEditor(editor, search.name, snippet, true, range);
            }
        });
    });
}

/**
 * This function is to verify whether bookmark items have duplicate name or
 * not then return identity for each duplicated item
 * The items will be preserved the order
 *  * @param bookmarkHeader - Recieved the bookmark header items (array)
 * return newbookmarkIdentifier
 */
export function addbookmarkIdentifier(bookmarkHeader: any) {
    // define new dictionary with key and integer
    const seenHeader = new Map<string, number>();
    const newbookmarkIdentifier = [];

    // iterate for each bookmark_header
    for (const head of bookmarkHeader) {
        // remove header tag and set non case sensitive before adding to seenHeader /
        const transformHead = head.slice(head.indexOf(" "), head.length - 1).trim().toLowerCase();
        // if the bookmark item already seen then get the identifier to
        // add with the bookmark and add number to seenHeader array

        if (seenHeader.has(transformHead)) {
            const identifier = seenHeader.get(transformHead);
            seenHeader.set(transformHead, identifier! + 1);
            newbookmarkIdentifier.push(head.replace(/\r|\n/g, "").concat(" (", identifier, ")\r\n"));
        } else {
            // add to seen_header array for the first instance
            seenHeader.set(transformHead, 1);
            newbookmarkIdentifier.push(head.replace(/\r|\n/g, "").concat("\r\n"));
        }
    }

    return newbookmarkIdentifier;
}

/**
 * Inserts Markdown for a bookmark, given the link text and the bookmark text
 * @param selectedText - The selected link text. If null, the bookmark text will be used as link text
 * @param bookmarkText - The section or heading to bookmark
 * @param pathSelection - (Optional) path to file which contains the section to be bookmarked
 */
export function bookmarkBuilder(selectedText: string, bookmarkText: string, pathSelection: string) {
    const os = require("os");
    let bookmark = "";

    // Anchor tags are not supported in bookmark links.  Regex to find anchors in headers.
    const aTagRegex = /#[\s](<a.*)<\/a>/;

    // Check for anchor tag and post a warning if found.
    // Return selected text as bookmark so common.insertContentToEditor does not delete the selected content.
    if (new RegExp(aTagRegex).test(bookmarkText)) {
        log.debug("HTML tag in source heading.");
        common.postWarning("HTML tag in source heading. Abandoning bookmark insert command.");
        bookmark = selectedText;
        return bookmark;
    }

    // If there is no link text, use the bookmark text without the leading "#"
    if (selectedText.length === 0) {
        selectedText = bookmarkText.trim().replace(/\n|\r/g, "").split(" ").slice(1).join(" ");
    }

    // Syntax for bookmarks is #bookmark-text-without-spaces-or-special-characters
    bookmark = bookmarkText.trim().replace(/\n|\r|[^A-Za-z0-9-\s]/g, "").toLocaleLowerCase().split(" ").slice(1).join("-");

    if (pathSelection) {
        if (os.type() === "Windows_NT") {
            pathSelection = pathSelection.replace(/\\/g, "/");
        }

        bookmark = "[" + selectedText + "](" + pathSelection + "#" + bookmark + ")";
    } else {
        bookmark = "[" + selectedText + "]" + "(#" + bookmark + ")";
    }

    return bookmark;
}

export function internalLinkBuilder(isArt: boolean, pathSelection: any, selectedText: string = "") {
    const os = require("os");
    let link = "";

    let startBrace = "";
    if (isArt) {
        startBrace = "![";
    } else {
        startBrace = "[";
    }

    // replace the selected text with the properly formatted link
    if (pathSelection === "") {
        link = startBrace + selectedText + "]()";
    } else {
        link = startBrace + selectedText + "](" + pathSelection + ")";
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

export function externalLinkBuilder(link: string, title: string = "") {
    if (title === "") {
        title = link;
    }
    const externalLink = "[" + title + "]" + "(" + link + ")";
    return externalLink;
}

export function videoLinkBuilder(link: string) {
    const videoLink = "> [!VIDEO " + link + "]";
    return videoLink;
}

export function includeBuilder(link: string, title: string) {
    // Include link syntax for reference: [!INCLUDE[sampleinclude](./includes/sampleinclude.md)]
    const include = "[!INCLUDE [" + title + "](" + link + ")]";

    return include;

}

export function snippetBuilder(codeFileExtension: string, targetName: string, relativePath: string) {

    const snippet: string = "[!code-" + codeFileExtension + "[" + targetName + "](" + relativePath + ")]";

    return snippet;
}

/**
 * Strip out BOM from a string if presented, to prevent exception from JSON.parse function.
 * In Javascript, \uFEFF represents the Byte Order Mark (BOM).
 * @param originalText - the original string of text
 */
export function stripBOMFromString(originalText: string) {
    if (originalText === undefined) {
        return undefined;
    }

    return originalText.replace(/^\uFEFF/, "");
}

/**
 * Create child process.
 */
export function createChildProcess(path: any, args: any, options: any) {
    const spawn = require("child-process-promise").spawn;
    const promise = spawn(path, args, options);
    const childProcess = promise.childProcess;
    return childProcess;
}
