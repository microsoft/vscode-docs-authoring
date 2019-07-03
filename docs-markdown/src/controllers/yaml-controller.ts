"use strict";

import { readFileSync } from "fs";
import { files } from "node-dir";
import { basename, dirname, extname, join } from "path";
import { QuickPickItem, window, workspace } from "vscode";
import { insertedTocEntry, invalidTocEntryPosition, noHeading, noHeadingSelected } from "../constants/log-messages";
import { insertContentToEditor, noActiveEditorMessage, sendTelemetryData, showStatusMessage } from "../helper/common";

const telemetryCommand: string = "updateTOC";
let commandOption: string;

export function yamlCommands() {
  // tslint:disable-next-line: no-shadowed-variable
  const commands = [
    { command: insertTocEntry.name, callback: insertTocEntry },
    { command: insertTocEntryWithOptions.name, callback: insertTocEntryWithOptions },
    { command: insertExpandableParentNode.name, callback: insertExpandableParentNode },
  ];
  return commands;
}

export function insertTocEntry() {
  commandOption = "tocEntry";
  checkForPreviousEntry(false);
}
export function insertTocEntryWithOptions() {
  commandOption = "tocEntryWithOptions";
  checkForPreviousEntry(true);
}

export function insertExpandableParentNode() {
  commandOption = "expandableParentNode";
  createParentNode();
}

export function showQuickPick(options: boolean) {
  const markdownExtensionFilter = [".md"];
  const headingTextRegex = /^(# )(.*)/gm;
  let folderPath: string = "";
  let fullPath: string = "";

  if (workspace.workspaceFolders) {
    folderPath = workspace.workspaceFolders[0].uri.fsPath;
  }

  // tslint:disable-next-line: no-shadowed-variable
  files(folderPath, (err: any, files: any) => {
    if (err) {
      window.showErrorMessage(err);
      throw err;
    }

    const items: QuickPickItem[] = [];
    files.sort();
    files.filter((file: any) => markdownExtensionFilter.indexOf(extname(file.toLowerCase())) !== -1).forEach((file: any) => {
      items.push({ label: basename(file), description: dirname(file) });
    });

    // show the quick pick menu
    const selectionPick = window.showQuickPick(items);
    selectionPick.then((qpSelection) => {
      const editor = window.activeTextEditor;
      if (!editor) {
        noActiveEditorMessage();
        return;
      }

      if (!qpSelection) {
        return;
      }

      if (qpSelection.description) {
        fullPath = join(qpSelection.description, qpSelection.label);
      }

      const content = readFileSync(fullPath, "utf8");
      const headings = content.match(headingTextRegex);

      if (!headings) {
        window.showErrorMessage(noHeading);
        return;
      }
      let headingName = headings.toString().replace("# ", "");
      const hrefName = qpSelection.label;
      window.showInputBox({
        value: headingName,
        valueSelection: [0, 0],
      }).then((val) => {
        if (!val) {
          window.showInformationMessage(noHeadingSelected);
        }
        if (val) {
          headingName = val;
        }
        createEntry(headingName, hrefName, options);
      });
    });
  });
}

export function createEntry(name: string, href: string, options: boolean) {
  const editor = window.activeTextEditor;
  if (!editor) {
    return;
  }
  const position = editor.selection.active;
  const cursorPosition = position.character;
  const attributeSpace = "  ";

  const tocEntryLineStart =
    `- name: ${name}
  href: ${href}`

  const tocEntryIndented =
    `- name: ${name}
  ${attributeSpace}href: ${href}`

  const tocEntryWithOptions =
    `- name: ${name}
  displayname: #optional string for searching TOC
  href: ${href}
  maintainContext: #true or false, false is default
  uid: #optional string
  expanded: #true or false, false is default
  items: #optional sub-entries`

  const tocEntryWithOptionsIndented =
    `- name: ${name}
  ${attributeSpace}displayname: #optional string for searching TOC
  ${attributeSpace}href: ${href}
  ${attributeSpace}maintainContext: #true or false, false is default
  ${attributeSpace}uid: #optional string
  ${attributeSpace}expanded: #true or false, false is default
  ${attributeSpace}items: #optional sub-entries`

  if (cursorPosition === 0 && !options) {
    insertContentToEditor(editor, insertTocEntry.name, tocEntryLineStart);
  }
  if (cursorPosition > 0 && !options) {
    insertContentToEditor(editor, insertTocEntry.name, tocEntryIndented);
  }
  if (cursorPosition === 0 && options) {
    insertContentToEditor(editor, insertTocEntryWithOptions.name, tocEntryWithOptions);
  }
  if (cursorPosition > 0 && options) {
    insertContentToEditor(editor, insertTocEntryWithOptions.name, tocEntryWithOptionsIndented);
  }
  showStatusMessage(insertedTocEntry);
  sendTelemetryData(telemetryCommand, commandOption);
}

export function checkForPreviousEntry(options: boolean) {
  const editor = window.activeTextEditor;
  if (!editor) {
    return;
  }
  const position = editor.selection.active;
  const cursorPosition = position.character;
  const currentLine = position.line;

  // case 1: beginning of toc/first line
  if (currentLine === 0) {
    if (cursorPosition === 0) {
      launchQuickPick(options)
    } else {
      window.showErrorMessage(invalidTocEntryPosition);
      return;
    }
  }

  const previousLine = currentLine - 1;
  const previousLineData = editor.document.lineAt(previousLine);
  const nameScalar = `- name:`
  const itemsScalar = `items:`
  const hrefScalar = `href:`

  // case 2: name scalar on previous line
  if (previousLineData.text.includes(nameScalar)) {
    // if previous line starts with nameScalar check for cursor.  if equal, show quickpick.  if not, show error.
    if (previousLineData.firstNonWhitespaceCharacterIndex === cursorPosition) {
      launchQuickPick(options)
    } else {
      window.showErrorMessage(invalidTocEntryPosition);
      return;
    }
  }

  // case 2: items scalar on previous line
  if (previousLineData.text.includes(itemsScalar)) {
    // if nameLine starts with itemsScalar check for cursor.  if equal, show quickpick.  if not, show error.
    if (previousLineData.firstNonWhitespaceCharacterIndex === cursorPosition) {
      launchQuickPick(options)
    } else {
      window.showErrorMessage(invalidTocEntryPosition);
      return;
    }
  }

  // case 3: href scalar on previous line
  if (previousLineData.text.includes(hrefScalar)) {
    // get content for line above href
    const nameLine = currentLine - 2;
    const nameLineData = editor.document.lineAt(nameLine);
    // if nameLine starts with nameScalar check for cursor.  if equal, show quickpick.  if not, show error.
    if (nameLineData.text.includes(nameScalar)) {
      if (nameLineData.firstNonWhitespaceCharacterIndex === cursorPosition) {
        launchQuickPick(options);
      } else {
        window.showErrorMessage(invalidTocEntryPosition);
        return;
      }
    }
  }
}

export function createParentNode() {
  const editor = window.activeTextEditor;
  if (!editor) {
    return;
  }
  const position = editor.selection.active;
  const cursorPosition = position.character;
  const attributeSpace = "  ";
  const indentedSpace = "    ";

  const parentNodeLineStart = `- name:
  items:
  - name:
    href:`

  const parentNodeIndented = `- name:
  ${attributeSpace}items:
  ${attributeSpace}- name:
  ${indentedSpace}href:`

  if (cursorPosition === 0) {
    insertContentToEditor(editor, insertTocEntry.name, parentNodeLineStart);
  }
  if (cursorPosition > 0) {
    insertContentToEditor(editor, insertTocEntry.name, parentNodeIndented);
  }
}

export function launchQuickPick(options: boolean) {
  if (!options) {
    showQuickPick(false);
  } else {
    showQuickPick(true);
  }
}