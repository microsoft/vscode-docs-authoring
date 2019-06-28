// @ts-check

"use strict";

const common = require("./common");
const detailStrings = require("./strings");

module.exports = {
    "names": ["docsmd.no-loc"],
    "description": `Non-localization linting.`,
    "tags": ["validation"],
    "function": function rule(params, onError) {
        params.tokens.filter(function filterToken(token) {
            return token.type === "inline";
        }).forEach(function forToken(inline) {
            inline.children.filter(function filterChild(child) {
                return child.type === "text";
            }).forEach(function forChild(text) {
                const content = text.content.toLowerCase();
                // Condition: After ":::no-loc " syntax is incorrect.
                if (content.match(common.openNoLoc) && !content.match(common.syntaxNoLocCaseSensitive)) {
                    //different errors
                    //missing text attribute
                    if (!content.match(common.missingTextAttributeNoLoc)) {
                        onError({
                            lineNumber: text.lineNumber,
                            detail: detailStrings.noLocMissingTextAttribute,
                            context: text.line
                        });
                    }

                    //case sensitivity
                    if (!content.match(common.syntaxNoLocCaseSensitive)) {
                        onError({
                            lineNumber: text.lineNumber,
                            detail: detailStrings.noLocMissingTextAttribute,
                            context: text.line
                        });
                    }


                }
            });
        });
    }
};
