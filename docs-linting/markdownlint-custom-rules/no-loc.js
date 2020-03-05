// @ts-check

"use strict";

const common = require("./common");
const detailStrings = require("./strings");

module.exports = {
    "names": ["DOCSMD009", "docsmd.no-loc"],
    "description": `Non-localization linting.`,
    "tags": ["validation"],
    "function": function rule(params, onError) {
        params.tokens.filter(function filterToken(token) {
            return token.type === "inline";
        }).forEach(function forToken(inline) {
            inline.children.filter(function filterChild(child) {
                return child.type === "text";
            }).forEach(function forChild(text) {
                const textBlock = text.content;
                const noLocMatches = textBlock.match(common.syntaxNoLocLooseMatch);

                if (noLocMatches === null) { return; }

                noLocMatches.forEach(content => {
                    // no dash for "no-loc"
                    if (content.match(common.openNoDashNoLoc) && !content.match(common.syntaxNoLoc)) {
                        onError({
                            lineNumber: text.lineNumber,
                            detail: detailStrings.noLocNoDash,
                            context: text.line
                        });
                    }

                    // Condition: After ":::no-loc " syntax is incorrect.
                    if (content.match(common.openNoLoc) && !content.match(common.syntaxNoLoc)) {
                        //different errors
                        //missing text attribute
                        let attrMatches = content.match(common.missingTextAttributeNoLoc);
                        attrMatches = attrMatches.filter((attr) => attr != "");
                        attrMatches.forEach((attr) => {
                            //make sure each attribute is allowed...
                            if (common.allowedNoLocAttributes.indexOf(attr) === -1) {
                                onError({
                                    lineNumber: text.lineNumber,
                                    detail: detailStrings.NoLocNonAllowedAttribute.replace("___", attr),
                                    context: text.line
                                });
                            }
                        });
                        const textMatch = common.noLocTextMatch.exec(content);
                        if (!textMatch) {
                            onError({
                                lineNumber: text.lineNumber,
                                detail: detailStrings.noLocMissingTextAttribute,
                                context: text.line
                            });
                        }
                        else if (content.match(common.syntaxNoLocLooseMatch)) {
                            //case sensitivity
                            if (!content.match(common.syntaxNoLocCaseSensitive)) {
                                onError({
                                    lineNumber: text.lineNumber,
                                    detail: detailStrings.noLocCaseSensitive,
                                    context: text.line
                                });
                            } else if (content.match(common.syntaxSingleQuotesNoLoc)) {
                                onError({
                                    lineNumber: text.lineNumber,
                                    detail: detailStrings.noLocDoubleQuotes,
                                    context: text.line
                                });
                            } else if (content.match(common.syntaxNoQuotesNoLoc)) {
                                onError({
                                    lineNumber: text.lineNumber,
                                    detail: detailStrings.noLocNoQuotes,
                                    context: text.line
                                });
                            } else if (!content.trim().startsWith(":::")
                                || !content.trim().endsWith(":::")) {
                                onError({
                                    lineNumber: text.lineNumber,
                                    detail: detailStrings.noLocColonsIncorrect,
                                    context: text.line
                                });
                            }
                        }
                    }
                });
            });
        });
    }
};
