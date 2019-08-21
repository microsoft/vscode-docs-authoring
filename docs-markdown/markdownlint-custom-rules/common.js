// @ts-check

"use strict";

// Triple colon
module.exports.singleColon = /^:/gm;
module.exports.tripleColonSyntax = /^:::\s?/gm;
module.exports.validTripleColon = /^:::\s+/gm;

// Markdown extensions (add valid/supported extensions to list)
module.exports.openExtension = /^:(.*?)(zone|moniker|no-loc)/gm;
module.exports.supportedExtensions = /^:::\s?(zone|moniker|row|column|form|no-loc)(.:*)/g;
module.exports.unsupportedExtensionRegex = /^:::\s+(.*)/gm;

// Zones
// to-do: update regex to support zone pivot once requirements are ready.
module.exports.openZone = /^:::\s+zone/gm;
module.exports.syntaxZone = /^:::\s+zone\s+target/gm;
module.exports.renderZone = /^:::\s+zone\s+target="/gm;
module.exports.validZone = /^:::\s+zone\s+target="(chromeless|docs)"/gm;
module.exports.endZone = /^:::\s+zone-end/gm;
module.exports.zonePivot = /^:::\s+zone\s+pivot/gm;

// Moniker
module.exports.openMoniker = /^:::\s+moniker/gm;
module.exports.syntaxMoniker = /^:::\s+moniker\s+range/gm;
module.exports.rangeMoniker = /^:::\s+moniker\s+range(=|<=|>=)"/gm;

//no-loc
module.exports.openNoLoc = /(.:*)no-loc\s/gmi;
module.exports.openNoDashNoLoc = /(.:*)noloc\s/gmi;
module.exports.missingTextAttributeNoLoc = /(.:*)(.\s*)no-loc\stext/gmi;
module.exports.syntaxNoLocLooseMatch = /(.:*)(.\s*)(no-loc|noloc)\s(\w+)=(.\"*)([a-zA-Z'-\s]*)(.\"*)(.:*)/gmi
module.exports.syntaxNoLocCaseSensitive = /(.:*)no-loc\stext=(.\"*)([a-zA-Z'-\s]*)(.\"*)(.:*)/gm
module.exports.syntaxQuotesNoLoc = /(.:*)no-loc\stext=\"([a-zA-Z'-\s]*)\"(.:*)/gmi
module.exports.syntaxNoLoc = /:::no-loc\stext=\"([a-zA-Z'-\s]*)\":::/gm;

// Alert
module.exports.alertOpener = /^>\s+\[!/gm; // regex to find "> [!"
module.exports.snippetOpener = /^>\s+\[!code-/gm; //identify code snippet in text block, starting with "> [!code-"
module.exports.includeOpener = /^>\s+\[!INCLUDE/gm; //identify include in text block, starting with "> [!INCLUDE"
module.exports.alertType = /^>\s+\[!(NOTE|TIP|IMPORTANT|CAUTION|WARNING)\]/gm; //identify valid alert types (all caps)
module.exports.bracketExclam = /^\[!/gm; //identify syntax beginning with "[!" at the start of a line
module.exports.alertTypeNoOpen = /^\[!(NOTE|TIP|IMPORTANT|CAUTION|WARNING)\]/gm; //identify attempted alerts not preceded by "> "
// module.exports.inlineAlert = ... Need regex to catch non-whitespace characters on same line as alert identifier
// /^>\s+\[!(NOTE|TIP|IMPORTANT|CAUTION|WARNING)\]\s*\S+/gm is close but doesn't notice line break so we get 
// false hits.
// ^>\s+\[!(NOTE|TIP|IMPORTANT|CAUTION|WARNING)\][ \t]*[a-zA-Z0-9]/gm is closer but needs to also support non-letters and numbers
module.exports.alertNoExclam = /\[(NOTE|TIP|IMPORTANT|CAUTION|WARNING)\]/gm; //identify alerts missing !

//Links
module.exports.linkPattern = /(http:\/\/(|www\.))(visualstudio\.com|msdn\.com|microsoft\.com|office\.com|azure\.com|aka\.ms).*/;

//xref
module.exports.openXref = /<xref.*(>)?/gmi;
module.exports.xrefHasSpace = /<xref:[ ]+(>)?/gmi;
module.exports.xrefShouldIncludeColon = /<xref(?!:)([A-Za-z_.\-\*\(\)\,\%0-9\`}{\[\]]+)?(\?displayProperty=(fullName|nameWithType))?(>)?/gmi;
module.exports.missingUidAttributeXref = /<xref:(\?displayProperty=(fullName|nameWithType))?>/g;
module.exports.usesCorrectXrefDisplayProperties = /<xref:([A-Za-z_.\-\*\(\)\,\%0-9\`}{\[\]]+)(\?displayProperty=(?!fullName|nameWithType))(>)?/g;
module.exports.xrefHasDisplayPropertyQuestionMark = /<xref:([A-Za-z_.\-\*\(\)\,\%0-9\`}{\[\]]+)(\?)(?!displayProperty=.*)(>)?/g;
module.exports.syntaxXref = /<xref:([A-Za-z_.\-\*\(\)\,\%0-9\`}{\[\]]+)(\?displayProperty=(fullName|nameWithType))?>/g;

// Row
module.exports.startRow = /^(.:*)(.+row)/gm;
module.exports.syntaxRow = /^:{3}(row|row-end):{3}$/gm;

// Column
module.exports.startColumn = /^\s+(:*)(.+column)/gm;
module.exports.syntaxColumn = /^\s+:{3}(column|column-end|column\s+(.*)"):{3}$/gm;
module.exports.columnWithAttribute = /^\s+:{3}(column\s+(.*?)):/gm;
module.exports.columnSpan = /^\s+:{3}(column\s+span="(.*?)"):/gm;


