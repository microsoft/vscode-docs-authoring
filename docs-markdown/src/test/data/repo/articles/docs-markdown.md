---
# required metadata
title: Docs Markdown reference
description: The OPS platform guide to Markdown and DocFX Flavored Markdown (DFM) extensions.
author: meganbradley
ms.author: mbradley
ms.date: 07/23/2018
ms.prod: non-product-specific
ms.topic: contributor-guide
ms.custom: internal-contributor-guide
---

# Docs Markdown Reference

Markdown is a lightweight markup language with plain text formatting syntax. Docs supports the CommonMark standard for Markdown, plus some custom Markdown extensions designed to provide richer content on docs.microsoft.com. This article provides an alphabetical reference for using Markdown for docs.microsoft.com.

You can use any text editor to author Markdown. For an editor that makes it easier to insert both standard Markdown and custom Docs Markdown extensions, we recommend [VS Code](https://code.visualstudio.com/) with the [Docs Authoring Pack](https://aka.ms/DocsAuthoringPack) installed.

Docs has standardized on Markdig for all new repos, and older repos are migrating to Markdig. You can test the rendering of Markdown in Markdig vs. other engines at [https://babelmark.github.io/](https://babelmark.github.io/).

> [!IMPORTANT]
> Engineering has some documentation on how DFM and Markdig engines differ, review the following documents if you are working on a Markdig Migration:
> * [Markdig Migration Information](https://review.docs.microsoft.com/en-us/new-hope/engineering/tools/markdig/markdig-migration-information?branch=master&tabs=dfm)
> * [Markdig Migration FAQ](https://review.docs.microsoft.com/en-us/new-hope/engineering/tools/markdig/markdig-migration-faq?branch=master&tabs=dfm)
>

## Alerts (Note, Tip, Important, Caution, Warning)

Alerts an OPS-specific Markdown extension to create block quotes that render on docs.microsoft.com with colors and icons that indicate the significance of the content. The following alert types are supported:

```markdown
> [!NOTE]
> Information the user should notice even if skimming.

> [!TIP]
> Optional information to help a user be more successful.

> [!IMPORTANT]
> Essential information required for user success.

> [!CAUTION]
> Negative potential consequences of an action.

> [!WARNING]
> Dangerous certain consequences of an action.
```

These alerts look like this on docs.microsoft.com:

> [!NOTE]
> Information the user should notice even if skimming.

> [!TIP]
> Optional information to help a user be more successful.

> [!IMPORTANT]
> Essential information required for user success.

> [!CAUTION]
> Negative potential consequences of an action.

> [!WARNING]
> Dangerous certain consequences of an action.

## Code snippets

You can embed code snippets in your Markdown files:

```markdown
[!code-<language>[<name>](<codepath><queryoption><queryoptionvalue> "<title>")]
```

For more information about how to store and embed snippets, see [Code Snippets](codesnippets.md).

## Columns

The **columns** Markdown extension has been implemented to give Docs authors the ability to add column-based content layouts that are more flexible and powerful than basic Markdown tables, which are only suited for true tabular data. You can add up to four columns, and use the optional `span` attribute to merge two or more columns.

The syntax for columns is as follows:

```markdown
:::row:::
   :::column span="":::
      Content...
   :::column-end:::
   :::column span="":::
      More content...
   :::column-end:::
:::row-end:::
```

Columns should only contain basic Markdown, including images. Headings, tables, tabs, and other complex structures should not be included. A row can't have any content outside of column.

For example, the following Markdown creates one column that spans two column widths, and one standard (no `span`) column:

```markdown
:::row:::
   :::column span="2":::
      **This is a 2-span column with lots of random text.**

      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vestibulum mollis nunc
      ornare commodo. Nullam ac metus imperdiet, rutrum justo vel, vulputate leo. Donec
      rutrum non eros eget consectetur. Integer neque massa, mollis sed imperdiet sed, 
      consequat in orci. Nam at tortor id sapien ultrices lobortis et vitae purus. In suscipit
      sem ut nisl pellentesque gravida. Proin molestie magna non nisl tempus, sit amet pulvinar
      arcu scelerisque. Nunc felis nisi, sagittis ac ante at, accumsan venenatis erat.
   :::column-end:::
   :::column span="":::
      **This is a single-span column with a Smurf in it.**

      ![brainy](../media/brainy-smurf.jpg)
   :::column-end:::
:::row-end:::
```

This renders as follows:

:::row:::
   :::column span="2":::
      **This is a 2-span column with lots of random text.**

      Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vestibulum mollis nunc
      ornare commodo. Nullam ac metus imperdiet, rutrum justo vel, vulputate leo. Donec
      rutrum non eros eget consectetur. Integer neque massa, mollis sed imperdiet sed, 
      consequat in orci. Nam at tortor id sapien ultrices lobortis et vitae purus. In suscipit
      sem ut nisl pellentesque gravida. Proin molestie magna non nisl tempus, sit amet pulvinar
      arcu scelerisque. Nunc felis nisi, sagittis ac ante at, accumsan venenatis erat.
   :::column-end:::
   :::column span="":::
      **This is a single-span column with a Smurf in it.**
      
      ![brainy](../media/brainy-smurf.jpg)
   :::column-end:::
:::row-end:::

## Headings

Docs supports six levels of Markdown headings:

```markdown
# This is a first level heading (H1)

## This is a second level heading (H2)

...

###### This is a sixth level heading (H6)
```

- There must be a space between the last `#` and heading text.
- Each Markdown file must have one and only one H1.
- The H1 must be the first content in the file after the YML metadata block.
- H2s automatically appear in the right-hand navigating menu of the published file. Lower-level headings don't, so use H2s strategically to help readers navigate your content.
- HMTL headings, such as `<h1>`, aren't recommended, and in some cases will cause build warnings.
- You can link to individual headings in a file via [bookmarks](links-how-to.md#bookmark-links).

### Third Level Heading

Body

#### Fourth Level Heading

Body

##### Fifth Level Heading

Body

###### Sixth Level Heading

Body

## HTML

Although Markdown supports inline HTML, HTML isn't recommended for publishing to Docs, and except for a limited list of values will cause build errors or warnings. For more information, see [HTML Whitelist](https://review.docs.microsoft.com/en-us/help/onboard/admin/html-whitelist?branch=master) in the Docs Admin Guide.

## Images

The basic syntax to include an image is:

```markdown
![[alt text]](<folderPath>)

Example:
![alt text for image](../images/Introduction.png)
```

Where `alt text` is a brief description of the image and `<folder path>` is a relative path to the image. Alternate text is required for screen readers for the visually impaired. It's also useful if there's a site bug where the image can't render.

Images should be stored in a `/media` folder within your docset. The following file types are supported by default for images:

- .jpg
- .png

You can add support for other image types by adding them as resources to the docfx.json file<!--add link to reference when available--> for your docset. For example, add .gif to enable animated .gif files:

![Responsive design](../media/responsivedesign.gif)

For more information about creating and using images, see [Create a screenshot](contribute-how-to-create-screenshot.md), [Create an expandable screenshot](contribute-how-to-use-lightboxes.md), [Create conceptual art](contribute-how-to-create-conceptual-art.md), and [Create an animated GIF](contribute-animated-gifs.md).

## Included Markdown files

You can include other Markdown files within a Markdown file. For more information, see [Include reusable content in articles](includes-best-practices.md).

## Links

Docs generally uses standard Markdown links to other files and pages. For links to reference content, Docs uses a Markdown extension called XREF. For more information, see [Links](links-how-to.md).

## Lists (Numbered, Bulleted, Checklist)

### Numbered list

To create a numbered list, you can use all 1s, which are rendered as a sequential list when published. For increased source readability, you can increment your lists.

Don't use letters in lists, including nested lists. They don't render correctly when published to Docs. Nested lists using numbers will render as lowercase letters when published. For example:

```markdown
1. This is
1. a parent numbered list
   1. and this is
   1. a nested numbered list
1. (fin)
```

This renders as follows:

1. This is
1. a parent numbered list
   1. and this is
   1. a nested numbered list
1. (fin)

### Bulleted list

To create a bulleted list, use `-` followed by a space at the beginning of each line:

```markdown
- This is
- a parent bulleted list
  - and this is
  - a nested bulleted list
- All done!
```

This renders as follows:

- This is
- a parent bulleted list
  - and this is
  - a nested bulleted list
- All done!

### Checklist

Checklists are available for use on docs.microsoft.com (only) via a custom Markdown extension:

```markdown
> [!div class="checklist"]
> * List item 1
> * List item 2
> * List item 3
```

This example renders on docs.microsoft.com like this:

> [!div class="checklist"]
> * List item 1
> * List item 2
> * List item 3

Use checklists at the beginning or end of an article to summarize "What will you learn" or "What have you learned" content. Do not add random checklists throughout your articles.
<!-- is this guidance still accurate? -->

## Next step action

You can use a custom extension to add a next step action button to pages on docs.microsoft.com (only).

The syntax is as follows:

```markdown
> [!div class="nextstepaction"]
> [button text](link to topic)
```

For example:

```markdown
> [!div class="nextstepaction"]
> [Learn about moving files](moving-files.md)
```

This renders as follows:

> [!div class="nextstepaction"]
> [Learn about moving files](moving-files.md)

You can use any supported link in a next step action, including a Markdown link to another web page. In most cases, the next action link will be a relative link to another file in the same docset.

## Non-localized strings

You can use the custom `no-loc` Markdown extension to identify strings of content that you would like the localization process to ignore.

All strings called out will be case-sensitive; that is, the string must match exactly to be ignored for localization.

To mark an individual string as non-localizable, use this syntax:

```markdown
:::no-loc text="String":::
```

For example, in the following, only the single instance of `Document` will be ignored during the localization process:

```markdown
# Heading 1 of the Document

Markdown content within the :::no-loc text="Document":::.  The are multiple instances of Document, document, and documents.
```

> [!NOTE]
> Use `\` to escape special characters:
> ```markdown
> Lorem :::no-loc text="Find a \"Quotation\""::: Ipsum.
> ```

You can also use metadata in the YAML header to mark all instances of a string within the current Markdown file as non-localizable:

```yml
author: cillroy
no-loc: [Global, Strings, to be, Ignored]
```

In the following example, both in the metadata `title` and the Markdown header the word `Document` will be ignored during the localization process.

In the metadata `description` and the Markdown main content the word `document` is localized, because it does not have start with a capital `D`.

```markdown
---
title: Title of the Document
author: author-name
description: Description for the document
no-loc: [Title, Document]
---
# Heading 1 of the Document

Markdown content within the document.
```

<!-- commenting out for now because no one knows what this means
## Section definition

You might need to define a section. This syntax is mostly used for code tables.
See the following example:

````
> [!div class="tabbedCodeSnippets" data-resources="OutlookServices.Calendar"]
> ```cs
> <cs code text>
> ```
> ```javascript
> <js code text>
> ```
````

The preceding blockquote Markdown text will be rendered as:
> [!div class="tabbedCodeSnippets" data-resources="OutlookServices.Calendar"]
> ```cs
> <cs code text>
> ```
> ```javascript
> <js code text>
> ```
-->

## Selectors

<!-- could be more clear! -->
You can use a selector when you want to connect different pages for the same article. Readers can then switch between those pages.

> [!NOTE]
> This extension works differently between docs.microsoft.com and MSDN. <!-- should we keep info about MSDN? If so say how they differ?-->

### Single selector

```
> [!div class="op_single_selector"]
> - [Universal Windows](../articles/notification-hubs-windows-store-dotnet-get-started/)
> - [Windows Phone](../articles/notification-hubs-windows-phone-get-started/)
> - [iOS](../articles/notification-hubs-ios-get-started/)
> - [Android](../articles/notification-hubs-android-get-started/)
> - [Kindle](../articles/notification-hubs-kindle-get-started/)
> - [Baidu](../articles/notification-hubs-baidu-get-started/)
> - [Xamarin.iOS](../articles/partner-xamarin-notification-hubs-ios-get-started/)
> - [Xamarin.Android](../articles/partner-xamarin-notification-hubs-android-get-started/)
```

... will be rendered like this:

> [!div class="op_single_selector"]
> - [Universal Windows](../index.md)
> - [Windows Phone](../index.md)
> - [iOS](../index.md)
> - [Android](../index.md)
> - [Kindle](../index.md)
> - [Baidu](../index.md)
> - [Xamarin.iOS](../index.md)
> - [Xamarin.Android](../index.md)

### Multi-selector

```
> [!div class="op_multi_selector" title1="Platform" title2="Backend"]
> - [(iOS | .NET)](./mobile-services-dotnet-backend-ios-get-started-push.md)
> - [(iOS | JavaScript)](./mobile-services-javascript-backend-ios-get-started-push.md)
> - [(Windows universal C# | .NET)](./mobile-services-dotnet-backend-windows-universal-dotnet-get-started-push.md)
> - [(Windows universal C# | Javascript)](./mobile-services-javascript-backend-windows-universal-dotnet-get-started-push.md)
> - [(Windows Phone | .NET)](./mobile-services-dotnet-backend-windows-phone-get-started-push.md)
> - [(Windows Phone | Javascript)](./mobile-services-javascript-backend-windows-phone-get-started-push.md)
> - [(Android | .NET)](./mobile-services-dotnet-backend-android-get-started-push.md)
> - [(Android | Javascript)](./mobile-services-javascript-backend-android-get-started-push.md)
> - [(Xamarin iOS | Javascript)](./partner-xamarin-mobile-services-ios-get-started-push.md)
> - [(Xamarin Android | Javascript)](./partner-xamarin-mobile-services-android-get-started-push.md)
```

... will be rendered like this:

> [!div class="op_multi_selector" title1="Platform" title2="Backend"]
> - [(iOS | .NET)](../index.md)
> - [(iOS | JavaScript)](../index.md)
> - [(Windows universal C# | .NET)](../index.md)
> - [(Windows universal C# | Javascript)](../index.md)
> - [(Windows Phone | .NET)](../index.md)
> - [(Windows Phone | Javascript)](../index.md)
> - [(Android | .NET)](../index.md)
> - [(Android | Javascript)](../index.md)
> - [(Xamarin iOS | Javascript)](../index.md)
> - [(Xamarin Android | Javascript)](../index.md)

## Subscript and superscript

You should only use subscript or superscript when necessary for technical accuracy, such as when writing about mathematical formulas. Don't use them for non-standard styles, such as footnotes.

For both subscript and superscript, use HTML:

```html
Hello <sub>This is subscript!</sub>
```

This renders as follows:

Hello <sub>This is subscript!</sub>

```html
Goodbye <sup>This is superscript!</sup>
```

This renders as follows:

Goodbye <sup>This is superscript!</sup>

## Tabbed conceptual

Tabbed conceptual is a **deprecated** Markdown extension for docs.microsoft.com that allows us to present different versions of content, such as procedural steps to accomplish the same task on different platforms, in a tabbed format. User interviews demonstrated that the way tabs were displayed on the site was not intuitive: most users didn't notice them. Therefore, they are not approved for general use and are being replaced by a new syntax, zone pivots, currently in pilot phase.

Some content sets are already using tabbed conceptual and have been granted an exception to continue to do so until a replacement is available, but tabs shouldn't be added to content that doesn't already have them. See [Tabbed Conceptual](https://review.docs.microsoft.com/en-us/help/onboard/admin/tabbed-conceptual?branch=master) in the Docs Admin Guide for more information.

## Tables

The simplest way to create a table in Markdown is to use pipes and lines. To create a standard table with a header, follow the first line with dashed line:

```markdown
|This is   |a simple   |table header|
|----------|-----------|------------|
|table     |data       |here        |
|it doesn't|actually   |have to line up nicely!|
```

This renders as follows:

|This is   |a simple   |table header|
|----------|-----------|------------|
|table     |data       |here        |
|it doesn't|actually   |have to line up nicely!||

You can also create a table without a header. For example, to create a multiple-column list:

```markdown
|   |   |
| - | - |
| This | table |
| has no | header |
```

This renders like this:

|   |   |
| - | - |
| This | table |
| has no | header |

You can align the columns by using colons:

```markdown
| Fun                  | With                 | Tables          |
| :------------------- | -------------------: |:---------------:|
| left-aligned column  | right-aligned column | centered column |
| $100                 | $100                 | $100            |
| $10                  | $10                  | $10             |
| $1                   | $1                   | $1              |
```

Renders as follows:

| Fun                  | With                 | Tables          |
| :------------------- | -------------------: |:---------------:|
| left-aligned column  | right-aligned column | centered column |
| $100                 | $100                 | $100            |
| $10                  | $10                  | $10             |
| $1                   | $1                   | $1              |

> [!TIP]
> The Docs Authoring Extension for VS Code makes it easy to add basic Markdown tables!
>
> You can also use an [online table generator](http://www.tablesgenerator.com/markdown_tables).

### mx-tdBreakAll

> [!IMPORTANT]
> This only works on the docs.microsoft.com site.

If you create a table in Markdown, the table might expand to the right navigation and become unreadable. You can solve that by allowing Docs rendering to break the table when needed. Just wrap up the table with the custom class `[!div class="mx-tdBreakAll"]`.

Here is a Markdown sample of a table with three rows that will be wrapped by a `div` with the class name `mx-tdBreakAll`.

```markdown
> [!div class="mx-tdBreakAll"]
> |Name|Syntax|Mandatory for silent installation?|Description|
> |-------------|----------|---------|---------|
> |Quiet|/quiet|Yes|Runs the installer, displaying no UI and no prompts.|
> |NoRestart|/norestart|No|Suppresses any attempts to restart. By default, the UI will prompt before restart.|
> |Help|/help|No|Provides help and quick reference. Displays the correct use of the setup command, including a list of all options and behaviors.|
```

It will be rendered like this:

> [!div class="mx-tdBreakAll"]
> |Name|Syntax|Mandatory for silent installation?|Description|
> |-------------|----------|---------|---------|
> |Quiet|/quiet|Yes|Runs the installer, displaying no UI and no prompts.|
> |NoRestart|/norestart|No|Suppresses any attempts to restart. By default, the UI will prompt before restart.|
> |Help|/help|No|Provides help and quick reference. Displays the correct use of the setup command, including a list of all options and behaviors.|

### mx-tdCol2BreakAll

> [!IMPORTANT]
> This only works on the docs.microsoft.com site.

From time to time, you might have long words in the second column of a table. To ensure they are broken apart nicely, you can apply the class `mx-tdCol2BreakAll` by using the `div` wrapper syntax as shown earlier.

### HTML Tables

HTML tables aren't recommended for docs.microsoft.com. They aren't human readable in the source - which is a key principle of Markdown.

<!--If you use HTML tables and your Markdown is not being rendered between the two tables, you need to add a closing `br` tag after the closing `table` tag.

![break HTML tables](media/break-tables.png)
-->

## Videos

### Embedding videos into a Markdown page

Currently, OPS can support videos published to one of three locations:

- YouTube
- Channel 9
- Microsoft's own 'One Player' system

You can embed a video with the following syntax, and OPS will render it.

```markdown
> [!VIDEO <embedded_video_link>]
```
> [!IMPORTANT]
> The CH9 video URL should start with `https` and end with `/player`. Otherwise, it will embed the whole page instead of the video only.

Example:

```markdown
> [!VIDEO https://channel9.msdn.com/Series/Youve-Got-Key-Values-A-Redis-Jump-Start/03/player]

> [!VIDEO https://www.youtube.com/embed/iAtwVM-Z7rY]

> [!VIDEO https://www.microsoft.com/en-us/videoplayer/embed/RE1XVQS]
```

... will be rendered as:

```html
<iframe src="https://channel9.msdn.com/Series/Youve-Got-Key-Values-A-Redis-Jump-Start/03/player" width="640" height="320" allowFullScreen="true" frameBorder="0"></iframe>

<iframe src="https://www.youtube-nocookie.com/embed/iAtwVM-Z7rY" width="640" height="320" allowFullScreen="true" frameBorder="0"></iframe>
<iframe src="https://www.microsoft.com/en-us/videoplayer/embed/RE1XVQS" width="640" height="320" allowFullScreen="true" frameBorder="0"></iframe>
```

And it will look like this on published pages:

> [!VIDEO https://channel9.msdn.com/Series/Youve-Got-Key-Values-A-Redis-Jump-Start/03/player]

> [!VIDEO https://www.youtube.com/embed/iAtwVM-Z7rY]

> [!VIDEO https://www.microsoft.com/en-us/videoplayer/embed/RE1XVQS]

### Uploading new videos

Any new videos should be uploaded using the following process:

1. Join the **docs_video_users** group on IDWEB.
1. Go to https://aka.ms/VideoUploadRequest and fill in the details for your video. You will need (note that none of these items will be visible to the public):
    1. A title for your video.
    1. A list of products/services that your video is related to.
    1. The target page or (if you don't have the page yet) docset that your video will be hosted on.
    1. A link to the MP4 file for your video (if you don't have a location to put the file, you can put it here temporarily:   `\\scratch2\scratch\apex`). MP4 files should be 720p or higher.
    1. A description of the video.
1. Submit (save) that item.
1. Within two business days, the video will get uploaded. The link you need for embedding will be placed into the work item, and it will be resolved *back to you*.
1. Once you have grabbed the video link, close the work item.
1. The video link can then be added to your post, using this syntax:

   ```markdown
   > [!VIDEO https://www.microsoft.com/en-us/videoplayer/embed/RE1XVQS]
   ```

