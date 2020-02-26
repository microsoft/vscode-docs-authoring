"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("../helper/common");
const highlight_langs_1 = require("../helper/highlight-langs");
const languageAliases = highlight_langs_1.languages.map((lang) => lang.aliases[0]);
languageAliases.sort(common_1.naturalLanguageCompare);
exports.DocsCodeLanguages = languageAliases;
exports.languageRequired = "Select a programming language (required)";
//# sourceMappingURL=docs-code-languages.js.map