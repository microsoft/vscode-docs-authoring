// @ts-check

"use strict";

const common = require("./common");
const detailStrings = require("./strings");

module.exports = {
    "names": ["docsmd004", "row-missing-end"],
    "description": `Row is missing end statement.`,
    "tags": ["validation"],
    "function": function rule(params, onError) {
        var rowOpen = ":::row:::";
        var rowEnd = ":::row-end:::";
        if (params.lines.includes(rowOpen)) {
            if (!params.lines.includes(rowEnd)) {
                params.tokens.filter(function filterToken(token) {
                    return token.type === "inline";
                }).forEach(function forToken(inline) {
                    inline.children.filter(function filterChild(child) {
                        return child.type === "text";
                    }).forEach(function forChild(text) {
                        const content = text.line;
                        if (content.match(common.openRow)) {
                            onError({
                                lineNumber: text.lineNumber,
                                detail: detailStrings.rowMissingEnd,
                                context: text.line
                            });
                        }
                    });
                });
            }
        }
    }
};
