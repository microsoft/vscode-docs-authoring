[![Build Status](https://ceapex.visualstudio.com/Engineering/_apis/build/status/Authoring/docs-markdown%20CI?branchName=master)](https://ceapex.visualstudio.com/Engineering/_build/latest?definitionId=1346&branchName=master)

# Docs Markdown Extension

Welcome to the Docs Markdown authoring extension! This extension provides Markdown authoring assistance for docs.microsoft.com (Docs) content, including basic Markdown support and support for custom Markdown syntax on Docs. We also now support some YAML authoring commands. Here's a quick demo - the rest of the readme provides details about using the extension. You can also get more details about all of the Docs Authoring Pack features here: [Docs Authoring Pack Overview](https://docs.microsoft.com/en-us/contribute/how-to-write-docs-auth-pack)

![demo](https://github.com/Microsoft/vscode-docs-authoring/raw/master/media/video/extension-demo.gif)

## Prerequisites and assumptions

To accurately insert relative links, images, and other embedded content, you must have your VS Code workspace scoped to the root of your cloned Docs repo.

Some syntax supported by the extension, such as alerts and snippets, are custom Markdown for Docs, and will not render correctly unless published to Docs.

## How to use the extension

To access the Docs Markdown menu, type `ALT+M`. You can click or use up/down arrows to select the function you want, or type to start filtering, then hit `ENTER` when the function you want is highlighted in the menu.

![docs markdown quick pick](https://raw.githubusercontent.com/microsoft/vscode-docs-authoring/master/docs-authoring-pack/images/docs-markdown-quick-pick.png)

You can also now access the Docs commands from the VS Code command palette. Hit F1 to open the command palette and start typing to filter. All the Docs commands begin with "Docs":

![docs markdown command palette](https://github.com/Microsoft/vscode-docs-authoring/raw/master/media/image/docs-command-palette.png)

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
|Columns             |Insert a column-based layout structure, or add a column to an existing structure. Optionally add the `span` attribute to merge two to four columns together. |
|Link                |Coose from the following options:<br> - Link to file in repo: Inserts a link to a file in the current repo.<br>- Link to web page: Inserts a link to a web page URI.<br>- Link to heading: Inserts a link to a heading in the current file or another file in the current repo.<br>- Link to XRef: Links to a .NET or UWP API reference article. First, you search for the API, such as `System.String.Length`. Then you choose a display property: none (just the API name will be displayed as link text, such as "Length"); `nameWithType` (the API name and its immediate parent will be displayed, such as "String.Length"); `fullName` (the full API name will be displayed, such as "System.String.Length"). To provide custom link text, select the text first, then use this function to insert the XREF link.<br>- Generate a Link Report: runs the [LinkCheckMD](https://marketplace.visualstudio.com/items?itemName=blackmist.LinkCheckMD) extension to find broken links in the current article.|
|Non-localizable text |Within the Markdown body of a file, format text as non-localizable (`:::no-loc text="string":::`). Within the YAML header of a Markdown file, add a metadata array to be populated with strings that should be non-localizable throughout the file ( `no-loc: []`).|
|Image               |Insert a standard image, complex image, or icon. For standard and complex images, alternate text is required for accessibility. Either select the alt text before calling the Image command, or add it before you select the image source file. For complex images, type a detailed description between the `:::image:::` and `:::image-end:::` tags. You can optionally add the `loc-scope` attribute to standard and complex images to indicate that the scope of localization is different for the image than for the article or module that contains it. Icons should not have alt text and are not localized, so only the image source file should be specified.|
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

## How to show the docs-markdown toolbar

Users of the pre-release version of the extension will notice that the authoring toolbar no longer appears at the bottom of the VS Code window when the Docs Markdown extension is installed. This is because the toolbar took up a lot of space on the VS Code status bar, and did not follow best practices for extension UX, so it is deprecated in the new extension. However, you can optionally show the toolbar by updating your VS Code settings.json file as follows:

1. In VS Code, go to File -> Preferences -> Settings (`CTRL+Comma`).
1. Select User Settings to change the settings for all VS Code workspaces, or  Workspace Settings to change them for just the current workspace.
1. In the Default Settings pane on the left, find Docs Markdown Extension Configuration, and select the pencil icon next to the desired setting, and select `true`. VS Code will automatically add the value to the settings.json file and you will be prompted to reload the window for the changes to take effect.
1. Now you will see the toolbar at the bottom of your VS Code window:

   ![toolbar](https://github.com/Microsoft/vscode-docs-authoring/raw/master/media/image/legacy-toolbar.png)

## Context Menus

There are multiple context menu options that have been added to the right mouse click button when editing markdown documents. This includes update metadata, and reformat tables. Or you can right mouse click on a markdown file or folder for the cleanup scripts context menu option.

### Cleanup scripts

Cleanup functionality has been added to docs-markdown to move the experience of fixing validation closer to your development environment. Instead of having to wait until build time, you can proactively reduce the number of validation errors and warnings by running these cleanup scripts. Get started by hitting `F1` and typing `Docs: Cleanup` or hit `Alt+M` and navigate to `Cleanup...` in the quick pick menu. Or right click on a file or folder in the explorer panel to see the `clean up file` option in the context menu.

![cleanup script context menu](https://raw.githubusercontent.com/microsoft/vscode-docs-authoring/master/docs-authoring-pack/images/cleanup-script-context-menu.png)

Cleanup scripts available:

- Single-valued metadata: Converts single value arrays of metadata into inline properties without array brackets.
- Microsoft links: Converts `http://` to `https://` for microsoft docs, azure, technet, and msdn. Removes hardcoded locales (`en-us`) from url.
- Capitalization of metadata values: Lowercases certain metadata properties.
- Master redirection file: Adds redirect_url entries to the master redirect file and removes redirected Markdown files from the repo.
- Everything: Runs all the available cleanup scripts.

### Reformat Markdown tables

In a Markdown (*\*.md*) file, when you select a complete table - two table formatting context menu items are now available. Right-click on the selected Markdown table to open the context menu. You will see something similar to the following menu items:

![Reformat table context menu](https://raw.githubusercontent.com/microsoft/vscode-docs-authoring/master/docs-authoring-pack/images/reformat-table-menu.png)

This feature **does not** work with multiple table selections, but rather is intended for a single Markdown table. You must select the entire table, including headings for desired results.

### Consolidate selected table

Selecting the **Consolidate selected table** option will collapse the table headings and contents with only a single space on either side of each value.

### Evenly distribute selected table

Selecting the **Evenly distribute selected table** option will calculate the longest value in each column and evenly distribute all the other values accordingly with space.

### Considerations

The feature will not impact the rendering of the table, but it will help to improve the readability of the table - thus making more maintainable. The reformatting table feature will keep column alignment intact.

Consider the following table:

```markdown
| Column1 | This is a long column name | Column3 |  |
|--:|---------|:--:|:----|
||         |  |         |
|     |  |         |   a value      |
||         |         |         |
|     |         | This is a long value |       but why? |
|     |         |         |         |
|     |                                           |         | Here is something |
|  |         |   |         |
```

After being "evenly distributed":

```markdown
| Column1 | This is a long column name | Column3              |                   |
|--------:|----------------------------|:--------------------:|:------------------|
|         |                            |                      |                   |
|         |                            |                      | a value           |
|         |                            |                      |                   |
|         |                            | This is a long value | but why?          |
|         |                            |                      |                   |
|         |                            |                      | Here is something |
|         |                            |                      |                   |
```

After being "consolidated":

```markdown
| Column1 | This is a long column name | Column3 |  |
|-:|--|:-:|:-|
|  |  |  |  |
|  |  |  | a value |
|  |  |  |  |
|  |  | This is a long value | but why? |
|  |  |  |  |
|  |  |  | Here is something |
|  |  |  |  |
```

### Update metadata

In a Markdown (*\*.md*) file, there are two contextual menu items specific to metadata. When you right-click anywhere in the text editor, you will see something similar to the following menu items:

![Update metadata context menu](https://raw.githubusercontent.com/microsoft/vscode-docs-authoring/master/docs-authoring-pack/images/update-metadata-menu.png)

### Update `ms.date` metadata value

Selecting the **Update `ms.date` Metadata Value** option will set the current Markdown files `ms.date` value to today's date. If the document does not have an `ms.date` metadata field, no action is taken.

### Update implicit metadata values

Selecting the **Update implicit metadata values** option will find and replace all possible metadata values that could be implicitly specified. Metadata values are implicitly specified in the *docfx.json* file, under the `build/fileMetadata` node. Each key value pair in the `fileMetadata` node represents metadata defaults. For example, a Markdown file in the *top-level/sub-folder* directory that omits the `ms.author` metadata value could implicitly specify a default value to use in the `fileMetadata` node.

```json
{
    "build": {
        "fileMetadata": {
            "ms.author": {
                "top-level/sub-folder/**/**.md": "dapine"
            }
        }
    }
}
```

In this case, all Markdown files would implicitly take on the `ms.author: dapine` metadata value. The feature acts on these implicit settings found in the *docfx.json* file. If a Markdown file contains metadata with values that are explicitly set to something other than the implicit values, they are overridden.

Consider the following Markdown file metadata, where this Markdown file resides in **top-level/sub-folder/includes/example.md**:

```markdown
---
ms.author: someone-else
---

## Content
```

If the **Update implicit metadata values** option was executed on this file, with the assumed *docfx.json* content from above the metadata value would be updated to `ms.author: dapine`.

```markdown
---
ms.author: dapine
---

# Content
```

## Known issues

- [YAML TOC entries] The Docs-YAML schema validation falsely shows a "Matches a schema that is not allowed" linting error on optional attributes such as `displayName`. These entries are in fact valid, and we'll be updating the schema linting in an upcoming release.
- [YAML TOC entries] Depending on your settings related to spacing, sometimes attributes in nested TOC entries don't line up correctly. If you experience this issue, make sure all the attributes line up with the nested `name` attribute. A fix is in progress for this bug.
- [YAML TOC entries] Erroneous invalid location error when trying to add new top level entry after nested entry. A fix is in progress for this bug.
- [Docs Preview] Code blocks only preview in Dark theme, and some colorized text is unreadable in Light theme.
- [External bookmarks] Linux: File list is displayed but no headings are shown to select.
- [Includes] Linux: File list is displayed but no link is added after selection is made.

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a Contributor License Agreement (CLA) declaring that you have the right to and actually do, grant us the rights to use your contribution. For details, visit our [Contributor License Agreement (CLA)](https://cla.microsoft.com).

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## License

[MIT](LICENSE)
