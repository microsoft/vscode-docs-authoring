// import { postWarning } from "../helper/common";

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
        // postWarning("HTML tag in source heading. Abandoning bookmark insert command.");
        bookmark = selectedText;
        return bookmark;
    }

    // If there is no link text, use the bookmark text without the leading "#"
    if (selectedText.length === 0) {
        selectedText = bookmarkText.trim().replace(/\n|\r/g, "").split(" ").slice(1).join(" ");
    }

    // Syntax for bookmarks is #bookmark-text-without-spaces-or-special-characters-underscores-are-allowed
    bookmark = bookmarkText.trim().replace(/\s\s+/g, " ").replace(/\n|\r|[^A-Za-z0-9-_\s]/g, "").toLocaleLowerCase().split(" ").slice(1).join("-");

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
