// @ts-check

"use strict";

const common = require("./common");
const detailStrings = require("./strings");

module.exports = {
    "names": ["DOCSMD002", "column-extension-syntax"],
    "description": "Bad column syntax.",
    "tags": ["validation"],
    "function": function rule(params, onError) {
        params.tokens.filter(function filterToken(token) {
            return token.type === "inline";
        }).forEach(function forToken(inline) {
            inline.children.filter(function filterChild(child) {
                return child.type === "text";
            }).forEach(function forChild(text) {
                const content = text.line;
                if (content.match(common.supportedExtensions) && content.match(common.startColumn) && !content.match(common.syntaxColumn)) {
                    onError({
                        lineNumber: text.lineNumber,
                        detail: detailStrings.columnSyntax,
                        context: text.line
                    });
                }
            });
        });
    }
};
