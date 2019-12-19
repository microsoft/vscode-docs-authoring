// @ts-check

"use strict";

const common = require("./common");
const detailStrings = require("./strings");

module.exports = {
    "names": ["DOCSMD012", "docsmd.codesnippet"],
    "description": `codesnippet linting.`,
    "tags": ["validation"],
    "function": function rule(params, onError) {
        try {
            const doc = params.lines.join("\n");
            const fullLooseMatches = doc.match(common.syntaxCodeLooseMatch);
            if (fullLooseMatches) {
                params.tokens.filter(function filterToken(token) {
                    return token.type === "inline";
                }).map(chunk => {
                    chunk.children.filter(text => {
                        return text.type == "text"
                    }).map((text) => {
                        let content = fullLooseMatches.filter((regexMatch) => text.content.indexOf(regexMatch) > -1)
                        if (content == null || content.length == 0) {
                            content = fullLooseMatches.filter(regexMatch => regexMatch == text.line)
                        }
                        if (content == null || content.length == 0) {
                            return;
                        }

                        content = content[0]
                        //malformed colons
                        if (!content.match(common.openAndClosingValidTripleColon)) {
                            onError({
                                lineNumber: text.lineNumber,
                                detail: detailStrings.tripleColonsIncorrect,
                                context: text.line
                            });
                        }

                        //source check
                        const sourceMatch = content.match(common.codeSourceMatch);
                        if (!sourceMatch || sourceMatch[0] === "source=\"\"") {
                            onError({
                                lineNumber: text.lineNumber,
                                detail: detailStrings.codeSourceRequired,
                                context: text.line
                            });
                        }

                        //do we have language?
                        // const languageMatch = content.match(common.codeLanguageMatch);
                        // if (!languageMatch || languageMatch[0] === "language=\"\"") {
                        //     onError({
                        //         lineNumber: text.lineNumber,
                        //         detail: detailStrings.codeLanguageRequired,
                        //         context: text.line
                        //     });
                        // }

                        //do we have both Id and Range?
                        const rangeMatch = content.match(common.codeRangeMatch);
                        const idMatch = content.match(common.codeIdMatch);
                        if (rangeMatch && idMatch) {
                            onError({
                                lineNumber: text.lineNumber,
                                detail: detailStrings.codeRangeOrId,
                                context: text.line
                            });
                        } else if (rangeMatch) {
                            const allowedValues = rangeMatch[1].match(common.allowedRangeValues)
                            if (!allowedValues) {
                                onError({
                                    lineNumber: text.lineNumber,
                                    detail: detailStrings.allowedRangeValues,
                                    context: text.line
                                });
                            }
                        }

                        //case sensitivity and attributes check
                        let attrMatches = content.match(common.syntaxCodeAttributes);
                        attrMatches = attrMatches.filter((attr) => attr != "");
                        attrMatches.forEach((attr) => {
                            if (attr) {
                                if (attr !== attr.toLowerCase()) {
                                    onError({
                                        lineNumber: text.lineNumber,
                                        detail: detailStrings.codeCaseSensitive,
                                        context: text.line
                                    });
                                }
                                //make sure each attribute is allowed...
                                if (common.allowedCodeAttributes.indexOf(attr) === -1) {
                                    onError({
                                        lineNumber: text.lineNumber,
                                        detail: detailStrings.codeNonAllowedAttribute.replace("___", attr),
                                        context: text.line
                                    });
                                }
                            }
                        });

                        const interactiveMatches = content.match(common.codeInteractiveMatch)
                        if (interactiveMatches) {
                            if (interactiveMatches.length > 0) {
                                const allowedValue = common.allowedInteractiveValues.includes(interactiveMatches[1]);
                                if (!allowedValue) {
                                    onError({
                                        lineNumber: text.lineNumber,
                                        detail: detailStrings.allowedInteractiveValues.replace("___", interactiveMatches[1]),
                                        context: text.line
                                    });
                                }
                            }
                        }
                    })
                });
            }
        } catch (error) {
            console.log(error);
        }
    }
};