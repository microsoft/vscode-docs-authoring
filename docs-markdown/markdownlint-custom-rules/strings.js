// syntax
module.exports.syntaxCount = `Bad syntax for markdown extension. Begin with "::: ".`;
module.exports.syntaxSpace = `Bad syntax for markdown extension. One space required after ":::".`;
module.exports.syntaxUnsupportedExtension = `Bad syntax for markdown extension. Extension is not supported.`;

// moniker
module.exports.monikerRange = `Bad syntax for range argument. Use =, <=, or >=, and put value in quotes.`;
module.exports.monikerSyntax = `Bad syntax for moniker. Only "moniker range" is supported.`;

// no-loc
module.exports.noLocSyntax = `Bad syntax for non-localization.`;
module.exports.noLocNoDash = `Bad syntax for non-localization. "no-loc" requires a dash.`;
module.exports.noLocMissingTextAttribute = `Bad syntax for non-localization. Missing the "text" attribute.`;
module.exports.noLocColonsIncorrect = `Bad syntax for non-localization. Make sure "no-loc" begins and ends with ":::"`;
module.exports.noLocCaseSensitive = `Bad syntax for non-localization. ""no-loc" and "text" must be lower-case.`;
module.exports.noLocNoQuotes = `Bad syntax for non-localization. Quotes required.`;


// zone
module.exports.zoneSyntax = `Bad syntax for zone. Only "zone target", "zone pivot" and "zone-end" are supported.`;
module.exports.zoneRender = `Bad syntax for render argument. Use "=" and put value in quotes.`;
module.exports.zoneValue = `Bad value for zone target. Only "chromeless" and "docs" are supported.`;

// alert
module.exports.alertType = `Bad alert type. Only NOTE, TIP, IMPORTANT, CAUTION, and WARNING are supported. Case-sensitive.`;
module.exports.alertNoOpen = `Missing block opener. Alerts must be preceded by ">" plus a space.`;
module.exports.alertNoExclam = `Bad alert syntax. Alerts must include exclamation point within brackets, such as "> [!NOTE]"`;

//xref
module.exports.xrefSyntax = `Bad xref syntax. Xref syntax should look like this: "<xref:System.Format.String%2A>" or with the optional displayProperty "<xref:System.Format.String%2A?displayProperty=fullName>". <xref:...> contained within angle brackets followed by a colon. It should have a xref id like System.Format.String and an optional displayProperty`;
module.exports.missingUidAttributeXref = `Missing xref uid after <xref:. Xref must include uid, such as "<xref:System.Format.String%2A>".`;
module.exports.usesCorrectXrefDisplayProperties = `Bad displayProperty value. Display property must be either fullName or nameWithType "<xref:System.Format.String%2A?displayProperty=fullName>". Or remove the display property completely "<xref:System.Format.String%2A>".`;
module.exports.xrefShouldIncludeColon = `Bad xref syntax. xref should include a colon "<xref:System.Format.String%2A>".`;
module.exports.xrefHasSpace = `Bad xref syntax. xref should not include a space before the xref uid "<xref:System.Format.String%2A>".`;
module.exports.xrefHasDisplayPropertyQuestionMark = `Bad xref syntax. xref should also contain displayProperty=fullName or nameWithType "<xref:System.Format.String%2A?displayProperty=fullName>". Or remove the display property completely "<xref:System.Format.String%2A>".`;

// row
module.exports.rowSyntax = `Rows should begin :::row::: and end with :::row-end:::).`;

// column
module.exports.columnSyntax = `Columns should begin :::column::: and end with :::column-end:::).`;
module.exports.contenSpanAttribute = `Only span is supported (ex. :::column span="":::).`;


