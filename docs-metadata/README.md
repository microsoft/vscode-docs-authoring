# Docs Metadata Extension

The Docs Metadata Extension allows you to update metadata in the YAML headers of Docs Markdown files in bulk. The extension is particularly useful for reviewing a set of metadata in a tabular format and making updates as needed, in cases where a simple VS Code search and replace isn't appropriate. For example, suppose a Docs author changes jobs, and her articles across a repo need to be divided up between several other authors, but assignments don't map reliably to the repo folder structure. You can export metadata for the repo, find the articles assigned to the departing author, and change the values to other authors depending on the article title or other metadata.

## Step 1: Extract metadata

First, you need to extract the metadata of interest into tabular form.

1. Hit F1 to open the VS Code command palette.
1. Start typing to filter and select "Docs: Metadata Extract".
1. In the window that opens, browse to the folder you want to extract for. This can be the repo root or any subfolder.
1. Optionally, type the name of one metadata field to extract, such as `author`. If you don't specify a field, all metadata will be extracted.
1. Click OK to confirm.
1. An .xslx file structured as a tab-separated list will open side-by-side with you currently displayed VS Code file. You can edit the file directly in VS Code, or use the pop-up to go to the file in your Docs Authoring folder and open the file in Excel or another editor of your choice.

## Step 2: Update metadata

Next, review the metadata in the tabular format and make any desired changes, using the following available commands. 

|Command |Description |
|--------|------------|
|ADD     |Adds the tag and value only if it does not already exist. If there is an existing value for the tag, it will not be overwritten (that is, ADD will be ignored).|
|DELETE  |Deletes the tag and all values.|
|PARTIAL DELETE |Deletes specified value(s) for the tag. If additional values exist, they remain. If all values are deleted, the tag is also deleted.|


