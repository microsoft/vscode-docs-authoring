'use strict';

// Triple colon
module.exports.singleColon = /^:/gm;
module.exports.tripleColonSyntax = /^:::\s?/gm;
module.exports.validTripleColon = /^:::\s+/gm;
module.exports.openAndClosingValidTripleColon = /^:::(.*):::/gim;
module.exports.AttributeMatchGlobal = /(\S+)=["]?((?:.(?!["]?\s+(?:\S+)=|["]))+.)["]?/gi;
module.exports.AttributeMatch = /(\S+)=["]?((?:.(?!["]?\s+(?:\S+)=|["]))+.)["]?/;

// Markdown extensions (add valid/supported extensions to list)
module.exports.openExtension = /^:(.*?)(zone|moniker|no-loc)/gm;
module.exports.supportedExtensions = /^:::\s?(zone|moniker|row|column|form|no-loc|image|code|video|notes)(.:*)?/g;
module.exports.unsupportedExtensionRegex = /^:::\s+(.*)/gm;

// Zones
// to-do: update regex to support zone pivot once requirements are ready.
module.exports.openZone = /^:::\s*zone/gm;
module.exports.syntaxZone = /^:::\s*zone\s+target/gm;
module.exports.renderZone = /^:::\s*zone\s+target="/gm;
module.exports.validZone = /^:::\s*zone\s+target="(chromeless|docs)"/gm;
module.exports.endZone = /^:::\s*zone-end/gm;
module.exports.zonePivot = /^:::\s*zone\s+pivot/gm;
module.exports.looseZone = /(:+)\s*zone(?!-end)\s*((.*?)=".*?")?([^]+?(:*?)\s*zone-end?)?/gi;
module.exports.startZone = /:::\s*zone(?!-end)/gm;
module.exports.zoneEndTagMatch = /:::(\s*)?zone-end/gim;
module.exports.syntaxZone = /:{3}\s*(zone|zone-end|zone\s+(.*)"):{3}$/gm;
module.exports.zoneWithAttribute = /:{3}\s*(zone\s+(.*?))\S\s/gm;
module.exports.zoneAttributeMatchGlobal = /:::\s*zone(?!-).*?/gi;
module.exports.zoneTargetMatch = /target\s*=\s*"(.*?)"/m;

// Moniker
module.exports.looseMoniker = /:::\s*moniker(?!-end)(\s*.*="(.*?)")?([^]+?:::\s*moniker-end)?/gim;
module.exports.rangeMonikerWithArgs = /^:::\s*moniker\s+range="(<=|>=)?/gim;
module.exports.rangeMoniker = /range\s*=\s*"(.*?)"/im;
module.exports.endMoniker = /^:::\s*moniker-end/gim;
module.exports.openMoniker = /^:::\s*moniker/gim;
module.exports.startMoniker = /:::\s*moniker(?!-end)/gm;
module.exports.monikerEndTagMatch = /:::(\s*)?moniker-end/gim;
module.exports.allowedMonikerAttributes = ['range'];

//no-loc
module.exports.openNoLoc = /(:*)no-loc/gim;
module.exports.openNoDashNoLoc = /(:*)noloc/gim;
module.exports.missingTextAttributeNoLoc = /([a-z-]*(?==))/gim;
module.exports.allowedNoLocAttributes = ['text'];
module.exports.noLocTextMatch = /text\s*=\s*(")?(.*?)(")?/;
module.exports.syntaxNoLocLooseMatch = /:::(.\s*)?(no-loc|noloc)(\s)?((\w+)=)?(")?(.*?)(")?:::/gim;
module.exports.syntaxNoLocCaseSensitive = /(:::)no-loc\stext=(")?(.*?)(")?(:::)/gm;
module.exports.syntaxNoQuotesNoLoc = /:::no-loc\stext=(.*?):::/gim;
module.exports.syntaxSingleQuotesNoLoc = /:::no-loc\stext='(.*?)':::/gim;
module.exports.syntaxNoLoc = /:::no-loc\stext="(.*?)":::/gm;

//image
module.exports.syntaxImageLooseMatch = /((:+)(.\s*)(image.*(complex))(.\s*)(.*)(.:*)\s*(.*)\s*(.:*)([a-z]*-[a-z]*)(.:*))|((:+)(.\s*)(image)(.\s*)(.*)(.:*))/gim;
module.exports.syntaxImageAttributes = /(:image)|([a-z-]*(?==))/gim;
module.exports.allowedImageTypes = ['content', 'complex', 'icon'];
module.exports.imageTypeMatch = /type\s*=\s*"([a-z]*)"/m;
module.exports.imageLongDescriptionMatch = /(:::)(.*)(:::)(((\s)*(.*))+)(:::)(.*)(:::)/im;
module.exports.imageComplexEndTagMatch = /:::(\s*)?image-end:::/gim;
module.exports.imageOpen = /:::image/gim;
module.exports.imageLightboxMatch = /lightbox\s*=\s*"(.*?)"/m;
module.exports.imageSourceMatch = /source\s*=\s*"(.*?)"/m;
module.exports.imageAltTextMatch = /alt-text\s*=\s*"(.*?)"/m;
module.exports.imageLocScopeMatch = /loc-scope\s*=\s*"(.*?)"/m;
module.exports.imageAltTextTypes = ['content', 'complex'];

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
module.exports.openXref = /(<|\()xref(:)?.*?(>|\))/gim;
module.exports.xrefHasSpace = /(<|\()xref:[ ]+((>|\)))?/gim;
module.exports.xrefShouldIncludeColon = /(<|\()xref(?!:)(.*?)?(\?(displayProperty=(fullName|nameWithType)|view=(.*?))(&)?(displayProperty=(fullName|nameWithType)|view=(.*?)))?(?<!.md)(>|\))/gim;
module.exports.missingUidAttributeXref = /(<|\()xref:(\?(displayProperty=(fullName|nameWithType)|view=(.*?))(&)?(displayProperty=(fullName|nameWithType)|view=(.*?)))?(>|\))/g;
module.exports.xrefHasPropertyQuestionMark = /(<|\()xref:(.*?)(\?)((>|\)))?/g;
module.exports.xrefHasDisplayProperty = /displayProperty=/g;
module.exports.xrefDisplayPropertyValues = /displayProperty=(fullName|nameWithType)/g;
module.exports.xrefHasTwoProperties = /&/g;
module.exports.syntaxXref = /(<|\()xref:(.*?)(\?)?(displayProperty=(fullName|nameWithType)|view=(.*?))(&)?(displayProperty=(fullName|nameWithType)|view=(.*?))?(>|\))/g;
module.exports.notEscapedCharacters = /(<|\()xref:(.*[*#`].*)(>|\))/g;

// Row
module.exports.looseRow = /(:+)\s*row\s*(count=".*?")?(:*)?([^]+?(:*)row-end?(:*))?/gi;
module.exports.startRow = /:::\s*row(?!-end)/gm;
module.exports.rowEndTagMatch = /:::(\s*)?row-end\s*:::/gim;
module.exports.rowEnd = /:::(\s*)?row-end\s*:::/;
module.exports.syntaxrow = /:{3}\s*(row|row-end|row\s+(.*)"):{3}$/gm;
module.exports.rowWithAttribute = /:{3}\s*(row\s+(.*?)):/gm;
module.exports.rowCount = /:{3}\s*(row\s+count="(.*?)"):/gm;
module.exports.rowAttributeMatchGlobal = /:::\s*row(?!-).*?:::/gi;
module.exports.rowCountValue = /count\s*=\s*"(.*?)"/i;

// Column
module.exports.looseColumn = /(:+)\s*column\s*(span=".*?")?(:*)?([^]+?(:*)column-end?(\s*)?(:*))?/gi;
module.exports.startColumn = /:::\s*column(?!-end)/gm;
module.exports.columnEndTagMatch = /\s*:::(\s*)?column-end(\s*)?:::/gim;
module.exports.columnEnd = /\s*:::(\s*)?column-end(\s*)?:::/;
module.exports.syntaxColumn = /:{3}\s*(column|column-end|column\s+(.*)"):{3}$/gm;
module.exports.columnWithAttribute = /:{3}\s*(column\s+(.*?)):/gm;
module.exports.columnSpan = /:{3}\s*(column\s+span="(.*?)"):/gm;
module.exports.columnAttributeMatchGlobal = /:::\s*column(?!-).*?:::/gi;

//codesnippet
module.exports.syntaxCodeLooseMatch = /(:+)(\s+)?code.*?(:+)/g;
module.exports.syntaxCodeExactMatch = /:::(\s+)?code\s+(source|range|id|highlight|language|interactive)=".*?"(\s+)?((source|range|id|highlight|language|interactive)=".*?"(\s+))?((source|range|id|highlight|language|interactive)=".*?"\s+)?((source|range|id|highlight|language|interactive)=".*?"\s+)?((source|range|id|highlight|language|interactive)=".*?"(\s+)?)?:::/i;
module.exports.syntaxCodeAttributes = /([a-z]*(?==))/g;
module.exports.allowedCodeAttributes = [
	':code',
	'language',
	'source',
	'range',
	'id',
	'interactive',
	'highlight'
];
module.exports.codeOpen = /:::code/i;
module.exports.codeSourceMatch = /source="(.*?)"/;
module.exports.codeLanguageMatch = /language="(.*?)"/;
module.exports.codeRangeMatch = /range="(.*?)"/;
module.exports.codeIdMatch = /id="(.*?)"/;
module.exports.allowedRangeValues = /[0-9\- ,]+/;
module.exports.codeInteractiveMatch = /interactive="(.*?)"/;
module.exports.allowedInteractiveValues = [
	'try-dotnet',
	'try-dotnet-method',
	'try-dotnet-class',
	'cloudshell-powershell',
	'cloudshell-bash'
];

//video
module.exports.syntaxVideoLooseMatch = /(:+)\s*video\s*(((.*)?="(.*?)")?(.:+)?)?/gim;
module.exports.videoOpen = /:::video/gim;
module.exports.videoSourceMatch = /source\s*=\s*"(.*?)"/m;
module.exports.videoTitleMatch = /title\s*=\s*"(.*?)"/m;
module.exports.videoMaxWidthMatch = /max-width\s*=\s*"(.*?)"/m;
module.exports.allowedVideoAttributes = ['source', 'title', 'max-width'];

module.exports.getMaxLineNotEmpty = function getMaxLineNotEmpty(lines) {
	if (lines.length > 1) {
		const lastElement = lines[lines.length - 1];
		if (lastElement) {
			return lines.length;
		} else {
			const arr = lines.slice(0, -1);
			return getMaxLineNotEmpty(arr);
		}
	}
	return 1;
};
