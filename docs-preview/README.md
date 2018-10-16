# Docs Preview Extension

This extension uses the docs.microsoft.com CSS to provide more accurate preview for Markdown published to Docs via the Open Publishing System (OPS). This includes all Markdown as supported by the CommonMark specification, as well as custom Markdown syntax for Docs, such as:

- Alerts (note, tip, important, caution, and warning).
- Embedded code snippets.
- Tabbed content.

There are a few options for how to see Docs preview:

1. Hit F1 to open the VS Code command palette.
1. Start typing to filter the list of commands.
1. Select `Docs: Preview`. The preview will open side-by-side.

You can also use the default keyboard shortcut, `Alt+DP`.

If you also have the [Docs Markdown](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-markdown) extension installed, you can access preview from the Docs Markdown menu:

1. Type `Alt+M` to open the menu.
1. Select `Preview`.

To install both Docs Preview and Docs Markdown, along with other useful extensions for authoring Markdown for docs.microsoft.com, install the [Docs Authoring Pack](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-authoring-pack).

<!--
## Supported markdown snippets

> Note
> You need enable quickSuggestions for markdown as shown below in user perference, because markdown snippets are not shown up automatically in vscode [by default](https://github.com/Microsoft/vscode/issues/26108):
> 
> ```
>   "[markdown]":  {
>     "editor.quickSuggestions": true
>   },
> ```

1. File inclusion
    ```
    [!include [title](path)]
    ```
2. Code snippet
   ```
   [!code-language[name](path)]
   ```
3. Note/Warning/Tip/Important/Caution block
   ```
   > [!NOTE]
   > content
   > 
   ```
4. Tabbed content
   ```
   # [tab title](#tab/tab-id-1)
   tab content
   # [tab title](#tab/tab-id-2)
   tab content
   ***
   ```
5. Row extension
   ```
   :::row:::
       :::column:::
           content
       :::column-end:::
       :::column:::
           content
       :::column-end:::
    :::row-end:::
   ```
-->