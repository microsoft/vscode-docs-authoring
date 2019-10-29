// @ts-check

"use strict";

const common = require("./common");
const detailStrings = require("./strings");

module.exports = {
    "names": ["DOCSMD011", "docsmd.image"],
    "description": `image linting.`,
    "tags": ["validation"],
    "function": function rule(params, onError) {
        try {
            const doc = params.lines.join("\n");
            const fullLooseMatches = doc.match(common.syntaxImageLooseMatch);
            params.tokens.filter(function filterToken(token) {
                return token.type === "inline";
            }).map(text => {
                let content = fullLooseMatches.filter((regexMatch) => regexMatch == text.content)
                if (content == null) {
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
                        detail: detailStrings.imageColonsIncorrect,
                        context: text.line
                    });
                }

                //source check
                // const notImageComplexEndTagMatch = content.match(common.imageComplexEndTagMatch)
                // if (!notImageComplexEndTagMatch) {
                const sourceMatch = content.match(common.imageSourceMatch);
                if (!sourceMatch || sourceMatch[0] === "source=\"\"") {
                    onError({
                        lineNumber: text.lineNumber,
                        detail: detailStrings.imageSourceRequired,
                        context: text.line
                    });
                }
                // }

                //case sensitivity and attributes check
                let attrMatches = content.match(common.syntaxImageAttributes);
                attrMatches = attrMatches.filter((attr) => attr != "");
                attrMatches.forEach((attr) => {
                    if (attr !== attr.toLowerCase()) {
                        onError({
                            lineNumber: text.lineNumber,
                            detail: detailStrings.imageCaseSensitive,
                            context: text.line
                        });
                    }

                    //make sure each attribute is allowed...
                    if (common.allowedImageAttributes.indexOf(attr) === -1) {
                        onError({
                            lineNumber: text.lineNumber,
                            detail: detailStrings.imageNonAllowedAttribute.replace("___", attr),
                            context: text.line
                        });
                    }
                });

                //check if the type is valid
                const typeMatch = common.imageTypeMatch.exec(content);
                if (typeMatch) {
                    if (common.allowedImageTypes.indexOf(typeMatch[1]) === -1) {
                        onError({
                            lineNumber: text.lineNumber,
                            detail: detailStrings.imageNonAllowedType.replace("___", typeMatch[1]),
                            context: text.line
                        });
                    }



                    if (typeMatch[1] !== "icon") {
                        //do we have alt-text?
                        const altTextMatch = content.match(common.imageAltTextMatch);
                        if (!altTextMatch || altTextMatch[0] === "alt-text=\"\"") {
                            onError({
                                lineNumber: text.lineNumber,
                                detail: detailStrings.imageAltTextRequired,
                                context: text.line
                            });
                        }

                        //complex type rules
                        if (typeMatch[1] === "complex") {
                            //do we have an "image-end" tag?
                            const imageMatches = content.match(common.imageOpen);
                            if (imageMatches.length > 2 || !content.match(common.imageComplexEndTagMatch)) {
                                onError({
                                    lineNumber: text.lineNumber,
                                    detail: detailStrings.imageComplexEndTagRequired,
                                    context: text.line
                                });
                            }

                            //do we have a long description?
                            const longDescMatch = common.imageLongDescriptionMatch.exec(content);
                            if (!longDescMatch || longDescMatch[9].match(/^\s*$/mi)[0] != "") {
                                onError({
                                    lineNumber: text.lineNumber,
                                    detail: detailStrings.imageComplexLongDescriptionRequired,
                                    context: text.line
                                });
                            }
                        }
                    } else {
                        //do we have loc-scope? cuzzz, we shouldn't!
                        const locScopeMatch = common.imageLocScopeMatch.exec(content);
                        if (locScopeMatch) {
                            onError({
                                lineNumber: text.lineNumber,
                                detail: detailStrings.imageIconRemoveLocScope,
                                context: text.line
                            });
                        }
                        //do we have alt-text? cuzzz, we shouldn't!
                        const altTextMatch = common.imageAltTextMatch.exec(content);
                        if (altTextMatch) {
                            onError({
                                lineNumber: text.lineNumber,
                                detail: detailStrings.imageIconRemoveAltText,
                                context: text.line
                            });
                        }
                    }
                };
            });
        } catch (error) {
            console.log(error);
        }
    }

};