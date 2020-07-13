# Change Log

## 0.2.77 (July 13th, 2020)

- TOC indentation bug fix
- Added code block language standardization to cleanup functionality

## 0.2.76 (July 7th, 2020)

- Add list-controller tests
- Added auto-complete for ms.prod, ms.service, ms.subservice, and ms.technology.

## 0.2.75 (June 26th, 2020)

- Support updating empty metadata
- Authentication for allowlist on image extension

## 0.2.74 (June 11th, 2020)

- Collapse relative link improvements
- Remote-WSL bug fix: [Issue 605](https://github.com/microsoft/vscode-docs-authoring/issues/605)
- Added Unit Test Coverage: table-controller.ts
- Single value cleanup bug fix: [Issue 252](https://github.com/microsoft/vscode-docs-authoring/issues/252)
- Bug fix for cleanup metadata removing body text

## 0.2.73 (June 8th, 2020)

- List bug fix: [Issue 409](https://github.com/microsoft/vscode-docs-authoring/issues/409)

## 0.2.72 (June 4th, 2020)

- Added support for triple colon video extension insertion.
- Bug fix for Link in repo.
- Updated collapse relative link feature.
- User snippet tab stop bug fix: [Issue 140](https://github.com/microsoft/vscode-docs-authoring/issues/140)

## 0.2.71 (May 29th, 2020)

- Improved support for collapse relative links in folder experience.

## 0.2.70 (May 25th, 2020)

- Added support for clickable images
- Fixed master redirect command

## 0.2.69 (May 20th, 2020)

- Added collapseRelativeLinks to link-controller
- Fixed broken include-controller tests when running on \*nix systems
- Updated stub of "sendTelemetryEvent" in cleanup-controller which was throwing an error.

## 0.2.68 (May 8th, 2020)

- Added Completion Provider for Triple Colon Extensions

## 0.2.67 (April 30th, 2020)

- Added Unit Test Coverage: code-controller.ts
- Added Moniker to quick-pick-menu-controller.ts
- Added Unit Test Coverage: include-controller.ts
- Added Unit Test Coverage: bold-controller.ts

## 0.2.63 (April 2nd, 2020)

- Bundling with webpack

## 0.2.62 (April 1st, 2020)

- Added moniker insertion feature for metadata and markdown
- Added the ability to fix invalid redirect_document_id values

## 0.2.60 (March 23rd, 2020)

- Added feature for resolving daisy chained paths in openpublishing.redirection.json
- Added mocha junit test coverage and nyc code coverage reports

## 0.2.59 (March 12th, 2020)

- Expanded the usage of the update metadata values command to YAML

## 0.2.58 (March 9th, 2020)

- Updated Dev Languages for code block language completion

## 0.2.57 (March 6th, 2020)

- Link text bug fix: [Issue 410](https://github.com/microsoft/vscode-docs-authoring/issues/410)

## 0.2.56 (March 5th, 2020)

- Bug fix for notification to user on file change
- added download.microsoft.com link for cleanup script

## 0.2.55 (February 21st, 2020)

- Moved custom markdown linting rules to its own project: docs-linting.

## 0.2.51 (February 21st, 2020)

- Add preview/beta feature setting

## 0.2.50 (February 20th, 2020)

- Added config setting for loc-scope

## 0.2.47 (February 14th, 2020)

- Added empty metadata cleanup script

## 0.2.44 (February 4th, 2020)

- Added folder level and file level cleanup script

## 0.2.40 (January 28th, 2020)

- Fix bug that prevented language identifiers from being suggested

## 0.2.39 (January 28th, 2020)

- Multi-cursor/selection formatting

## 0.2.38 (January 28nd, 2020)

- Typing a triple backtick will trigger auto-completion for language identifiers
- Sort selection added, both ASC and DESC sort available

## 0.2.33 (January 14th, 2020)

- Extend include scope

## 0.2.32 (January 10th, 2020)

- Fixed alt text image bug on macOS

## 0.2.31 (January 9th, 2020)

- Fixed column bug

## 0.2.30 (January 6th, 2020)

- Include filtering
- Xref preview and linting updates

## 0.2.29 (December 19th, 2019)

- Added triple colon code snippet extension

## 0.2.28 (December 16th, 2019)

- Fixed image linting bug

## 0.2.27 (December 6th, 2019)

- Image and no-loc linting updates
- Added clickable links for source on triple colon extension

## 0.2.25 (November 15th, 2019)

- Fixed bug with xref linting
- Fixed TOC bug with node positioning
- Updated README

## 0.2.24 (November 5th, 2019)

- Update link UI
- Add link checker extension support (https://marketplace.visualstudio.com/items?itemName=blackmist.LinkCheckMD)

## 0.2.23 (October 14th, 2019)

- Added Standard Markdown Image to Image extension

## 0.2.22 (October 7th, 2019)

- Loc-Scope options now include other and third-party
- Bug fix for image extension linting rules

## 0.2.21 (October 1st, 2019)

- Loc-Scope options now include all products

## 0.2.19 (September 20th, 2019)

- Support for yaml file extension/language
- TOC location error bugfix

## 0.2.18 (September 13th, 2019)

- TOC parent node bugfix

## 0.2.17 (September 9th, 2019)

- TOC href link bugfix
- TOC attribute bugfix
- Telemetry updates

## 0.2.16 (August 30th, 2019)

- Column command title update

## 0.2.15 (August 22st, 2019)

- Xref Bug Fixes and support additional Xref tags.

## 0.2.14 (August 21st, 2019)

- Row and column support
- Output window update

## 0.2.13 (August 5th, 2019)

- Xref support for <xref:...> Markdown insertion
- xref linting rules

## 0.2.12 (July 22nd, 2019)

- Update YAML TOC attributes

## 0.2.11 (July 17th, 2019)

- Markdownlint: Rule MD025 front matter update

## 0.2.10 (July 10th, 2019)

- YAML TOC support
- No-Loc extension support
- UI updates

## 0.2.9 (June 14th, 2019)

- Breaking change in latest VS Code release: revert custom tabbing support

## 0.2.8 (June 11th, 2019)

- Support custom tabbing in lists

## 0.2.7 (June 7th, 2019)

- Telemetry update

## 0.2.6 (June 3rd, 2019)

- Build reporting link
- UI updates

## 0.2.5 (April 26th, 2019)

- Telemetry: basic usage data

## 0.2.4 (April 17th, 2019)

- Bookmark update

## 0.2.3 (April 1st, 2019)

- Added Cleanup Tasks to Quickpick

## 0.2.2 (January 17th, 2018)

- Custom markdownlint rule updates (temporarily disable alert linting)

## 0.2.1 (December 10th, 2018)

- New custom markdownlint rules (alerts, secure links)
- UI update for external link command

## 0.2.0 (December 3rd, 2018)

- Markdownlint custom rule integration
- Quickpick update

## 0.1.5 (October 3rd, 2018)

- Bookmark/heading quickpick update

## 0.1.4 (August 20th, 2018)

- Update toolbar link options
- Bookmarks/headings no longer link to H1; H2-H6 are still supported

## 0.1.3 (August 2nd, 2018)

- Link UI updates
- Output stream update
- VSCode engine update

## 0.1.2 (July 3rd, 2018)

- Remove quickpick button from navigation menu

## 0.1.1 (June 20th, 2018)

- Update readme links

## 0.1.0 (June 18th, 2018)

- Template extension integration
- Fix paths related to docs-markdown folder rename
- MacOS and Linux external bookmark logic updates
- Snippet support for CommonMark markdown implementation
- Updates to command palette and keybindings

## 0.0.3 (May 10th, 2018)

- Vim extension compatibility fix
- Update QuickPick menu description

## 0.0.2 (April 30th, 2018)

- Updates to active workspace verification
- Documentation updates

## 0.0.1 (April 3rd, 2018)

First release with the following functionality:

- Text formatting (bold, italic and code)
- Alerts
- Links
- Images
- Lists
- Tables
- Includes
- Snippets
- Preview
