"use strict";

import { readFileSync, writeFileSync } from "fs";
import { window } from "vscode";
import { invalidTocEntryPosition } from "../constants/log-messages";
import { showStatusMessage, showWarningMessage } from "../helper/common";
// tslint:disable-next-line: no-var-requires
const yaml = require("js-yaml");

// const telemetryCommand: string = "updateTOC";

export function yamlCommands() {
  const commands = [{ command: insertTocEntry.name, callback: insertTocEntry }];
  return commands;
}

export function insertTocEntry() {
  const editor = window.activeTextEditor;
  if (editor) {
    const position = editor.selection.active;
    const cursorPosition = position.character;
    if (cursorPosition !== 0) {
      showWarningMessage(invalidTocEntryPosition);
      showStatusMessage(invalidTocEntryPosition);
    } else {
      const activeFile = editor.document.fileName;
      const content = yaml.safeLoad(readFileSync(activeFile, "utf8"));
      const data = {
        name: "test",
      };
      content.push(data);
      const newEntry = yaml.safeDump(content);
      writeFileSync(activeFile, newEntry);
    }
  }
}
