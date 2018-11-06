// @ts-check

"use strict";

// Triple colon
module.exports.singleColon = /^:/gm;
module.exports.tripleColonSyntax = /^:::/gm;
module.exports.validTripleColon = /^:::\s+/gm;

// Markdown extensions (add valid/supported extensions to list)
module.exports.openExtension = /^:(.*?)(zone|moniker)/gm;
module.exports.supportedExtensions = /^:::\s+(zone|moniker)/gm;
module.exports.unsupportedExtensionRegex = /^:::\s+(.*)/gm;

// Zones
module.exports.openZone = /^:::\s+zone/gm;
module.exports.syntaxZone = /^:::\s+zone\s+target/gm;
module.exports.renderZone = /^:::\s+zone\s+target="/gm;
module.exports.validZone = /^:::\s+zone\s+target="(chromeless|docs)"/gm;
module.exports.endZone = /^:::\s+zone-end/gm;

// Moniker
module.exports.openMoniker = /^:::\s+moniker/gm;
module.exports.syntaxMoniker = /^:::\s+moniker\s+range/gm;
module.exports.rangeMoniker = /^:::\s+moniker\s+range(=|<=|>=)"/gm;
