"use strict";

import { naturalLanguageCompare } from "../helper/common";
import { IHighlightLanguage, languages } from "../helper/highlight-langs";

const languageAliases = languages.map((lang: IHighlightLanguage) => lang.aliases[0]);
languageAliases.sort(naturalLanguageCompare);
export const DocsCodeLanguages = languageAliases;
export const languageRequired = "Select a programming language (required)";
