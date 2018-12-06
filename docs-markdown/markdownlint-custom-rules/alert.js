// @ts-check

"use strict";

const common = require("./common");
const detailStrings = require("./strings");

module.exports = {
    "names": ["docsmd.alert"],
    "description": `Alert linting.`,
    "tags": ["validation"],
    "function": function rule(params, onError) {
        params.tokens.filter(function filterToken(token) {
            return token.type === "inline";
        }).forEach(function forToken(inline) {
            inline.children.filter(function filterChild(child) {
                return child.type === "text";
            }).forEach(function forChild(text) {
                const content = text.content.toLowerCase();
                // Begin linting when "> [!" is at the beginning of a line.
                if (content.match(common.alertOpener)) {
                    // Condition: The text is not valid alert type
                    if (!content.match(common.snippetOpener) && !content.match(common.includeOpener) && !content.match(common.alertType)) {   
                        onError({
                            lineNumber: text.lineNumber,
                            detail: detailStrings.alertType,
                            context: text.line
                        });
                    }
                }
            });
        });
    }
};
 