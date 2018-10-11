// @ts-check

"use strict";

// Syntax
const zoneMonikerOpen = /^:(.*?)(zone|moniker)/gm;
const tripleColonSyntax = /^:::/gm;
const validTripleColon = /^:::\s+/gm;
const syntaxZone = /^:::\s+zone\s+target/gm;
const syntaxMoniker = /^:::\s+moniker\s+range/gm;
const acceptableValue = /^:::\s+(moniker\s+range|zone\s+target)/gm;
// Render
const renderZone = /^:::\s+zone\s+target="/gm;
// Range
const rangeMoniker = /^:::\s+moniker\s+range(=|<=|>=)"/gm;
// Value
const valueZone = /^:::\s+zone\s+target="(chromeless|docs)"/gm;

module.exports = {
    "names": ["zone-moniker"],
    "description": `Zone/moniker linting.`,
    "tags": ["test"],
    "function": function rule(params, onError) {
        params.tokens.filter(function filterToken(token) {
            return token.type === "inline";
        }).forEach(function forToken(inline) {
            inline.children.filter(function filterChild(child) {
                return child.type === "text";
            }).forEach(function forChild(text) {
                const content = text.content.toLowerCase();
                if (content.match(zoneMonikerOpen)) {
                    if (!content.match(tripleColonSyntax)) {
                        onError({
                            "lineNumber": text.lineNumber,
                            "detail": `Bad syntax for zone/moniker. Begin with "::: ".`
                        });
                    }
                    if (!content.match(validTripleColon)) {
                        onError({
                            "lineNumber": text.lineNumber,
                            "detail": `Bad syntax for zone/moniker. One space required after ":::".`
                        });
                    }
                    if (!content.match(acceptableValue)) {
                        onError({
                            "lineNumber": text.lineNumber,
                            "detail": `Bad syntax for zone/moniker. Only "zone target" and "moniker range" are supported.`
                        });
                    }
                    if (content.match(syntaxZone)) {
                        if (!content.match(renderZone)) {
                            onError({
                                "lineNumber": text.lineNumber,
                                "detail": `Bad syntax for render argument. Use "=" and put value in quotes.`
                            });
                        }
                    }
                    if (content.match(syntaxMoniker)) {
                        if (!content.match(rangeMoniker)) {
                            onError({
                                "lineNumber": text.lineNumber,
                                "detail": `Bad syntax for range argument. Use =, <=, or >=, and put value in quotes.`
                            });
                        }
                    }
                    if (content.match(syntaxZone)) {
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
