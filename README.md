# vscode-docs-authoring

This repo contains the Learn Authoring Pack VS Code extension, which is an extension pack containing multiple Markdown and YAML helper extensions. The main goal is to provide authoring assistance for contributing to learn.microsoft.com. This repo is our feedback mechanism allowing the community to report issues. We are not accepting outside contributions, but would like to continue improving the existing extensions supported in the Learn Authoring Pack.  

## Learn Authoring Pack

The Learn Authoring Pack provides a series of extensions to help learn.microsoft.com authors work better and more efficiently. You can read more about all of the Learn Authoring Pack features here in the [overview guide](https://learn.microsoft.com/contribute/how-to-write-docs-auth-pack). The Learn Authoring Pack provides the following extensions to help author content for learn.microsoft.com:

- [Learn Markdown](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-markdown), which provides Markdown authoring assistance, including support for inserting custom Markdown syntax specific to learn.microsoft.com. The rest of this readme provides details on the Learn Markdown extension.
- [Learn Images](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-images), which compresses and resizes images.
- [Learn YAML](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-yaml), which validates Learn .yml files against the appropriate YAML schemas.
- [Learn Preview](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-preview), which uses the learn.microsoft.com CSS for more accurate Markdown preview, including custom Markdown.
- [Learn Article Templates](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-article-templates), which allows users to apply Markdown skeleton content to new files.
- [Learn Scaffolding](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-scaffolding), which automatically generates Learn modules based on standard patterns and automates renaming, inserting, deleting, and reordering units.
- [markdownlint](https://marketplace.visualstudio.com/items?itemName=DavidAnson.vscode-markdownlint), a popular linter by David Anson.

## How to use the Learn Markdown extension

To access the Learn Markdown Authoring menu, type <kbd>ALT + M</kbd>. You can click or use up/down arrows to select the function you want, or type to start filtering, then hit <kbd>ENTER</kbd> when the function you want is highlighted in the menu.

![Learn markdown quick pick](https://raw.githubusercontent.com/microsoft/vscode-docs-authoring/main/media/image/docs-markdown-quick-pick.png)

You can also access the Learn commands from the VS Code command palette by hitting <kbd>F1</kbd> and typing to filter. All the Learn commands begin with "Learn".

### Prerequisites and assumptions

To accurately insert relative links, images, and other embedded content with Learn Markdown, you must have your VS Code workspace scoped to the root of your cloned OPS repo. Some syntax supported by the extension, such as alerts and snippets, are custom Markdown for Docs, and will not render correctly unless published via Learn.

For more information about the Learn Markdown commands, see the [Learn Markdown readme](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-markdown).

## How to use Learn Images extension

To access the Learn Images menu, right click on a folder or individual image file. Select **Compress all images in folder** or **Compress image** from the context menu.

![Learn image context menu](https://raw.githubusercontent.com/microsoft/vscode-docs-authoring/main/media/image/right-click-image-compression.png)

For more information about the Learn Images extension, see the [Learn Images readme](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-images).

## How to use Learn YAML extension

- The code intellisense is more intelligent now; the extension can provide the intellisense according to the schema structure, not just text mapping. To invoke intellisense, hit <kbd>CTRL + Space</kbd> to view the list of schema options.
- The extension can generate an input template for `object` (including required properties and optional properties with default value).
- You can type a `-` and hit <kbd>CTRL + Space</kbd> to trigger the intellisense for generating a new array item.

Intellisense is automatically triggered by <kbd>CTRL + Space</kbd> to get what you can type.

![screencast](https://raw.githubusercontent.com/vscode-docs-authoring/main/media/image/docs-yaml-extension-intellisense.gif)

For more information about the Learn YAML commands, see the [Learn YAML readme](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-yaml).

## How to use Learn Preview extension

You can open Learn Preview by opening a markdown document and clicking on the preview button. One opens the preview in your current window, and the other opens the markdown preview to the side. Alternatively you can hit <kbd>Alt + M</kbd> and select `Preview` or you can hit <kbd>F1</kbd> and select `Docs: Preview` to open up the markdown preview panel.

![Learn preview buttons](https://raw.githubusercontent.com/microsoft/vscode-docs-authoring/main/media/image/docs-preview-button.png)

For more information about the Learn Preview commands, see the [Learn Preview readme](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-preview).

## Learn Markdown keyboard shortcuts and toolbar

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

See [Keybindings](https://code.visualstudio.com/docs/getstarted/keybindings) in the VS Code Learn for more information.

### How to show the Markdown toolbar

Users of the pre-release version of the extension will notice that the authoring toolbar no longer appears at the bottom of the VS Code window when the Learn Markdown extension is installed. This is because the toolbar took up a lot of space on the VS Code status bar, and did not follow best practices for extension UX, so it is deprecated in the new extension. However, you can optionally show the toolbar by updating your VS Code settings.json file as follows:

1. In VS Code, go to **File** > **Preferences** > **Settings** (<kbd>CTRL+,</kbd>).
1. Select User Settings to change the settings for all VS Code workspaces, or Workspace Settings to change them for just the current workspace.
1. In the **Default Settings** pane on the left, find Learn Markdown Extension Configuration, and select the pencil icon next to the desired setting, and select `true`. VS Code will automatically add the value to the settings.json file and you will be prompted to reload the window for the changes to take effect.
1. Now you will see the toolbar at the bottom of your VS Code window:

   ![toolbar](https://raw.githubusercontent.com/Microsoft/vscode-docs-authoring/main/media/image/legacy-toolbar.png)

## License

[MIT](LICENSE)
