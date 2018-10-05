// @ts-check

"use strict";

module.exports = {
    "names": ["zone-target", "monitor-range"],
    "description": `[Docs Markdown] Bad syntax for zone/moniker. Only "zone target" and "moniker range" are supported.`,
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
                const zoneSyntax = /^:::\s+zone\s+target/gm;
                const monikerSyntax = /^:::\s+moniker\s+range/gm;
                if (content.match(zoneIndex)) {
                    if (!content.match(zoneSyntax) && !content.match(monikerSyntax)) {
                        onError({
                            "lineNumber": text.lineNumber
                        });
                    }
                }
            });
        });
    }
};
