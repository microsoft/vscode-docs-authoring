# Docs Markdown to Mail Extension

This is a beta version of the docs-markdown-to-mail extension.

This extension allows users who have authenticated with Microsoft to convert markdown files to HTML and send the HTML in an Outlook message.

1. Hit F1 to open the VS Code command palette.
1. Start typing to filter the list of commands.
1. Select `Docs: Send as email`. This command will handle the conversion and automatically send the email to the logged in user.

Markdown files that include `ms.custom: internal-blog` metadata will have the Content & Learning banner applied. If the markdown does not include the `internal-blog` value, the banner will not be added.

If the user is not authenticated, the command will be abandoned.
