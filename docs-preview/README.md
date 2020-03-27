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

## Theme Support

The docs-preview extension supports light, dark and high contrast themes.  You can select a default theme by going to File => Preferences => Settings => Extensions => Docs Preview Extension Configuration and choosing a theme.  A toast notification will show after a theme is selected to prompt the user to reload the VS Code for the settings to take effect.

![Preview setting](https://raw.githubusercontent.com/microsoft/vscode-docs-authoring/master/docs-preview/images/preview-setting.gif)

If you also have the [Docs Markdown](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-markdown) extension installed, you can access preview from the Docs Markdown menu:

1. Type `Alt+M` to open the menu.
1. Select `Preview`.

To install both Docs Preview and Docs Markdown, along with other useful extensions for authoring Markdown for docs.microsoft.com, install the [Docs Authoring Pack](https://marketplace.visualstudio.com/items?itemName=docsmsft.docs-authoring-pack).
