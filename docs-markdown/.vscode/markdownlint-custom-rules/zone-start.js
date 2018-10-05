// @ts-check

"use strict";

module.exports = {
    "names": ["zone-start"],
    "description": `[Docs Markdown] Bad syntax for zone/moniker. Begin with ":::".`,
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
                const zoneSytax = /^:::/gm;
                if (content.match(zoneIndex)) {
                    if (!content.match(zoneSytax)) {
                        onError({
                            "lineNumber": text.lineNumber
                        });
                    }
                }
            });
        });
    }
};
