// @ts-check

"use strict";

const common = require("./common");
const detailStrings = require("./strings");

module.exports = {
    "names": ["DOCSMD004", "docsmd.syntax"],
    "description": "Syntax linting.",
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
                    // Condition: Line begins with fewer or more than three colons.
                    if (!content.match(common.tripleColonSyntax) && content.match(common.openExtension)) {
                        onError({
                            lineNumber: text.lineNumber,
                            detail: detailStrings.syntaxCount,
                            context: text.line
                        });

                    }
                }
                // Condition: Three colons are followed by fewer or more than one space.
                if (!content.match(common.validTripleColon) && content.match(common.openExtension)) {
                    onError({
                        lineNumber: text.lineNumber,
                        detail: detailStrings.syntaxSpace,
                        context: text.line
                    });
                }
                // Condition: After three colons and a space, text is not a supported extension.
                if (content.match(common.validTripleColon) && !content.match(common.supportedExtensions)) {
                    const unsupportedExtension = content.match(common.unsupportedExtensionRegex);
                    onError({
                        lineNumber: text.lineNumber,
                        detail: detailStrings.syntaxUnsupportedExtension,
                        context: text.line
                    });
                }
            });
        });
    }
};
