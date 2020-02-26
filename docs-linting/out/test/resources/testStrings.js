"use strict";
"use-strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Single line text resources
exports.NonFormattedSingleLineText = "This is sample text. Singleline, without formatting.";
exports.CodeFormattedSingleLineText = "`This is sample text in a markdown code block.`";
exports.BoldFormattedSingleLineText = "**This is sample text in markdown bold format.**";
exports.ItalicFormattedSingleLineText = "*This is sample text in markdown italic format.*";
exports.NoteFormattedSingleLineText = "> [!NOTE]\r\n> This is sample text formatted as an alert of type \"Note\".";
exports.ImportantFormattedSingleLineText = "> [!IMPORTANT]\r\n> This is sample text formatted as an alert of type \"Important\".";
exports.WarningFormattedSingleLineText = "> [!WARNING]\r\n> This is sample text formatted as an alert of type \"Warning\".";
exports.TipFormattedSingleLineText = "> [!TIP]\r\n> This is sample text formatted as an alert of type \"Tip\".";
exports.NestedSingleLineCodeFormattedSingleLineText = "This is sample text with a `Nested Code` block inside it.";
exports.CodeFormattedNestedSingleLineCodeFormattedSingleLineText = "`This is sample text with a `Nested Code` block inside it.`";
exports.NestedBoldFormattedSingleLineText = "This is sample text with a **Nested Bold** block inside it.";
exports.BoldFormattedNestedBoldFormattedSingleLineText = "**This is sample text with a **Nested Bold** block inside it.**";
exports.NestedItalicFormattedSingleLineText = "This is sample text with a *Nested Italic* block inside it.";
exports.ItalicFormattedNestedItalicFormattedSingleLineText = "*This is sample text with a *Nested Italic* block inside it.*";
// Multi line text resources. '\' is the multiline escape character for javascript.
exports.NonFormattedMultiLineText = "This is sample text.\r\nIt has multiplelines in it.";
exports.CodeFormattedMultilineText = "```\nThis is sample text in a markdown multiline code block.\n```\n";
exports.BoldFormattedMultilineText = "**This is sample text in\r\nMarkdown bold format, multiline**";
exports.ItalicFormattedMultilineText = "*This is sample text in\r\nMarkdown italic format, multiline*";
exports.NoteFormattedMultilineText = "> [!NOTE]\r\n> This is sample text formatted as an alert of type \"Note\".\r\n> This is multiline text.";
exports.ImportantFormattedMultilineText = "> [!IMPORTANT]\r\n> This is sample text formatted as an alert of type \"Important\".\r\n> This is multiline text.";
exports.WarningFormattedMultilineText = "> [!WARNING]\r\n> This is sample text formatted as an alert of type \"Warning\".\r\n> This is multiline text.";
exports.TipFormattedMultilineText = "> [!TIP]\r\n> This is sample text formatted as an alert of type \"Tip\".\r\n> This is multiline text.";
exports.NestedMultilineCodeFormattedMultilineText = "This is sample text\r\n```\nThis is a\r\n code block\n```\nThere is code nested inside.";
exports.NestedItalicFormatedMultillineText = "This is sample text *there\r\nis nested italic* in this block.";
exports.NestedBoldFormatedMultilineText = "This is sample text **there\r\nis nested bold** in this block.";
exports.BoldFormattedNestedBoldFormattedMultiLineText = "**This is sample text with a **Nested \r\n Bold** block inside it.**";
exports.ItalicFormattedNestedItalicFormattedMultiLineText = "*This is sample text with a *Nested \r\n Italic* block inside it.*";
exports.CodeFormattedNestedCodeFormattedMultilineText = "```\nThis is sample text with a \r\n```Nested Code \n```\n block inside it.\n```\n";
// Unformatted Strings with Includes, Art, GUID, Links
exports.sampleGUID = "This is a GUID: 60bbae04-174c-4841-90cf-fae6c3b164fb.";
exports.sampleExternalLink = "This is an external link to bing.com: [Bing](http://www.bing.com)";
exports.sampleInternalLink = "This is an internal link to a relative path: [A relative path](..\..\README.md)";
exports.sampleArtLink = "An art link: ![Additionally](../media/link-checker-1.png)";
exports.sampleInclude = "[!INCLUDE [README](../../README.md)]";
// Bookmark duplicate string
exports.duplicateBookmarkString = ["# Test\r\n", "# Test\r\n", "## Test\r\n"];
exports.expectBookmarkString = ["# Test\r\n", "# Test (1)\r\n", "## Test\r\n"];
//# sourceMappingURL=testStrings.js.map