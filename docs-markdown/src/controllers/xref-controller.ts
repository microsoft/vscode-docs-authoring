"use strict";

import { QuickPickItem, window, Range } from "vscode";
import { getAsync } from "../helper/http-helper";
import { noActiveEditorMessage, isMarkdownFileCheck, insertContentToEditor, setCursorPosition } from "../helper/common";

const telemetryCommand: string = "applyXref";
let commandOption: string;
const rootUrl: string = "https://xref.docs.microsoft.com";
const tags: string = "/dotnet";

export function applyXrefCommand() {
  const commands = [
    { command: applyXref.name, callback: applyXref },
  ];
  return commands;
}

export async function applyXref() {

  let editor = window.activeTextEditor;
  if (!editor) {
    noActiveEditorMessage();
    return;
  } else {
    if (!isMarkdownFileCheck(editor, false)) {
      return;
    }
  }
  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);
  let range;

  // if unselect text, add xref syntax as <xref:...>
  if (selectedText === "") {
    const cursorPosition = editor.selection.active;

    // assumes the range of xref syntax
    range = new Range(cursorPosition.with(cursorPosition.line,
      cursorPosition.character - 2 < 0 ? 0 : cursorPosition.character - 2),
      cursorPosition.with(cursorPosition.line, cursorPosition.character + 2));
    await getXrefSelection()
    // insertContentToEditor(editor, senderName, formattedText, true);

    // // Gets the cursor position
    // const position = editor.selection.active;
    // const positionCharacter = senderName === "formatBold" ? position.character + 2 : position.character + 1;
    // // Makes the cursor position in between syntaxs
    // setCursorPosition(editor, position.line, positionCharacter);
  } else {
    insertXrefIntoSelectedText(await getXrefSelection())
  }
}
function insertXrefIntoSelectedText(selection: any) {

}

async function getXrefSelection() {
  const items: QuickPickItem[] = [];
  let uid: string | undefined = await window.showInputBox({ placeHolder: "Enter XREF Search Term" });
  if (uid) {
    let content = await getAsync(`${rootUrl}/query?tags=${tags}&uid=${uid}`);
    content.data.map((item: { tags: any; uid: string; }) => {
      items.push({
        description: JSON.stringify(item.tags),
        label: item.uid,
      });
    });
    return window.showQuickPick(items, { placeHolder: "Link to XREF" }).then((selection) => {
      if (!selection) {
        return;
      }
      return selection;
    });
  }
} 
