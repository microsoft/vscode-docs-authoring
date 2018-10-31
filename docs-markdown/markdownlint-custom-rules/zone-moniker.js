// @ts-check

"use strict";

// Expected values
const zoneMonikerOpen = /^:(.*?)(zone|moniker)/gm;
const validTripleColon = /^:::\s+(zone|moniker)/gm;
const syntaxZone = /^:::\s+zone\s+target/gm;
const syntaxMoniker = /^:::\s+moniker\s+range/gm;

// Used for linting conditions
const singleColon = /^:/gm;
const tripleColonSyntax = /^:::/gm;
const acceptableValue = /^:::\s+(moniker\s+range|zone\s+target)/gm;
const renderZone = /^:::\s+zone\s+target="/gm;
const rangeMoniker = /^:::\s+moniker\s+range(=|<=|>=)"/gm;
const valueZone = /^:::\s+zone\s+target="(chromeless|docs)"/gm;

module.exports = {
    "names": ["zone-moniker"],
    "description": `Zone/moniker linting.`,
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
                if (content.match(singleColon)) {
                    // Condition: Line begins with fewer or more than three colons.
                    if (!content.match(tripleColonSyntax) && content.match(zoneMonikerOpen)) {
                        onError({
                            "lineNumber": text.lineNumber,
                            "detail": `Bad syntax for zone/moniker. Begin with "::: ".`
                        });
                    }
                    // Condition: Three colons are followed by fewer or more than one space.
                    if (!content.match(validTripleColon) && content.match(zoneMonikerOpen)) {
                        onError({
                            "lineNumber": text.lineNumber,
                            "detail": `Bad syntax for zone/moniker. One space required after ":::".`
                        });
                    }
                    // Condition: After three colons and a space, text is other than "zone target" or "moniker range".
                    if (!content.match(acceptableValue) && content.match(tripleColonSyntax)) {
                        onError({
                            "lineNumber": text.lineNumber,
                            "detail": `Bad syntax for zone/moniker. Only "zone target" and "moniker range" are supported.`
                        });
                    }
                    // Condition: "zone target" followed by characters other than =".
                    if (content.match(syntaxZone) && content.match(zoneMonikerOpen)) {
                        if (!content.match(renderZone)) {
                            onError({
                                "lineNumber": text.lineNumber,
                                "detail": `Bad syntax for render argument. Use "=" and put value in quotes.`
                            });
                        }
                    }
                    // Condition: "moniker range" followed by characters other than =", <=", or >=".
                    if (content.match(syntaxMoniker) && content.match(zoneMonikerOpen)) {
                        if (!content.match(rangeMoniker)) {
                            onError({
                                "lineNumber": text.lineNumber,
                                "detail": `Bad syntax for range argument. Use =, <=, or >=, and put value in quotes.`
                            });
                        }
                    }
                    // Condition: Value of "zone target=" is other than "chromeless" or "docs".
                    if (content.match(syntaxZone) && content.match(zoneMonikerOpen)) {
                        if (!content.match(valueZone)) {
                            onError({
                                "lineNumber": text.lineNumber,
                                "detail": `Bad value for zone target. Use "=" and put value in quotes..`
                            });
                        }
                    }
                }
            });
        });
    }
};
