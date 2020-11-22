[![Build status](https://ceapex.visualstudio.com/Engineering/_apis/build/status/Authoring/docs-preview%20CI)](https://ceapex.visualstudio.com/Engineering/_build/latest?definitionId=1350&branchName=develop)
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

NEW: Docs Preview now also includes Search Results Preview, which uses publicly available information from Google to approximate how your article will look when returned in Google search. This helps validate that your title, description, and other information will be helpful for users trying to find the right technical information. See [Search Results Preview](#search-results-preview) below for more information.

## Theme Support

The docs-preview extension supports light, dark and high contrast themes.  You can select a default theme by going to File => Preferences => Settings => Extensions => Docs Preview Extension Configuration and choosing a theme.  A toast notification will show after a theme is selected to prompt the user to reload the VS Code for the settings to take effect.

![Preview setting](https://raw.githubusercontent.com/microsoft/vscode-docs-authoring/master/packages/docs-preview/images/preview-setting.gif)

If you also have the [Docs Markdown](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-markdown) extension installed, you can access preview from the Docs Markdown menu:

1. Type `Alt+M` to open the menu.
1. Select `Preview`.

To install both Docs Preview and Docs Markdown, along with other useful extensions for authoring Markdown for docs.microsoft.com, install the [Docs Authoring Pack](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-authoring-pack).

## Search Results Preview

Using publicly available information from Google, Search Results Preview generates an approximation of what your article will look like when returned in Google search on Chrome with default font settings. This is the most common way people find content on Docs, accounting for more than half of all page hits. Because much of Google's algorithm is secret, the preview might not match exactly. But it gives you an idea of how your title will be truncated and what description users will see when they find your article via search. Use it to make sure you're providing the most helpful, relevant information.

To use Search Results Preview:

1. In VS Code with Docs Preview installed, click `Alt + M` to open the Docs menu or `F1` to open the command palette.
1. Select `Search Results Preview` from the Docs menu or filter to find `Docs: Search Results Preview` from the command palette.
1. A simple preview opens in a side-by-side window, approximating how your article will look in Google search results.
