// @ts-check

"use strict";

const common = require("./common");
const detailStrings = require("./strings");

module.exports = {
    "names": ["DOCSMD007", "docsmd.alert"],
    "description": `Alert linting.`,
    "tags": ["validation"],
    "function": function rule(params, onError) {
        params.tokens.filter(function filterToken(token) {
            return token.type === "inline";
        }).forEach(function forToken(inline) {
            inline.children.filter(function filterChild(child) {
                return child.type === "text";
            }).forEach(function forChild(text) {
                // Use the line child so ">" isn't stripped.
                const content = text.line;
                // Rule to verify that alert is of valid type.
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
                // Rule to verify that alert is preceded by "> "
                // Begin linting when "[!" is at the beginning of a line
                if (content.match(common.bracketExclam)) {
                    // Condition: The text is trying to be an alert
                    if (content.match(common.alertTypeNoOpen)) {
                        onError({
                            lineNumber: text.lineNumber,
                            detail: detailStrings.alertNoOpen,
                            context: text.line
                        });
                    }
                }
                // Rule to catch alert content on the same line as alert identifier.
                // Begin linting when line starts with an alert.
                //if (content.match(common.alertType)) {
                // Condition: Any text follows alert identifier.
                //}
                // Rule to catch alert identifier missing exclamation point.
                if (content.match(common.alertNoExclam)) {
                    onError({
                        lineNumber: text.lineNumber,
                        detail: detailStrings.alertNoExclam,
                        context: text.line
                    })
                }
            });
        });
    }
};
