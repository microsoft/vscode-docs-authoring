# Docs Preview Extension

Markdown preview tool for CommonMark syntax and markdown extension syntax supported in Docs.

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
