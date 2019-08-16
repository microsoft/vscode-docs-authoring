// @ts-check

"use strict";

const common = require("./common");
const detailStrings = require("./strings");

module.exports = {
    "names": ["DOCSMD006", "docsmd.moniker"],
    "description": `Moniker linting.`,
    "tags": ["validation"],
    "function": function rule(params, onError) {
        params.tokens.filter(function filterToken(token) {
            return token.type === "inline";
        }).forEach(function forToken(inline) {
            inline.children.filter(function filterChild(child) {
                return child.type === "text";
            }).forEach(function forChild(text) {
                const content = text.content.toLowerCase();
                // Begin linting when a colon is at the beginning of a line.
                if (content.match(common.singleColon)) {
                    // Condition: "moniker range" followed by characters other than =", <=", or >=".
                    if (content.match(common.syntaxMoniker) && content.match(common.openMoniker)) {
                        if (!content.match(common.rangeMoniker)) {
                            onError({
                                lineNumber: text.lineNumber,
                                detail: detailStrings.monikerRange,
                                context: text.line
                            });
                        }
                    }
                    // Condition: After three colons and a space, text is other than "moniker range".
                    if (content.match(common.openMoniker) && !content.match(common.syntaxMoniker)) {
                        onError({
                            lineNumber: text.lineNumber,
                            detail: detailStrings.monikerSyntax,
                            context: text.line
                        });
                    }
                }
            });
        });
    }
};
