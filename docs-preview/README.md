# markdocs
[![Current Version](https://vsmarketplacebadge.apphb.com/version/qezhu.markdocs.svg)](https://marketplace.visualstudio.com/items?itemName=qezhu.markdocs)

Markdown preview tool that supports docfx flavored markdown and CommonMark syntax.

## Install

Press `F1`, type `ext install markdocs`

## Usage

<img src="https://github.com/qinezh/vscode-markdocs/raw/master/images/howto.gif" width="600"/>

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

## To Do List
- [x] Enable TypeScript linter
- [ ] Supports bidirectional scrolling
- [ ] Enable chromeless css
- [ ] Reduce the size of runtime dependency if dotnet core has already been installed 
