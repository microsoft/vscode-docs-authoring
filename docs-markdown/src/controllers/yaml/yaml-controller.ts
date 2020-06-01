"use strict";

import { readFileSync } from "fs";
import { basename, dirname, extname, join, relative } from "path";
import * as recursive from "recursive-readdir";
import { QuickPickItem, window, workspace } from "vscode";
import { noHeading, noHeadingSelected } from "../../constants/log-messages";
import { ignoreFiles, noActiveEditorMessage } from "../../helper/common";
import { checkForPreviousEntry } from "./checkForPreviousEntry";
import { createParentNode } from "./createParentNode";
import { createEntry } from "./createEntry";

let commandOption: string;

export function yamlCommands() {
  // tslint:disable-next-line: no-shadowed-variable
  const commands = [
    { command: insertTocEntry.name, callback: insertTocEntry },
    {
      command: insertTocEntryWithOptions.name,
      callback: insertTocEntryWithOptions,
    },
    {
      command: insertExpandableParentNode.name,
      callback: insertExpandableParentNode,
    },
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

export async function showQuickPick(options: boolean) {
  const markdownExtensionFilter = [".md"];
  const headingTextRegex = /^(# )(.*)/gm;
  let folderPath: string = "";
  let fullPath: string = "";

  if (workspace.workspaceFolders) {
    folderPath = workspace.workspaceFolders[0].uri.fsPath;
  }

  const files = await recursive(folderPath, ignoreFiles);

  const items: QuickPickItem[] = [];
  files.sort();
  files
    .filter(
      (file: any) =>
        markdownExtensionFilter.indexOf(extname(file.toLowerCase())) !== -1
    )
    .forEach((file: any) => {
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
    const activeFilePath = editor.document.fileName;
    const href = relative(activeFilePath, fullPath);
    // format href: remove addtional leading segment (support windows, macos and linux), set path separators to standard
    const formattedHrefPath = href
      .replace("..\\", "")
      .replace("../", "")
      .replace(/\\/g, "/");
    window
      .showInputBox({
        value: headingName,
        valueSelection: [0, 0],
      })
      .then((val) => {
        if (!val) {
          window.showInformationMessage(noHeadingSelected);
        }
        if (val) {
          headingName = val;
        }
        createEntry(headingName, formattedHrefPath, options);
      });
  });
}

export function launchQuickPick(options: boolean) {
  if (!options) {
    showQuickPick(false);
  } else {
    showQuickPick(true);
  }
}
