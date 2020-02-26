"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Checks if the string input has code tags at the beginning and end.
 * @param {string} content - the string content
 * @param {vscode.Range} range - If provided will get the text at the given range.
 * @return {boolean} - true/false the line start or ends with bold.
 */
function isInlineCode(content) {
    const regex = /^(\`)(.|\s*|[^`])+(\`)$/g;
    if (content.trim().match(regex) || content.trim() === "``") {
        return true;
    }
    return false;
}
exports.isInlineCode = isInlineCode;
/**
 * Checks if the string input has multiline code tags at the beginning and end.
 * @param {string} content - the string content
 * @param {vscode.Range} range - If provided will get the text at the given range.
 * @return {boolean} - true/false the line start or ends with bold.
 */
function isMultiLineCode(content) {
    // basically looking for [begin] ``` -> not ` -> anything -> not ` -> ``` [end], but everything between ``` and ``` is optional.
    const regex = /^(\`\`\`)(.|\s*)+(\`\`\`)$/g;
    if (content.trim().match(regex) || content.trim() === "``````") {
        return true;
    }
    return false;
}
exports.isMultiLineCode = isMultiLineCode;
/**
 * Checks if the string input has bold and italic tags at the beginning and end.
 * @param {string} content - the string content
 * @param {vscode.Range} range - If provided will get the text at the given range.
 * @return {boolean} - true/false the line start or ends with bold.
 */
function isBoldAndItalic(content) {
    // basically looking for [begin] *** -> not * -> anything -> not * -> *** [end], but everything between ** and ** is optional.
    const regex = /^(\*\*\*)(.|\s*)+(\*\*\*)$/g;
    if (content.trim().match(regex) || content.trim() === "******") {
        return true;
    }
    return false;
}
exports.isBoldAndItalic = isBoldAndItalic;
/**
 * Checks if the string input has bold tags at the beginning and end.
 * @param {string} content - the string content
 * @param {vscode.Range} range - If provided will get the text at the given range.
 * @return {boolean} - true/false the line start or ends with bold.
 */
function isBold(content) {
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
exports.isBold = isBold;
/**
 * Checks if the string input has italic tags at the beginning and end.
 * @param {string} content - the string content
 * @param {vscode.Range} range - If provided will get the text at the given range.
 * @return {boolean} - true/false the line start or ends with bold.
 */
function isItalic(content) {
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
exports.isItalic = isItalic;
/**
 * Returns input string formatted MD Bold.
 * @param {string} content - selected text
 * @param {vscode.Range} range - If provided will get the text at the given range.
 */
function bold(content) {
    // Clean up string if it is already formatted
    const selectedText = content.trim();
    if (isBold(content) || isBoldAndItalic(content)) {
        return selectedText.substring(2, selectedText.length - 2);
    }
    // Set sytax for bold formatting and replace original string with formatted string
    const styleBold = `**${selectedText}**`;
    return styleBold;
}
exports.bold = bold;
//# sourceMappingURL=format-styles.js.map