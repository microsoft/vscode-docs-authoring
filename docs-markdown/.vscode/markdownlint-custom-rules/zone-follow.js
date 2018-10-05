// @ts-check

"use strict";

module.exports = {
    "names": ["zone-follow"],
    "description": `[Docs Markdown] Bad syntax for zone/moniker. One space required after ":::".`,
    "tags": ["test"],
    "function": function rule(params, onError) {
        params.tokens.filter(function filterToken(token) {
            return token.type === "inline";
        }).forEach(function forToken(inline) {
            inline.children.filter(function filterChild(child) {
                return child.type === "text";
            }).forEach(function forChild(text) {
                const content = text.content.toLowerCase();
                const zoneIndex = /^:/gm;
                const zoneSyntax = /^:::\s+/gm;
                if (content.match(zoneIndex)) {
                    if (!content.match(zoneSyntax)) {
                        onError({
                            "lineNumber": text.lineNumber
                        });
                    }
                }
            });
        });
    }
};
