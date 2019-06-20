"use strict";

import { readFileSync } from "fs";
import { files } from "node-dir";
import { basename, dirname, extname, join } from "path";
import { QuickPickItem, window, workspace } from "vscode";
import { insertedTocEntry } from "../constants/log-messages";
import { insertContentToEditor, noActiveEditorMessage, showStatusMessage } from "../helper/common";

// tslint:disable-next-line: no-var-requires
const yaml = require("js-yaml");
// const telemetryCommand: string = "updateTOC";

export function yamlCommands() {
  // tslint:disable-next-line: no-shadowed-variable
  const commands = [
    { command: insertTocEntry.name, callback: insertTocEntry },
    { command: insertTocEntryWithOptions.name, callback: insertTocEntryWithOptions },
  ];
  return commands;
}

export function insertTocEntry() {
  showQuickPick(false);
}
export function insertTocEntryWithOptions() {
  showQuickPick(true);
}

export function showQuickPick(options: boolean) {
  const markdownExtensionFilter = [".md"];
  const headingTextRegex = /^(# )(.*)/gm;
  let folderPath: string = "";
  let fullPath: string = "";

  if (workspace.workspaceFolders) {
    folderPath = workspace.workspaceFolders[0].uri.fsPath;
    // console.log(folderPath);
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
      // const activeFileName = editor.document.fileName;
      // const activeFilePath = dirname(activeFileName);

      if (!qpSelection) {
        return;
      }

      if (qpSelection.description) {
        fullPath = join(qpSelection.description, qpSelection.label);
      }

      const content = readFileSync(fullPath, "utf8");
      const headings = content.match(headingTextRegex);

      if (!headings) {
        window.showErrorMessage("No headings found in file, cannot insert bookmark!");
        return;
      }
      let headingName = headings.toString().replace("# ", "");
      const hrefName = qpSelection.label;
      window.showInputBox({
        value: headingName,
      }).then((val) => {
        if (!val) {
          window.showInformationMessage("No heading name chosen.  Aboring command.");
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
  if (editor) {
    const position = editor.selection.active;
    const cursorPosition = position.character;
    const attributeSpace = "  ";
    const attributeSpaceIndented = attributeSpace.repeat(cursorPosition);
    if (cursorPosition === 0 && !(options)) {
      insertContentToEditor(editor, yaml, `- name: ${name}\n${attributeSpace}href: ${href}`);
    }
    if (cursorPosition !== 0 && !(options)) {
      insertContentToEditor(editor, yaml, `- name: ${name}\n${attributeSpaceIndented}href: ${href}`);
    }
    if (cursorPosition === 0 && options) {
      insertContentToEditor(editor, yaml, `- name: ${name}\n${attributeSpace}displayname: #optional string for searching TOC\n${attributeSpace}href: ${href}\n${attributeSpace}maintainContext: #true or false, false is default\n${attributeSpace}uid: #optional string\n${attributeSpace}expanded: #true or false, false is default\n${attributeSpace}items: #optional sub-entries`);
    }
    if (cursorPosition !== 0 && options) {
      insertContentToEditor(editor, yaml, `- name: ${name}\n${attributeSpaceIndented}displayname: #optional string for searching TOC\n${attributeSpaceIndented}href: ${href}\n${attributeSpaceIndented}maintainContext: #true or false, false is default\n${attributeSpaceIndented}uid: #optional string\n${attributeSpaceIndented}expanded: #true or false, false is default\n${attributeSpaceIndented}items: #optional sub-entries`);
    }
    showStatusMessage(insertedTocEntry);
  }
}
