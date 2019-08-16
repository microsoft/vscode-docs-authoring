// @ts-check

"use strict";

const common = require("./common");
const detailStrings = require("./strings");

module.exports = {
    "names": ["DOCSMD010", "docsmd.xref"],
    "description": `xref linting.`,
    "tags": ["validation"],
    "function": function rule(params, onError) {
        params.tokens.filter(function filterToken(token) {
            return token.type === "inline";
        }).forEach(function forToken(inline) {
            inline.children.filter(function filterChild(child) {
                return child.type === "text";
            }).forEach(function forChild(text) {
                const textBlock = text.line;
                const xrefMatches = textBlock.match(common.openXref);

                if (xrefMatches === null) { return; }

                xrefMatches.forEach(content => {
                    // no colon for "<xref:...>"
                    if (content.match(common.xrefShouldIncludeColon)) {
                        onError({
                            lineNumber: text.lineNumber,
                            detail: detailStrings.xrefShouldIncludeColon,
                            context: text.line
                        });
                    }

                    //xref should not have a space before the uid <xref: ...> vs <xref:...>
                    if (content.match(common.xrefHasSpace)) {
                        onError({
                            lineNumber: text.lineNumber,
                            detail: detailStrings.xrefHasSpace,
                            context: text.line
                        });
                    }

                    // Condition: After "<xref:...>" is missing uid.
                    if (content.match(common.missingUidAttributeXref)) {
                        onError({
                            lineNumber: text.lineNumber,
                            detail: detailStrings.missingUidAttributeXref,
                            context: text.line
                        });
                    }

                    // Condition: "<xref:...?displayProperty=" bad displayProperty indicator.
                    if (content.match(common.xrefHasDisplayPropertyQuestionMark)
                        && !content.match(common.syntaxXref)
                        && !content.match(common.usesCorrectXrefDisplayProperties)) {
                        onError({
                            lineNumber: text.lineNumber,
                            detail: detailStrings.xrefHasDisplayPropertyQuestionMark,
                            context: text.line
                        });
                    }

                    // Condition: "<xref:...?displayProperty=fullName|nameWithType>" bad displayProperty value.
                    if (content.match(common.usesCorrectXrefDisplayProperties)) {
                        onError({
                            lineNumber: text.lineNumber,
                            detail: detailStrings.usesCorrectXrefDisplayProperties,
                            context: text.line
                        });
                    }

                    // Condition: After "<xref:...>" syntax is incorrect.
                    if (!content.match(common.syntaxXref)) {
                        onError({
                            lineNumber: text.lineNumber,
                            detail: detailStrings.xrefSyntax,
                            context: text.line
                        });
                    }
                });
            });
        });
    }
};
