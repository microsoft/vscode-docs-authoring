"use-strict";

// Single line text resources
export let NonFormattedSingleLineText: string = "This is sample text. Singleline, without formatting.";
export let CodeFormattedSingleLineText: string = "`This is sample text in a markdown code block.`";
export let BoldFormattedSingleLineText: string = "**This is sample text in markdown bold format.**";
export let ItalicFormattedSingleLineText: string = "*This is sample text in markdown italic format.*";
export let NoteFormattedSingleLineText: string = "> [!NOTE]\r\n> This is sample text formatted as an alert of type \"Note\".";
export let ImportantFormattedSingleLineText: string = "> [!IMPORTANT]\r\n> This is sample text formatted as an alert of type \"Important\".";
export let WarningFormattedSingleLineText: string = "> [!WARNING]\r\n> This is sample text formatted as an alert of type \"Warning\".";
export let TipFormattedSingleLineText: string = "> [!TIP]\r\n> This is sample text formatted as an alert of type \"Tip\".";
export let NestedSingleLineCodeFormattedSingleLineText: string = "This is sample text with a `Nested Code` block inside it.";
export let CodeFormattedNestedSingleLineCodeFormattedSingleLineText: string = "`This is sample text with a `Nested Code` block inside it.`";
export let NestedBoldFormattedSingleLineText: string = "This is sample text with a **Nested Bold** block inside it.";
export let BoldFormattedNestedBoldFormattedSingleLineText: string = "**This is sample text with a **Nested Bold** block inside it.**";
export let NestedItalicFormattedSingleLineText: string = "This is sample text with a *Nested Italic* block inside it.";
export let ItalicFormattedNestedItalicFormattedSingleLineText: string = "*This is sample text with a *Nested Italic* block inside it.*";

// Multi line text resources. '\' is the multiline escape character for javascript.
export let NonFormattedMultiLineText: string =
    "This is sample text.\r\nIt has multiplelines in it.";
export let CodeFormattedMultilineText: string =
    "```\nThis is sample text in a markdown multiline code block.\n```\n";
export let BoldFormattedMultilineText: string =
    "**This is sample text in\r\nMarkdown bold format, multiline**";
export let ItalicFormattedMultilineText: string =
    "*This is sample text in\r\nMarkdown italic format, multiline*";
export let NoteFormattedMultilineText: string = "> [!NOTE]\r\n> This is sample text formatted as an alert of type \"Note\".\r\n> This is multiline text.";
export let ImportantFormattedMultilineText: string = "> [!IMPORTANT]\r\n> This is sample text formatted as an alert of type \"Important\".\r\n> This is multiline text.";
export let WarningFormattedMultilineText: string = "> [!WARNING]\r\n> This is sample text formatted as an alert of type \"Warning\".\r\n> This is multiline text.";
export let TipFormattedMultilineText: string = "> [!TIP]\r\n> This is sample text formatted as an alert of type \"Tip\".\r\n> This is multiline text.";
export let NestedMultilineCodeFormattedMultilineText: string =
    "This is sample text\r\n```\nThis is a\r\n code block\n```\nThere is code nested inside.";
export let NestedItalicFormatedMultillineText: string =
    "This is sample text *there\r\nis nested italic* in this block.";
export let NestedBoldFormatedMultilineText: string =
    "This is sample text **there\r\nis nested bold** in this block.";
export let BoldFormattedNestedBoldFormattedMultiLineText: string = "**This is sample text with a **Nested \r\n Bold** block inside it.**";
export let ItalicFormattedNestedItalicFormattedMultiLineText: string = "*This is sample text with a *Nested \r\n Italic* block inside it.*";
export let CodeFormattedNestedCodeFormattedMultilineText: string = "```\nThis is sample text with a \r\n```Nested Code \n```\n block inside it.\n```\n";

// Unformatted Strings with Includes, Art, GUID, Links
export let sampleGUID = "This is a GUID: 60bbae04-174c-4841-90cf-fae6c3b164fb.";
export let sampleExternalLink = "This is an external link to bing.com: [Bing](http://www.bing.com)";
export let sampleInternalLink = "This is an internal link to a relative path: [A relative path](..\..\README.md)";
export let sampleArtLink = "An art link: ![Additionally](../media/link-checker-1.png)";
export let sampleInclude = "[!INCLUDE [README](../../README.md)]";

// Bookmark duplicate string
export let duplicateBookmarkString: string[] = ["# Test\r\n", "# Test\r\n", "## Test\r\n"];
export let expectBookmarkString: string[] = ["# Test\r\n", "# Test (1)\r\n", "## Test\r\n"];
