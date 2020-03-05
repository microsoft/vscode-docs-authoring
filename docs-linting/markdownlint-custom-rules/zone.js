// @ts-check

"use strict";

const common = require("./common");
const detailStrings = require("./strings");

module.exports = {
    "names": ["DOCSMD005", "docsmd.zone"],
    "description": `Zone linting.`,
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
                    // Condition: After three colons and a space, text is other than "zone target" or "zone-end".
                    if (content.match(common.openZone) && !content.match(common.syntaxZone) && !content.match(common.endZone) && !content.match(common.zonePivot)) {
                        onError({
                            lineNumber: text.lineNumber,
                            detail: detailStrings.zoneSyntax,
                            context: text.line
                        });
                    }
                    // Condition: "zone target" followed by characters other than =".
                    if (content.match(common.syntaxZone) && content.match(common.openZone)) {
                        if (!content.match(common.renderZone) && !content.match(common.zonePivot)) {
                            onError({
                                lineNumber: text.lineNumber,
                                detail: detailStrings.zoneRender,
                                context: text.line
                            });
                        }
                    }
                    // Condition: Value of "zone target=" is other than "chromeless" or "docs".
                    if (content.match(common.syntaxZone) && content.match(common.openZone)) {
                        if (!content.match(common.validZone) && !content.match(common.zonePivot)) {
                            onError({
                                lineNumber: text.lineNumber,
                                detail: detailStrings.zoneValue,
                                context: text.line
                            });
                        }
                    }
                }
            });
        });
    }
};
