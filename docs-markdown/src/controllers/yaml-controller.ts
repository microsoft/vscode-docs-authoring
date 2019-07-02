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
  const attributeSpaceIndented = attributeSpace.repeat(cursorPosition);

  if (cursorPosition === 0 && !options) {
    insertContentToEditor(editor, insertTocEntry.name, `- name: ${name}\n${attributeSpace}href: ${href}`);
  }
  if (cursorPosition !== 0 && !options) {
    insertContentToEditor(editor, insertTocEntry.name, `- name: ${name}\n${attributeSpaceIndented}href: ${href}`);
  }
  if (cursorPosition === 0 && options) {
    insertContentToEditor(editor, insertTocEntryWithOptions.name, `- name: ${name}\n${attributeSpace}displayname: #optional string for searching TOC\n${attributeSpace}href: ${href}\n${attributeSpace}maintainContext: #true or false, false is default\n${attributeSpace}uid: #optional string\n${attributeSpace}expanded: #true or false, false is default\n${attributeSpace}items: #optional sub-entries`);
  }
  if (cursorPosition !== 0 && options) {
    insertContentToEditor(editor, insertTocEntryWithOptions.name, `- name: ${name}\n${attributeSpaceIndented}displayname: #optional string for searching TOC\n${attributeSpaceIndented}href: ${href}\n${attributeSpaceIndented}maintainContext: #true or false, false is default\n${attributeSpaceIndented}uid: #optional string\n${attributeSpaceIndented}expanded: #true or false, false is default\n${attributeSpaceIndented}items: #optional sub-entries`);
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
  if (cursorPosition === 0) {
    // no need to check further
  }
  if (cursorPosition !== 0) {
    const currentLine = position.line;
    const previousLine = currentLine - 1;
    const previousLineContent = editor.document.lineAt(previousLine);
    const previousNameAttribute = previousLineContent.firstNonWhitespaceCharacterIndex - 2;
    if (previousNameAttribute !== cursorPosition) {
      window.showErrorMessage(invalidTocEntryPosition);
      return;
    }
  }
  if (!options) {
    showQuickPick(false);
  } else {
    showQuickPick(true);
  }
}

export function createParentNode() {
  const editor = window.activeTextEditor;
  if (!editor) {
    return;
  }
  const attributeSpace = "  ";
  const indentedSpace = "    ";
  insertContentToEditor(editor, insertTocEntry.name, `- name:\n${attributeSpace}items:\n${attributeSpace}- name:\n${indentedSpace}href:`);
}
