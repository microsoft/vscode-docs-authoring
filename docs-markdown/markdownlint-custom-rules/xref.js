// @ts-check

"use strict";

const common = require("./common");
const detailStrings = require("./strings");

module.exports = {
    "names": ["docsmd.xref"],
    "description": `xref linting.`,
    "tags": ["validation"],
    "function": function rule(params, onError) {
        params.tokens.filter(function filterToken(token) {
            return token.type === "inline";
        }).forEach(function forToken(inline) {
            inline.children.filter(function filterChild(child) {
                return child.type === "text";
            }).forEach(function forChild(text) {
                const textBlock = text.content;
                const xrefMatches = textBlock.match(common.syntaxNoLocLooseMatch);

                if (xrefMatches === null) { return; }

                xrefMatches.forEach(content => {
                    // no colon for "<xref:...>"
                    if (!content.match(common.syntaxXref)) {
                        onError({
                            lineNumber: text.lineNumber,
                            detail: detailStrings.xrefSyntax,
                            context: text.line
                        });
                    }

                    // Condition: After "<xref:...>" syntax is incorrect.
                    if (content.match(common.openXref) && !content.match(common.syntaxXref)) {
                        //different errors
                        //missing uid attribute
                        if (!content.match(common.missingUidAttributeXref)) {
                            onError({
                                lineNumber: text.lineNumber,
                                detail: detailStrings.xrefSyntax,
                                context: text.line
                            });
                        }
                    }
                });
            });
        });
    }
};
