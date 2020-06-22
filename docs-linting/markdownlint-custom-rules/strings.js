// syntax
module.exports.syntaxCount = `Bad syntax for markdown extension. Begin with "::: ".`;
module.exports.syntaxSpace = `Bad syntax for markdown extension. One space required after ":::".`;
module.exports.syntaxUnsupportedExtension = `Bad syntax for markdown extension. Extension is not supported.`;
module.exports.tripleColonsIncorrect = `Bad syntax for markdown extension. Begins and end with ":::".`;

// moniker
module.exports.monikerRangeArgs = `Bad syntax for range argument. Use =, <=, or >=, and put value in quotes.`;
module.exports.monikerRange = `Bad syntax for moniker. "range" is a required attribute and must not be empty.`;
module.exports.monikerNonAllowedAttribute = `Bad syntax for moniker. "___" is not an allowed attribute.`;
module.exports.monikerCaseSensitive = `Bad syntax for moniker. "moniker" and "range" must be lower-case.`;
module.exports.monikerEndTagRequired = `Bad syntax for moniker. Matching :::moniker-end is required.`;

// no-loc
module.exports.noLocSyntax = `Bad syntax for non-localization.`;
module.exports.noLocNoDash = `Bad syntax for non-localization. "no-loc" requires a dash.`;
module.exports.noLocMissingTextAttribute = `Bad syntax for non-localization. Missing the "text" attribute.`;
module.exports.NoLocNonAllowedAttribute = `Bad syntax for non-localization. "___" is not an allowed attribute.`;
module.exports.noLocColonsIncorrect = `Bad syntax for non-localization. Make sure "no-loc" begins and ends with ":::"`;
module.exports.noLocCaseSensitive = `Bad syntax for non-localization. ""no-loc" and "text" must be lower-case.`;
module.exports.noLocNoQuotes = `Bad syntax for non-localization. Quotes required.`;
module.exports.noLocDoubleQuotes = `Bad syntax for non-localization. Double quotes (") required.`;

// image
module.exports.imageCaseSensitive = `Bad syntax for image. "image" and its attributes must be lower-case.`;
module.exports.imageNonAllowedAttribute = `Bad syntax for image. "___" is not an allowed attribute.`;
module.exports.imageAttributeWrongStrongTypeBoolean = `Bad syntax for image. The value for "___" is not valid. It must be "true" or "false"`;
module.exports.imageNonAllowedType = `Bad syntax for image. "___" is not an allowed type. Options are "content", "complex", "icon"`;
module.exports.imageComplexLongDescriptionRequired = `Bad syntax for image. If image type is "complex", a long description is required.`;
module.exports.imageComplexEndTagRequired = `Bad syntax for image. If image type is "complex", ":::image-end:::" is required.`;
module.exports.imageSourceRequired = `Bad syntax for image. "source" required.`;
module.exports.imageLightboxSourceInvalid = `Bad syntax for image. An image source for the "lightbox" attribute is needed.`;
module.exports.imageAltTextRequired = `Bad syntax for image. "alt-text" required for "complex" and "content" image types.`;
module.exports.imageIconRemoveLocScope = `Bad syntax for image. "loc-scope" not allowed for icon images`;
module.exports.imageIconRemoveAltText = `Bad syntax for image. "alt-text" not allowed for icon images`;

// zone
module.exports.zoneSyntax = `Bad syntax for zone. Only "zone target", "zone pivot" and "zone-end" are supported.`;
module.exports.zoneRender = `Bad syntax for render argument. Use "=" and put value in quotes.`;
module.exports.zoneValue = `Bad value for zone target. Only "chromeless" and "docs" are supported.`;
module.exports.zoneSyntax = `zones should begin :::zone and end with :::zone-end).`;
module.exports.zoneEndTagRequired = `Bad syntax for zone. Matching :::zone-end is required.`;
module.exports.zoneNonAllowedAttribute = `"___" is not an allowed attribute on :::zone tag.`;
module.exports.zoneCaseSensitive = `zone attribute "___" must be lower-case.`;
module.exports.zoneNonAllowedType = `Bad syntax for zone. "___" is not an allowed target type. Options are "chromeless", and "docs"`;

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
module.exports.notEscapedCharacters = `Unescaped xref syntax. The following Characters should be escaped *(%2A) #(%23) \`(%60).`;

// row
module.exports.rowSyntax = `Rows should begin :::row::: and end with :::row-end:::).`;
module.exports.rowSyntax = `rows should begin :::row::: and end with :::row-end:::).`;
module.exports.contenSpanAttribute = `Only span is supported (ex. :::row span="":::).`;
module.exports.rowEndTagRequired = `Bad syntax for row. Matching :::row-end::: is required.`;
module.exports.rowNonAllowedAttribute = `"___" is not an allowed attribute on :::row::: tag.`;
module.exports.rowCaseSensitive = `row attribute "___" must be lower-case.`;
module.exports.rowCountMustBeNumber = `row "count" value must be a number (2-4).`;
module.exports.rowCountValue = `row "count" value must be 2 thru 4.`;

// column
module.exports.columnSyntax = `Columns should begin :::column::: and end with :::column-end:::).`;
module.exports.contenSpanAttribute = `Only span is supported (ex. :::column span="":::).`;
module.exports.columnEndTagRequired = `Bad syntax for column. Matching :::column-end::: is required.`;
module.exports.columnNonAllowedAttribute = `"___" is not an allowed attribute.`;
module.exports.columnCaseSensitive = `column attribute "___" must be lower-case.`;

// codesnippet
module.exports.codeCaseSensitive = `"code" and its attributes must be lower-case.`;
module.exports.codeNonAllowedAttribute = `"___" is not an allowed attribute. Allowed attributes include "language", "source", "range", "id", "interactive", "highlight"`;
module.exports.codeSourceRequired = `"source" is required.`;
module.exports.codeLanguageRequired = `"language" is required.`;
module.exports.codeRangeOrId = `You cannot have both "range" and "id" properties. Choose one or the other.`;
module.exports.allowedRangeValues = `Allowed range values must match the regex [0-9- ,]+.`;
module.exports.allowedInteractiveValues = `"___" is not an allowed value for interactive. Allowed values include: "try-dotnet", "try-dotnet-method", "try-dotnet-class", "cloudshell-powershell", "cloudshell-bash"`;

// logging
module.exports.failedResponse = `There was an error pulling NAME schema data from URL.`;

// video
module.exports.videoCaseSensitive = `Bad syntax for video. video attribute "___" must be lower-case.`;
module.exports.videoNonAllowedAttribute = `Bad syntax for video. "___" is not an allowed attribute.`;
module.exports.videoNonAllowedType = `Bad syntax for video. "___" is not an allowed type. Options are "content", "complex", "icon"`;
module.exports.videoSourceRequired = `Bad syntax for video. "source" required.`;
module.exports.videoTitleRequired = `Bad syntax for video. "title" required for "complex" and "content" video types.`;
module.exports.videoSourceUrl =
	'Video source, should be from https://channel9.msdn.com, https://www.youtube.com/embed, or https://www.microsoft.com/en-us/videoplayer/embed';
module.exports.videoChannel9 =
	"Your source from channel9.msdn.com does not end in '/player'. Please make sure you are correctly linking to the Channel 9 video player.";
