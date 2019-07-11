[![Build Status](https://ceapex.visualstudio.com/Engineering/_apis/build/status/Authoring/docs-markdown%20CI?branchName=develop)](https://ceapex.visualstudio.com/Engineering/_build/latest?definitionId=1346&branchName=develop)
# Docs Markdown Extension

Welcome to the Docs Markdown authoring extension! This extension provides Markdown authoring assistance for docs.microsoft.com (Docs) content, including basic Markdown support and support for custom Markdown syntax on Docs. We also now support some YAML authoring commands. Here's a quick demo - the rest of the readme provides details about using the extension:

![demo](https://github.com/Microsoft/vscode-docs-authoring/raw/master/media/video/extension-demo.gif)

## Prerequisites and assumptions

To accurately insert relative links, images, and other embedded content, you must have your VS Code workspace scoped to the root of your cloned Docs repo.

Some syntax supported by the extension, such as alerts and snippets, are custom Markdown for Docs, and will not render correctly unless published to Docs.

## How to use the extension

To access the Docs Markdown menu, type `ALT+M`. You can click or use up/down arrows to select the function you want, or type to start filtering, then hit `ENTER` when the function you want is highlighted in the menu.

You can also now access the Docs commands from the VS Code command palette. Hit F1 to open the command palette and start typing to filter. All the Docs commands begin with "Docs":

![Docs commands](https://github.com/Microsoft/vscode-docs-authoring/raw/master/media/image/docs-command-palette.png)

The following commands are available in Markdown files:

|Command            |Description         |
|-------------------|--------------------|
|Preview (`Alt+DP`) |Preview the active topic in a side-by-side window using the Docs Preview extension, if it is installed.|
|Bold (`Alt+DB`)    |Format text **bold**.|
|Italic (`Alt+DI`)  |Format text *italic*.|
|Code               |If one line or less is selected, formats text as `inline code`.<br><br>If multiple lines are selected, formats them as a fenced code block, and prompts you to select a programming language supported by Docs.<br>|
|Alert              |Insert a Note, Important, Warning, or Tip.<br><br>Select Alert from the menu, then select the alert type. If you have previously selected text, it will be surrounded with the selected alert syntax. If no text is selected, a new alert will be added with placeholder text.|
|Numbered list      |Insert a new numbered list.<br><br> If multiple lines are selected, each will be a list item. To create a nested numbered list, tab from within the parent list.|
|Bulleted list      |Insert a new bulleted list.|
|Table              |Insert a Markdown table structure.<br><br>After you select the table command, specify the number of columns and rows in the format columns:rows, such as 3:4. Note that the maximum number of columns you can specify via this extension is 5, which is the recommended maximum for readability on docs.microsoft.com.|
|Link to file in repo|Insert a Markdown link to a file within the current repo. |
|Link to web page    |Insert a Markdown link to a URI.|
|Link to heading     |Open a sub-menu to link to a heading (bookmark) in the current file or in another file in the current repo.|
|Non-localiable text |Within the Markdown body of a file, format text as non-localizable (`:::no-loc text="string":::`). Within the YAML header of a Markdown file, add a metadata array to be populated with strings that should be non-localizable throughout the file ( `no-loc: []`).|
|Image               |Type alternate text (required for accessibility) and select it, then call this command to filter the list of supported image files in the repo and select the one you want. If you haven't selected alt text when you call this command, you will be prompted for it before you can select an image file.|
|Include            |Find a file in the repo to embed in the current file.|
|Snippet            |Find a code snippet in the repo to embed in the current file.|
|Cleanup            |Run one of the Docs Cleanup scripts (see [Cleanup scripts](#cleanup-scripts) below).
|Video              |Add an embedded video.|
|Template           |Insert a Markdown authoring template, if the Docs Article Templates extension is installed.|

The following commands are available in YAML files:

|Command            |Description         |
|-------------------|--------------------|
|TOC entry          |Insert a basic TOC entry with the `name` and `href` attributes, and select the file link to. By default, the H1 of the selected file is used as the `name`.|
|TOC entry with optional attributes |Insert a TOC entry with the following optional attributes as well as `name` and `href`.<br>- `displayName`: Add alternative search terms for TOC filtering.<br>- `uid`: Add an identifier for a Docs reference article, such as `System.String`.<br>- `expanded`: Indicate that the node should be expanded by default.|
|Parent node         |Insert a content-less parent node with a stub child (`name` and `href` pair).|
|Non-localizable text|Insert a `no-loc` YAML node. If you insert this node within a `metadata` node, every matching string within the YAML file will be non-localizable. If you insert it within any other node, every matchinig string within that node will be non-localizable.

## How to assign keyboard shortcuts

Default keyboard shortcuts are available for some commands, as noted in the table above. You can override them, or add shortcuts for other commands, using the VS Code keyboard shortcut mappings.

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

## How to show the legacy toolbar

Users of the pre-release version of the extension will notice that the authoring toolbar no longer appears at the bottom of the VS Code window when the Docs Markdown extension is installed. This is because the toolbar took up a lot of space on the VS Code status bar, and did not follow best practices for extension UX, so it is deprecated in the new extension. However, you can optionally show the toolbar by updating your VS Code settings.json file as follows:

1. In VS Code, go to File -> Preferences -> Settings (`CTRL+Comma`).
1. Select User Settings to change the settings for all VS Code workspaces, or  Workspace Settings to change them for just the current workspace.
1. In the Default Settings pane on the left, find Docs Markdown Extension Configuration, and select the pencil icon next to the desired setting, and select `true`. VS Code will automatically add the value to the settings.json file and you will be prompted to reload the window for the changes to take effect.
1. Now you will see the toolbar at the bottom of your VS Code window:

   ![toolbar](https://github.com/Microsoft/vscode-docs-authoring/raw/master/media/image/legacy-toolbar.png)

## Cleanup scripts

Cleanup functionality has been added to docs-markdown to move the experience of fixing validation closer to your development environment. Instead of having to wait until build time, you can proactively reduce the number of validation errors and warnings by running these cleanup scripts. Get started by hitting `F1` and typing `Docs: Cleanup` or hit `Alt+M` and navigate to `Cleanup...` in the quick pick menu.

Cleanup scripts available:

- Single-valued metadata: Converts single value arrays of metadata into inline properties without array brackets.
- Microsoft links: Converts http:// to https:// for microsoft docs, azure, technet, and msdn. Removes hardcoded locale from url.
- Capitalization of metadata values: Lowercases certain metadata properties.
- Master redirection file: Adds redirect_url entries to the master redirect file and removes redirected Markdown files from the repo.
- Everything: Runs all the available cleanup scripts.

## Known issues

- [YAML TOC entries] The Docs-YAML schema validation falsely shows a "Matches a schema that is not allowed" linting error on optional attributes such as `displayName`. These entries are in fact valid, and we'll be updating the schema linting in an upcoming release.
- [Docs Preview] Code blocks only preview in Dark theme, and some colorized text is unreadable in Light theme.
- [External bookmarks] Linux: File list is displayed but no headings are shown to select.
- [Includes] Linux: File list is displayed but no link is added after selection is made.

# Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a Contributor License Agreement (CLA) declaring that you have the right to and actually do, grant us the rights to use your contribution. For details, visit our [Contributor License Agreement (CLA)](https://cla.microsoft.com).

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## License

[MIT](LICENSE)
