// @ts-check

"use strict";

const common = require("./common");
const detailStrings = require("./strings");

module.exports = {
    "names": ["DOCSMD003", "column-span-attribute"],
    "description": `Column attribute is unsupported.`,
    "tags": ["validation"],
    "function": function rule(params, onError) {
        params.tokens.filter(function filterToken(token) {
            return token.type === "inline";
        }).forEach(function forToken(inline) {
            inline.children.filter(function filterChild(child) {
                return child.type === "text";
            }).forEach(function forChild(text) {
                const content = text.line;
                if (content.match(common.columnWithAttribute) && !content.match(common.columnSpan)) {
                    onError({
                        lineNumber: text.lineNumber,
                        detail: detailStrings.contenSpanAttribute,
                        context: text.line
                    });
                }
            });
        });
    }
};
