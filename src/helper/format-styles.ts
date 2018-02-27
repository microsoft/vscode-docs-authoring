"use strict";

/**
 * Checks if the string input has code tags at the beginning and end.
 * @param {string} content - the string content
 * @param {vscode.Range} range - If provided will get the text at the given range.
 * @return {boolean} - true/false the line start or ends with bold.
 */
export function isInlineCode(content: string) {
    const regex = /^(\`)(.|\s*|[^`])+(\`)$/g;

    if (content.trim().match(regex) || content.trim() === "``") {
        return true;
    }

    return false;
}

/**
 * Checks if the string input has multiline code tags at the beginning and end.
 * @param {string} content - the string content
 * @param {vscode.Range} range - If provided will get the text at the given range.
 * @return {boolean} - true/false the line start or ends with bold.
 */
export function isMultiLineCode(content: string) {
    // basically looking for [begin] ``` -> not ` -> anything -> not ` -> ``` [end], but everything between ``` and ``` is optional.
    const regex = /^(\`\`\`)(.|\s*)+(\`\`\`)$/g;

    if (content.trim().match(regex) || content.trim() === "``````") {
        return true;
    }

    return false;
}

/**
 * Checks if the string input has bold and italic tags at the beginning and end.
 * @param {string} content - the string content
 * @param {vscode.Range} range - If provided will get the text at the given range.
 * @return {boolean} - true/false the line start or ends with bold.
 */
export function isBoldAndItalic(content: string) {

    // basically looking for [begin] *** -> not * -> anything -> not * -> *** [end], but everything between ** and ** is optional.
    const regex = /^(\*\*\*)(.|\s*)+(\*\*\*)$/g;

    if (content.trim().match(regex) || content.trim() === "******") {
        return true;
    }

    return false;
}

/**
 * Checks if the string input has bold tags at the beginning and end.
 * @param {string} content - the string content
 * @param {vscode.Range} range - If provided will get the text at the given range.
 * @return {boolean} - true/false the line start or ends with bold.
 */
export function isBold(content: string) {

    // basically looking for [begin] ** -> not * -> anything -> not * -> ** [end], but everything between ** and ** is optional.
    const boldRegex = /^(\*\*)(.|\s*)+(\*\*)$/g;

    if (content.trim().match(boldRegex) || content.trim() === "****") {
        return true;
    }

    if (isBoldAndItalic(content)) {
        return true;
    }

    return false;
}

/**
 * Checks if the string input has italic tags at the beginning and end.
 * @param {string} content - the string content
 * @param {vscode.Range} range - If provided will get the text at the given range.
 * @return {boolean} - true/false the line start or ends with bold.
 */
export function isItalic(content: string) {

    // [begin] * -> not * -> anything -> not * -> * [end], but everything between ** and ** is optional.
    const italicRegex = /^(\*)[^\*]+(.|\s*)+[^\*]+(\*)$/g;

    if (content.trim().match(italicRegex) || content.trim() === "**") {
        return true;
    }

    if (isBoldAndItalic(content)) {
        return true;
    }

    return false;
}
