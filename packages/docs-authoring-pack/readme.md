# Docs Authoring Pack

The Docs Authoring Pack provides a series of extensions to help docs.microsoft.com authors work better and more efficiently. You can read more about all of the Docs Authoring Pack features here in the [overview guide](https://docs.microsoft.com/en-us/contribute/how-to-write-docs-auth-pack). The Docs Authoring Pack provides the following extensions to help author content for docs.microsoft.com:

- [Docs Markdown](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-markdown), which provides Markdown authoring assistance, including support for inserting custom Markdown syntax specific to docs.microsoft.com. The rest of this readme provides details on the Docs Markdown extension.
- [Docs Preview](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-preview), which uses the docs.microsoft.com CSS for more accurate Markdown preview, including custom Markdown.
- [Docs YAML](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-yaml), which validates Docs .yml files against the appropriate YAML schemas.
- [Docs Images](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-images), which compresses and resizes images.
- [Docs Article Templates](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-article-templates), which allows users to apply Markdown skeleton content to new files.
- [Docs Scaffolding](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-scaffolding), which automatically generates Learn modules based on standard patterns and automates renaming, inserting, deleting, and reordering units.
- [markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint), a popular linter by David Anson.

## How to use the Docs Markdown extension

To access the Docs Markdown Authoring menu, type <kbd>ALT + M</kbd>. You can click or use up/down arrows to select the function you want, or type to start filtering, then hit <kbd>ENTER</kbd> when the function you want is highlighted in the menu.

![docs markdown quick pick](https://raw.githubusercontent.com/microsoft/vscode-docs-authoring/master/packages/docs-authoring-pack/images/docs-markdown-quick-pick.png)

You can also access the Docs commands from the VS Code command palette by hitting <kbd>F1</kbd> and typing to filter. All the Docs commands begin with "Docs":

![docs markdown command palette](https://raw.githubusercontent.com/Microsoft/vscode-docs-authoring/master/media/image/docs-command-palette.png)

### Prerequisites and assumptions

To accurately insert relative links, images, and other embedded content with Docs Markdown, you must have your VS Code workspace scoped to the root of your cloned OPS repo. Some syntax supported by the extension, such as alerts and snippets, are custom Markdown for Docs, and will not render correctly unless published via Docs.

For more information about the Docs Markdown commands, see the [Docs Markdown readme](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-markdown).

## How to use Docs Images extension

To access the Docs Images menu, right click on a folder or individual image file. Select **Compress all images in folder** or **Compress image** from the context menu.

![docs image context menu](https://raw.githubusercontent.com/microsoft/vscode-docs-authoring/master/packages/docs-authoring-pack/images/right-click-image-compression.png)

For more information about the Docs Images extension, see the [Docs Images readme](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-images).

## How to use Docs YAML extension

- The code intellisense is more intelligent now; the extension can provide the intellisense according to the schema structure, not just text mapping. To invoke intellisense, hit <kbd>CTRL + Space</kbd> to view the list of schema options.
- The extension can generate an input template for `object` (including required properties and optional properties with default value).
- You can type a `-` and hit <kbd>CTRL + Space</kbd> to trigger the intellisense for generating a new array item.

Intellisense is automatically triggered by <kbd>CTRL + Space</kbd> to get what you can type.

![screencast](https://raw.githubusercontent.com/928PJY/docs-yaml/master/images/docs-yaml-extension-intellisense.gif)

For more information about the Docs YAML commands, see the [Docs YAML readme](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-yaml).

## How to use Docs Preview extension

You can open Docs Preview by opening a markdown document and clicking on the preview button. One opens the preview in your current window, and the other opens the markdown preview to the side. Alternatively you can hit <kbd>Alt + M</kbd> and select `Preview` or you can hit <kbd>F1</kbd> and select `Docs: Preview` to open up the markdown preview panel.

![docs preview buttons](https://raw.githubusercontent.com/microsoft/vscode-docs-authoring/master/packages/docs-authoring-pack/images/docs-preview-button.png)

For more information about the Docs Preview commands, see the [Docs Preview readme](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-preview).

## Docs Markdown keyboard shortcuts and toolbar

### How to assign keyboard shortcuts

Default keyboard shortcuts are available for some commands, as noted in the table above. You can override them, or add shortcuts for other commands, using the VS Code keyboard shortcut mappings.

1. Type <kbd>CTRL+K</kbd> then <kbd>CTRL+S</kbd> to open the Keyboard Shortcuts list.
1. Search for the command, such as `formatBold`, for which you want to create a custom keybinding.
1. Click the plus that appears near the command name when you mouse over the line.
1. After a new input box is visible, type the keyboard shortcut you want to bind to that particular command. For example, to use the common shortcut for bold, type <kbd>CTRL+B</kbd>.
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

### How to show the markdown toolbar

Users of the pre-release version of the extension will notice that the authoring toolbar no longer appears at the bottom of the VS Code window when the Docs Markdown extension is installed. This is because the toolbar took up a lot of space on the VS Code status bar, and did not follow best practices for extension UX, so it is deprecated in the new extension. However, you can optionally show the toolbar by updating your VS Code settings.json file as follows:

1. In VS Code, go to **File** > **Preferences** > **Settings** (<kbd>CTRL+,</kbd>).
1. Select User Settings to change the settings for all VS Code workspaces, or Workspace Settings to change them for just the current workspace.
1. In the **Default Settings** pane on the left, find Docs Markdown Extension Configuration, and select the pencil icon next to the desired setting, and select `true`. VS Code will automatically add the value to the settings.json file and you will be prompted to reload the window for the changes to take effect.
1. Now you will see the toolbar at the bottom of your VS Code window:

   ![toolbar](https://raw.githubusercontent.com/Microsoft/vscode-docs-authoring/master/media/image/legacy-toolbar.png)

## Contributing

This project is now closed source. We are no longer accepting contributions from outside contributors.

## License

[MIT](LICENSE)
