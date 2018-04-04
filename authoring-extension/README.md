
# Docs Markdown Extension

Welcome to the Docs Markdown authoring extension. This extension provides Markdown authoring assistance for docs.microsoft.com content in the Open Publishing System (OPS), including basic Markdown support and support for custom Markdown syntax in OPS.

## Prerequisites and Assumptions

To accurately insert relative links, images, and other embedded content, you must have your VS Code workspace scoped to the root of your cloned OPS repo.

Some syntax supported by the extension, such as alerts and snippets, are custom Markdown for OPS, and will not render correctly unless published via OPS.

## How to Use the Extension

To access the Docs Markdown menu, type `ALT+M`. You can click or use up/down arrows to select the function you want, or type to start filtering, then hit `ENTER` when the function you want is highlighted in the menu. The following are available:

|Function     |Command             |Description           |
|-------------|--------------------|----------------------|
|Bold         |`formatBold`        |Formats text **bold**.|
|Italic       |`formatItalic`      |Formats text *italic*.|
|Code         |`formatCode`        |If one line or less is selected, formats text as `inline code`.<br><br>If multiple lines are selected, formats them as a fenced code block, and allows you to optionally select a programming language supported by OPS.<br><br>If no language is selected, inserts an empty fenced code block.|
|Alert        |`insertAlert`       |Inserts a Note, Important, Warning, or Tip.<br><br>Select Alert from the menu, then select the alert type. If you have previously selected text, it will be surrounded with the selected alert syntax. If no text is selected, a new alert will be added with placeholder text.|
|Numbered list|`insertNumberedList` |Inserts a new numbered list.<br><br> If multiple lines are selected, each will be a list item. Note that numbered lists show in the Markdown as all 1s, but will render on docs.microsoft.com as sequential numbers or, for nested lists, letters. To create a nested numbered list, tab from within the parent list.|
|Bulleted list|`insertBulletedList` |Inserts a new bulleted list.|
|Table        |`insertTable`        |Inserts a Markdown table structure.<br><br>After you select the table command, specify the number of columns and rows in the format columns:rows, such as 3:4. Note that the maximum number of columns you can specify via this extension is 5, which is the recommended maximum for readability.|
|Link         |`selectLinkType`      |Inserts a link. When you select this command, the following sub-menu appears.<br><br>`External`: Link to a web page by URI. Must include "http" or "https".<br>`Internal`: Insert a relative link to another file in the same repo. After selecting this option, type in the command window to filter files by name, then select the file you want. <br>`Bookmark in this file`: Choose from a list of headings in the current file to insert a properly formatted bookmark.<br>`Bookmark in another file`: First, filter by file name and select the file to link to, then choose the appropriate heading within the selected file.|
|Image        |`insertImage`     |Type alternate text (required for accessibility) and select it, then call this command to filter the list of supported image files in the repo and select the one you want. If you haven't selected alt text when you call this command, you will be prompted for it before you can select an image file.|
|Include      |`insertInclude`   |Find a file to embed in the current file.|
|Snippet      |`insertSnippet`   |Find a code snippet in the repo to embed in the current file.|
|Video        |`insertVideo`     |Add an embedded video.|
|Preview      |`previewTopic`    |Preview the active topic in a side-by-side window using the DocFX extension.  If the DocFX extension is not installed or is installed but disabled, the topic will not render.

## How to Assign Keyboard Shortcuts

1. Type `CTRL+K` then `CTRL+S` to open the Keyboard Shortcuts list.
1. Search for the command, such as `formatBold`, for which you want to create a custom keybinding.
1. Click the plus that appears near the command name when you mouse over the line.
1. After a new input box is visible, type the keyboard shortcut you want to bind to that particular command. For example, to use the common shortcut for bold, type `ctrl+b`.
1. It's a good idea to insert a `when` clause into your keybinding, so it won't be available in files other than Markdown. To do this, open keybindings.json and insert the following line below the command name (be sure to add a comma between lines):
   
    `"when": "editorTextFocus && editorLangId == 'markdown'"`

    Your completed custom keybinding should look like this in keybindings.json:

    ```json
    // Place your key bindings in this file to overwrite the defaults
    [
        {
            "key": "ctrl+b",
            "command": "formatBold",
            "when": "editorTextFocus && editorLangId == 'markdown'"
        }
    ]
    ```

1. Save keybindings.json.

See [Keybindings](https://code.visualstudio.com/docs/getstarted/keybindings) in the VS Code docs for more information.

## How to Show the "Gauntlet" Toolbar

Former users of the extension code-named "Gauntlet" will notice that the authoring toolbar no longer appears at the bottom of the VS Code window when the Docs Markdown Extension is installed. This is because the toolbar took up a lot of space on the VS Code status bar and did not follow best practices for extension UX, so it is deprecated in the new extension. However, you can optionally show the toolbar by updating your VS Code settings.json file as follows:

1. In VS Code, go to File -> Preferences -> Settings (`CTRL+Comma`).
1. Select User Settings to change the settings for all VS Code workspaces, or  Workspace Settings to change them for just the current workspace.
1. In the Default Settings pane, find Docs Authoring Extension Configuration, and select the pencil icon next to the desired setting. Next, you will be prompted to select either `true` or `false`. Once you've made your selection, VS Code will automatically add the value to the settings.json file and you will be prompted to reload the window for the changes to take effect.

## Known Issues

- [DocFX Preview] MacOS and Linux: DocFX Preview does not launch preview correctly (preview defaults to VS Code Markdown preview for these platforms).
- [External bookmarks] Linux: File list is displayed but no headings are shown to select.
- [Includes] Linux: File list is displayed but no link is added after selection is made.

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.
