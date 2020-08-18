'use-strict';

// Single line text resources
export const NonFormattedSingleLineText: string =
	'This is sample text. Singleline, without formatting.';
export const CodeFormattedSingleLineText: string =
	'`This is sample text in a markdown code block.`';
export const BoldFormattedSingleLineText: string =
	'**This is sample text in markdown bold format.**';
export const ItalicFormattedSingleLineText: string =
	'*This is sample text in markdown italic format.*';
export const NoteFormattedSingleLineText: string =
	'> [!NOTE]\r\n> This is sample text formatted as an alert of type "Note".';
export const ImportantFormattedSingleLineText: string =
	'> [!IMPORTANT]\r\n> This is sample text formatted as an alert of type "Important".';
export const WarningFormattedSingleLineText: string =
	'> [!WARNING]\r\n> This is sample text formatted as an alert of type "Warning".';
export const TipFormattedSingleLineText: string =
	'> [!TIP]\r\n> This is sample text formatted as an alert of type "Tip".';
export const NestedSingleLineCodeFormattedSingleLineText: string =
	'This is sample text with a `Nested Code` block inside it.';
export const CodeFormattedNestedSingleLineCodeFormattedSingleLineText: string =
	'`This is sample text with a `Nested Code` block inside it.`';
export const NestedBoldFormattedSingleLineText: string =
	'This is sample text with a **Nested Bold** block inside it.';
export const BoldFormattedNestedBoldFormattedSingleLineText: string =
	'**This is sample text with a **Nested Bold** block inside it.**';
export const NestedItalicFormattedSingleLineText: string =
	'This is sample text with a *Nested Italic* block inside it.';
export const ItalicFormattedNestedItalicFormattedSingleLineText: string =
	'*This is sample text with a *Nested Italic* block inside it.*';

// Multi line text resources. '\' is the multiline escape character for javascript.
export const NonFormattedMultiLineText: string =
	'This is sample text.\r\nIt has multiplelines in it.';
export const CodeFormattedMultilineText: string =
	'```\nThis is sample text in a markdown multiline code block.\n```\n';
export const BoldFormattedMultilineText: string =
	'**This is sample text in\r\nMarkdown bold format, multiline**';
export const ItalicFormattedMultilineText: string =
	'*This is sample text in\r\nMarkdown italic format, multiline*';
export const NoteFormattedMultilineText: string =
	'> [!NOTE]\r\n> This is sample text formatted as an alert of type "Note".\r\n> This is multiline text.';
export const ImportantFormattedMultilineText: string =
	'> [!IMPORTANT]\r\n> This is sample text formatted as an alert of type "Important".\r\n> This is multiline text.';
export const WarningFormattedMultilineText: string =
	'> [!WARNING]\r\n> This is sample text formatted as an alert of type "Warning".\r\n> This is multiline text.';
export const TipFormattedMultilineText: string =
	'> [!TIP]\r\n> This is sample text formatted as an alert of type "Tip".\r\n> This is multiline text.';
export const NestedMultilineCodeFormattedMultilineText: string =
	'This is sample text\r\n```\nThis is a\r\n code block\n```\nThere is code nested inside.';
export const NestedItalicFormatedMultillineText: string =
	'This is sample text *there\r\nis nested italic* in this block.';
export const NestedBoldFormatedMultilineText: string =
	'This is sample text **there\r\nis nested bold** in this block.';
export const BoldFormattedNestedBoldFormattedMultiLineText: string =
	'**This is sample text with a **Nested \r\n Bold** block inside it.**';
export const ItalicFormattedNestedItalicFormattedMultiLineText: string =
	'*This is sample text with a *Nested \r\n Italic* block inside it.*';
export const CodeFormattedNestedCodeFormattedMultilineText: string =
	'```\nThis is sample text with a \r\n```Nested Code \n```\n block inside it.\n```\n';

// Unformatted Strings with Includes, Art, GUID, Links
export const sampleGUID = 'This is a GUID: 60bbae04-174c-4841-90cf-fae6c3b164fb.';
export const sampleExternalLink =
	'This is an external link to bing.com: [Bing](http://www.bing.com)';
export const sampleInternalLink =
	'This is an internal link to a relative path: [A relative path](....README.md)';
export const sampleArtLink = 'An art link: ![Additionally](../media/link-checker-1.png)';
export const sampleInclude = '[!INCLUDE [README](../../README.md)]';

// Bookmark duplicate string
export const duplicateBookmarkString: string[] = ['# Test\r\n', '# Test\r\n', '## Test\r\n'];
export const expectBookmarkString: string[] = ['# Test\r\n', '# Test (1)\r\n', '## Test\r\n'];
