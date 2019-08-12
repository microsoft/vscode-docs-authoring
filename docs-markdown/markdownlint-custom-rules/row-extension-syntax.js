// @ts-check

"use strict";

const common = require("./common");
const detailStrings = require("./strings");

module.exports = {
    "names": ["docsmd001", "row-missing-colons"],
    "description": "Bad row syntax.",
    "tags": ["validation"],
    "function": function rule(params, onError) {
        params.tokens.filter(function filterToken(token) {
            return token.type === "inline";
        }).forEach(function forToken(inline) {
            inline.children.filter(function filterChild(child) {
                return child.type === "text";
            }).forEach(function forChild(text) {
                const content = text.line;
                if (content.match(common.startRow) && !content.match(common.syntaxRow)) {
                    onError({
                        lineNumber: text.lineNumber,
                        detail: detailStrings.rowSyntax,
                        context: text.line
                    });
                }
            });
        });
    }
};
