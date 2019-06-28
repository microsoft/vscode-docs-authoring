// syntax
module.exports.syntaxCount = `Bad syntax for markdown extension. Begin with "::: ".`;
module.exports.syntaxSpace = `Bad syntax for markdown extension. One space required after ":::".`;
module.exports.syntaxUnsupportedExtension = `Bad syntax for markdown extension. Extension is not supported.`;

// moniker
module.exports.monikerRange = `Bad syntax for range argument. Use =, <=, or >=, and put value in quotes.`;
module.exports.monikerSyntax = `Bad syntax for moniker. Only "moniker range" is supported.`;

// no-loc
module.exports.noLocSyntax = `Bad syntax for non-localization.`;
module.exports.noLocMissingTextAttribute = `Bad syntax for non-localization. Missing the "text" attribute.`;
module.exports.noLocMissingTextAttribute = `Bad syntax for non-localization. ""no-loc" and "text" must be lower-case.`;

// zone
module.exports.zoneSyntax = `Bad syntax for zone. Only "zone target", "zone pivot" and "zone-end" are supported.`;
module.exports.zoneRender = `Bad syntax for render argument. Use "=" and put value in quotes.`;
module.exports.zoneValue = `Bad value for zone target. Only "chromeless" and "docs" are supported.`;

// alert
module.exports.alertType = `Bad alert type. Only NOTE, TIP, IMPORTANT, CAUTION, and WARNING are supported. Case-sensitive.`;
module.exports.alertNoOpen = `Missing block opener. Alerts must be preceded by ">" plus a space.`;
module.exports.alertNoExclam = `Bad alert syntax. Alerts must include exclamation point within brackets, such as "> [!NOTE]"`;