[![Build status](https://ceapex.visualstudio.com/Engineering/_apis/build/status/Authoring/docs-article-templates%20CI)](https://ceapex.visualstudio.com/Engineering/_build/latest?definitionId=1348&branchName=develop)
# Docs Article Templates Extension

The Docs Article Templates extension lets writers in VS Code pull a Markdown template from a centralized store and apply it to a file. Templates can help ensure that required metadata is included in articles, that content standards are followed, and so on. Templates are managed as Markdown files in a public GitHub repository.

For the first release of the Docs Article Templates extension, only simple Markdown files are supported. All template content, including file metadata, must be in each file, and all templates will be available to all users of the extension. More advanced functionality, such as shared metadata files, conditional text fields, and repo-specific templates, are planned for later releases.

## To apply a template in VS Code

1. Ensure the Docs Article Templates extension is installed and enabled.
1. If you don't have the Docs Markdown extension installed, hit F1 to open the command palette, start typing "template" to filter, then click `Docs: Template`. If you do have Docs Markdown installed, you can use either the command palette or click `Alt+M` to bring up the Docs Markdown QuickPick menu, then select Template from the list.
1. Select the desired template from the list that appears.

![apply template](https://github.com/Microsoft/vscode-docs-authoring/raw/master/media/video/apply-template.gif)

## To create a Learn module in VS Code

1. In VSC open to the root working folder of your repository containing the achievements, path, and "product" folders.
1. If you don't have the Docs Markdown extension installed, hit F1 to open the command palette, start typing "template" to filter, then click `Docs: Template`. If you do have Docs Markdown installed, you can use either the command palette or click `Alt+M` to bring up the Docs Markdown QuickPick menu, then select Template from the list.
1. From the drop-down list of templates select `Learn module`.
1. When prompted select the module's parent folder.
1. In the "Enter module name" prompt enter your module's name. This is used to create the module, media, and include folders, the index.yml, and the module uid. Example: Module with the friendly name `What is m365` will automatically be formatted as `what-is-m365` by the template extension for the applicable fields.
1. In the "Enter unit name" prompt enter the first unit name. This will be used to create the unit yml and content .md file with the same name, for example introduction.
1. Answer `Yes` to the message dialog for your next unit name.
1. Repeat steps 7 and 8 for each new unit yml you need to create. Once all units have been created,select `No` to exit.

## To add units to an existing Learn module in VS Code

1. In VSC open to the root working folder of your repository containing the achievements, path, and "product" folders.
1. Open a module topic (index.yml).
1. If you don't have the Docs Markdown extension installed, hit F1 to open the command palette, start typing "template" to filter, then click `Docs: Template`. If you do have Docs Markdown installed, you can use either the command palette or click `Alt+M` to bring up the Docs Markdown QuickPick menu, then select Template from the list.
1. From the drop-down list of templates select `Add unit to active module`.
1. In the "Enter unit name" prompt enter the first unit name. This will be used to create the unit yml and content .md file with the same name, for example introduction.
1. Answer `Yes` to the message dialog for your next unit name.
1. Repeat steps 6 and 7 for each new unit yml you need to create. Once all units have been created,select `No` to exit.

## To add your GitHub ID and/or Microsoft alias to your VS Code settings

The Templates extension supports three dynamic metadata fields: `author`, `ms.author`, and `ms.date`. That means that if a template creator uses these fields in the metadata header of a Markdown template, they will be auto-populated in your file when you apply the template, as follows:

|Field      |Value  |
|-----------|-------|
|`author`   |Your GitHub alias, if specified in your VS Code settings file. |
|`ms.author`|Your Microsoft alias, if specified in your VS Code settings file. If you are not a Microsoft employee, leave this unspecified.         |         
|`ms.date`  |The current date in the Docs-supported format, MM/DD/YYYY. Note that the date is not automatically updated if you subsequently update the file - you must update this manually to indicate the article freshness date.|         

To set `author` and/or `ms.author`:

1. In VS Code, go to File -> Preferences -> Settings (`CTRL+Comma`).
1. Select User Settings to change the settings for all VS Code workspaces, or  Workspace Settings to change them for just the current workspace.
1. In the Default Settings pane on the left, find Docs Article Templates Extension Configuration, click the pencil icon next to the desired setting, then click `Replace in Settings`. 

   ![edit settings](https://github.com/Microsoft/vscode-docs-authoring/raw/master/media/video/edit-settings.gif) 
 
1. The User Settings pane will open side-by-side, with a new entry at the bottom.
1. Add your GitHub ID or Microsoft email alias, as appropriate, and save the file.
1. The updated settings might looks something like this:

   ![updated settings](https://github.com/Microsoft/vscode-docs-authoring/raw/master/media/image/updated-template-settings.png)

1. You might need to close and restart VS Code for the changes to take effect.
1. Now, when you apply a template that uses dynamic fields, your GitHub ID and/or Microsoft alias will be auto-populated in the metadata header.

## Custom Learn module and unit settings

Some Learn module and unit properties can be modified using VS Code settings.

|Field      |Value  |
|-----------|-------|
|`learn_repo_id`   |Default Learn repo.  If no value is present, repo root folder will be used.|
|`learn_level`|Default Learn level. Represents the target level for the module i.e. `beginner`.|         
|`learn_role`  |Default Learn role. Represents the target role for the module i.e. `developer`.|
|`learn_product`  |Default Learn product. Represents the target product for the module i.e. `azure`.|

## To make a new template available in VS Code

1. Draft your template as a Markdown file.
2. Submit a pull request to the templates folder of the https://github.com/MicrosoftDocs/content-templates repo.

The docs.microsoft.com team will review your template and merge the PR if it meets docs.microsoft.com style guidelines. Once merged, the template will be available to all users of the Docs Article Templates extension.

## Template metadata

Including metadata in your template can help contributors add the right metadata to each file. File-level metadata is specified in a YML header at the top of the Markdown file. You should only include file-level metadata in your template for values that are generally not set at the doc set or folder level; otherwise, users might inadvertently overwrite the correct global values. You can use comments (`#`) to describe the expected values, and dynamic fields to auto-populate certain values.

The following is a basic YML metadata header that you might use for a getting started article template:

```markdown
---
title:                     # the article title to show on the browser tab
description:               # 115 - 145 character description to show in search results
author: {github-id}        # the author's GitHub ID - will be auto-populated if set in settings.json
ms.author: {ms-alias}      # the author's Microsoft alias (if applicable) - will be auto-populated if set in settings.json
ms.date: {@date}           # the date - will be auto-populated when template is first applied
ms.topic: getting-started  # the type of article
---
# Heading 1 <!-- the article title to show on the web page -->
```

## Known issues

- Templates are stored in a public GitHub repo, so don't include any sensitive information in your templates!
- In this beta release, all templates will be available to all users of the VS Code extension. Repo-specific templates, which take advantage of VS Code's GitHub integration to only show certain templates for certain repos, are not yet supported.

## Contributing

This project welcomes contributions and suggestions.  Most contributions require you to agree to a
Contributor License Agreement (CLA) declaring that you have the right to, and actually do, grant us
the rights to use your contribution. For details, visit https://cla.microsoft.com.

When you submit a pull request, a CLA-bot will automatically determine whether you need to provide
a CLA and decorate the PR appropriately (e.g., label, comment). Simply follow the instructions
provided by the bot. You will only need to do this once across all repos using our CLA.

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/).
For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## License

[MIT](https://docsmsft.gallerycdn.vsassets.io/extensions/docsmsft/docs-markdown/0.2.2/1547755350969/Microsoft.VisualStudio.Services.Content.License)
