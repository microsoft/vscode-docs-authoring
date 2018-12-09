// @ts-check

"use strict";

const common = require("./common");
const detailStrings = require("./strings");

module.exports = {
  "names": ["docsmd.securelinks"],
  "description": "All links to Microsoft properties should be secure",
  "tags": ["compliance"],
  "function": function rule(params, onError) {
    params.tokens.filter(function filterToken(token) {
      return token.type === "inline";
    }).forEach(function forToken(inline) {
      inline.children.filter(function filterChild(child) {
        return child.type === "link_open";
      }).forEach(function forToken(link) {
        if (link.attrs[0] && link.attrs[0][0] == "href") {

          const linkPattern = /^(http:\/\/www\.|http:\/\/)([^\/]*)\/.*$/;

          const originalHref = link.attrs[0][1];
          let href = originalHref.toLowerCase();
          if (href.startsWith("http://")) {
            let match = href.match(linkPattern);
            let domain = "";
            if (match && match.length === 3) {
              domain = match[2];
              if (domain.includes("microsoft.com")
                || domain.includes("azure.com")
                || domain.includes("visualstudio.com")
                || domain.includes("msdn.com")) {
                let range = null;
                let column = link.line.indexOf(originalHref);
                let length = href.length;
                range = [column, length];
                onError({
                  "lineNumber": link.lineNumber,
                  "detail": "Link " + href,
                  "context": link.line,
                  "range": range
                });
              }
            }
          }
        }
      });
    });
  }
};
