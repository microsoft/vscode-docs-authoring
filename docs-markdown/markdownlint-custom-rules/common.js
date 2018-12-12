// @ts-check

'use strict'

// Triple colon
module.exports.singleColon = /^:/gm
module.exports.tripleColonSyntax = /^:::/gm
module.exports.validTripleColon = /^:::\s+/gm

// Markdown extensions (add valid/supported extensions to list)
module.exports.openExtension = /^:(.*?)(zone|moniker)/gm
module.exports.supportedExtensions = /^:::\s+(zone|moniker|row|column|form)/gm
module.exports.unsupportedExtensionRegex = /^:::\s+(.*)/gm

// Zones
// to-do: update regex to support zone pivot once requirements are ready.
module.exports.openZone = /^:::\s+zone/gm
module.exports.syntaxZone = /^:::\s+zone\s+target/gm
module.exports.renderZone = /^:::\s+zone\s+target="/gm
module.exports.validZone = /^:::\s+zone\s+target="(chromeless|docs)"/gm
module.exports.endZone = /^:::\s+zone-end/gm
module.exports.zonePivot = /^:::\s+zone\s+pivot/gm

// Moniker
module.exports.openMoniker = /^:::\s+moniker/gm
module.exports.syntaxMoniker = /^:::\s+moniker\s+range/gm
module.exports.rangeMoniker = /^:::\s+moniker\s+range(=|<=|>=)"/gm

// Alert
module.exports.alertOpener = /^>\s+\[!/gm // regex to find "> [!"
module.exports.snippetOpener = /^>\s+\[!code-/gm // identify code snippet in text block, starting with "> [!code-"
module.exports.includeOpener = /^>\s+\[!INCLUDE/gm // identify include in text block, starting with "> [!INCLUDE"
module.exports.alertType = /^>\s+\[!(NOTE|TIP|IMPORTANT|CAUTION|WARNING)\]/gm // identify valid alert types (all caps)

// Links
module.exports.linkPattern = /(http:\/\/(|www\.))(visualstudio\.com|msdn\.com|microsoft\.com|office\.com|azure\.com|aka\.ms).*/
