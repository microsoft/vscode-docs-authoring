'use-strict'

//Single line text resources
export var NonFormattedSingleLineText: string = "This is sample text. Singleline, without formatting.";
export var CodeFormattedSingleLineText: string = "`This is sample text in a markdown code block.`";
export var BoldFormattedSingleLineText: string = "**This is sample text in markdown bold format.**";
export var ItalicFormattedSingleLineText: string = "*This is sample text in markdown italic format.*";
export var NoteFormattedSingleLineText: string = "> [!NOTE]\r\n> This is sample text formatted as an alert of type \"Note\".";
export var ImportantFormattedSingleLineText: string = "> [!IMPORTANT]\r\n> This is sample text formatted as an alert of type \"Important\".";
export var WarningFormattedSingleLineText: string = "> [!WARNING]\r\n> This is sample text formatted as an alert of type \"Warning\".";
export var TipFormattedSingleLineText: string = "> [!TIP]\r\n> This is sample text formatted as an alert of type \"Tip\".";
export var NestedSingleLineCodeFormattedSingleLineText: string = "This is sample text with a `Nested Code` block inside it.";
export var CodeFormattedNestedSingleLineCodeFormattedSingleLineText: string = "`This is sample text with a `Nested Code` block inside it.`";
export var NestedBoldFormattedSingleLineText: string = "This is sample text with a **Nested Bold** block inside it.";
export var BoldFormattedNestedBoldFormattedSingleLineText: string = "**This is sample text with a **Nested Bold** block inside it.**";
export var NestedItalicFormattedSingleLineText: string = "This is sample text with a *Nested Italic* block inside it.";
export var ItalicFormattedNestedItalicFormattedSingleLineText: string = "*This is sample text with a *Nested Italic* block inside it.*";

//Multi line text resources. '\' is the multiline escape character for javascript.
export var NonFormattedMultiLineText: string =
    "This is sample text.\r\nIt has multiplelines in it.";
export var CodeFormattedMultilineText: string =
    "```\nThis is sample text in a markdown multiline code block.\n```\n";
export var BoldFormattedMultilineText: string =
    "**This is sample text in\r\nMarkdown bold format, multiline**";
export var ItalicFormattedMultilineText: string =
    "*This is sample text in\r\nMarkdown italic format, multiline*";
export var NoteFormattedMultilineText: string = "> [!NOTE]\r\n> This is sample text formatted as an alert of type \"Note\".\r\n> This is multiline text.";
export var ImportantFormattedMultilineText: string = "> [!IMPORTANT]\r\n> This is sample text formatted as an alert of type \"Important\".\r\n> This is multiline text.";
export var WarningFormattedMultilineText: string = "> [!WARNING]\r\n> This is sample text formatted as an alert of type \"Warning\".\r\n> This is multiline text.";
export var TipFormattedMultilineText: string = "> [!TIP]\r\n> This is sample text formatted as an alert of type \"Tip\".\r\n> This is multiline text.";
export var NestedMultilineCodeFormattedMultilineText: string =
    "This is sample text\r\n```\nThis is a\r\n code block\n```\nThere is code nested inside.";
export var NestedItalicFormatedMultillineText: string =
    "This is sample text *there\r\nis nested italic* in this block.";
export var NestedBoldFormatedMultilineText: string =
    "This is sample text **there\r\nis nested bold** in this block.";
export var BoldFormattedNestedBoldFormattedMultiLineText: string = "**This is sample text with a **Nested \r\n Bold** block inside it.**";
export var ItalicFormattedNestedItalicFormattedMultiLineText: string = "*This is sample text with a *Nested \r\n Italic* block inside it.*";
export var CodeFormattedNestedCodeFormattedMultilineText: string = "```\nThis is sample text with a \r\n```Nested Code \n```\n block inside it.\n```\n";

//Unformatted Strings with Includes, Art, GUID, Links
export var sampleGUID = "This is a GUID: 60bbae04-174c-4841-90cf-fae6c3b164fb.";
export var sampleExternalLink = "This is an external link to bing.com: [Bing](http://www.bing.com)";
export var sampleInternalLink = "This is an internal link to a relative path: [A relative path](..\..\README.md)";
export var sampleArtLink = "An art link: ![Additionally](../media/link-checker-1.png)";
export var sampleInclude = "[!INCLUDE [README](../../README.md)]";

//Bookmark duplicate string
export var duplicateBookmarkString: string[] = ["# Test\r\n", "# Test\r\n", "## Test\r\n"];
export var expectBookmarkString: string[] = ["# Test\r\n", "# Test (1)\r\n", "## Test\r\n"];