# Docs Metadata Extension

The Docs Metadata Extension allows you to update metadata in the YAML headers of Docs Markdown files in bulk. The extension is particularly useful for reviewing a set of metadata in a tabular format and making updates as needed, in cases where a simple VS Code search and replace isn't appropriate. For example, suppose a Docs author changes jobs, and her articles across a repo need to be divided up between several other authors, but assignments don't map reliably to the repo folder structure. You can export metadata for the repo, find the articles assigned to the departing author, and change the values to other authors depending on the article title or other metadata.

## Step 1: Extract metadata

First, you need to extract the metadata of interest into tabular form.

1. Hit F1 to open the VS Code command palette.
1. Start typing to filter and select "Docs: Metadata Extract".
1. In the window that opens, browse to the folder you want to extract for. This can be the repo root or any subfolder.
1. Optionally, type the name of one metadata field to extract, such as `author`. If you don't specify a field, all metadata will be extracted.
1. Click OK to confirm.
1. A .csv file structured as a comma-separated list will open side-by-side with you currently displayed VS Code file. You can edit the file directly in VS Code, or use the pop-up to go to the file in your Docs Authoring folder and open the file in Excel or another editor of your choice.

## Step 2: Update metadata

Next, review the metadata in the tabular format and make any desired changes, using the following available commands. 

|Command        |Description |
|---------------|------------|
|ADD            |Adds the tag and value only if it does not already exist. If there is an existing value for the tag, it will not be overwritten (that is, ADD will be ignored).|
|DELETE         |Deletes the tag and all values.|
|PARTIAL DELETE |Deletes specified value(s) for the tag. If additional values exist, they remain. If all values are deleted, the tag is also deleted.|
|FORCE OVERWRITE|Overwrites all values of the tag with specified value(s), or adds tag with specified values if it does not exist.|
|OVERWRITE      |Overwrite all values of the tag with specified value(s) if tag exists; if tag does not exist, do not add tag.|
|MERGE          |Merge unique specified values into tag if tag exists; do not add tag if it does not exist. Do not delete existing values and do not add duplicate values.|
|TOTAL MERGE    |Merge unique specified values into tag if tag exists; add tag and values if tag does not exist. Do not delete existing values and do not add duplicate values.|

1. Find the TAG and VALUE of interest.
1. Edit the existing VALUE, if appropriate.
1. Edit the ACTION as appropriate.

For example, suppose you want to change the author of several files from meganbradley to adunndevster. In this case, you might take advantage of the filtering capabilities of Excel to scope to the TAG and VALUE you want to update:

![shows action, tag, and value columns filtered on value](images/mut-filter-values.png)

Then, update the VALUE from meganbradley to adunndevster, and update the ACTION to OVERWRITE:

![shows new values for action and value](https://github.com/Microsoft/vscode-docs-authoring/raw/master/media/image/mut-overwrite-values.png)

You can make other changes in the same file. For example, `ms.assetid` is a deprecated attribute, so you might choose to delete it from all files in the repo. In this case, you first filter on TAG equals ms.assetid, then change ACTION from IGNORE to DELETE for each instance:

![shows ms.assetid rows with ACTION set to DELETE](https://github.com/Microsoft/vscode-docs-authoring/raw/master/media/image/mut-delete-values.png)

## Step 3: Apply changes

When you've finished making changes to the extracted file, it's time to apply them.

1. Save and close the .csv file.
1. Hit F1 to open the VS Code command palette.
1. Start typing to filter and select "Docs: Metadata Apply".
1. If prompted, navigate to the correct file to apply.
1. Click OK to confirm.
1. Verify your changes in VS Code before submitting a pull request on the repo.

## Can I use this tool to inject new metadata fields into multiple topics?

Yes, but at present it must be done manually by adding a new row to the extracted file for each article you want to add the metadata to, and populating it with the full file path, the ACTION "ADD", the TAG, the VALUE, and the format. There's a feature in the Docs Authoring Pack backlog to enable injecting metadata in bulk; to upvote this feature, please file an issue in this repo.

## What about the format column?

In general, you shouldn't touch this. This advanced functionality allows you to change the format of values as follows:

|Value    |Description|
|---------|-----------|
|`single` |Changes the value to single value format - that is, a single string following the field on the same line, such as<br>`author: meganbradley`.|
|`dash`   |Changes multi-valued attributes to values preceded by hyphens on multiple lines, such as<br>`ms.devlang:`<br>`  - csharp`<br>`  - vb`|
|`bracket`|Changes multi-valued attributes to a comma-separated bracket list, such as `ms.devlang: [csharp, vb]`.|

**Caution:** If you change a value or list to the wrong format, the file might become invalid.
