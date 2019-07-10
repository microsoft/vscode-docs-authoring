"use strict";

import { QuickPickItem, window, CompletionItem, Range, Position } from "vscode";
import { getAsync } from "../helper/http-helper";
import { noActiveEditorMessage, isMarkdownFileCheck, insertContentToEditor, setCursorPosition, sendTelemetryData } from "../helper/common";
import { reporter } from "../helper/telemetry";

const telemetryCommand: string = "applyXref";
const rootUrl: string = "https://xref.docs.microsoft.com";
const tags: string = "/dotnet";
const RE_XREF = /<xref:([A-Za-z_.\-\*\(\)\,\%0-9\`}{\[\]]+)?(\?)?(d)?(isplayProperty)?(=)?(fullName|nameWithType)?(>)?/g

export function xrefCompletionItemsMarkdown() {
  return [new CompletionItem("<xref:>")];
}
export async function xrefTagsCompletionItemsMarkdown(editor: any) {
  let completionItems: CompletionItem[] = [];
  let uid = "A"
  if (editor) {
    let position = new Position(editor.selection.active.line, editor.selection.active.character)
    let wordRange = editor.document.getWordRangeAtPosition(position, RE_XREF)
    const xref = editor.document.getText(wordRange);
    let captureGroup = RE_XREF.exec(xref);
    if (captureGroup && captureGroup[1]) {
      uid = captureGroup[1].trim();
    }
    let content = await getAsync(`${rootUrl}/autocomplete?tags=${tags}&text=${uid}`)
    content.data.map((item: { tags: any; uid: string; }) => {
      completionItems.push(new CompletionItem(encodeSpecialCharacters(item.uid)))
    });
  }

  return completionItems;
}

export function xrefDisplayPropertyCompletionItemsMarkdown(editor: any) {
  const completionItems: CompletionItem[] = [];
  completionItems.push(new CompletionItem("displayProperty=nameWithType"));
  completionItems.push(new CompletionItem("displayProperty=fullName"));
  return completionItems;
}

export function xrefDisplayPropsCompletionItemsMarkdown(editor: any) {
  const completionItems: CompletionItem[] = [];
  completionItems.push(new CompletionItem("nameWithType"));
  completionItems.push(new CompletionItem("fullName"));
  return completionItems;
}

export function isCursorInsideXref(editor: any) {
  const range = new Range(editor.selection.start.line, 0, editor.selection.end.line, editor.selection.active.character);
  const cursorText = editor.document.getText(range);
  const isCursorInsideXref = cursorText.indexOf("<xref:") > -1
  return isCursorInsideXref;
}

export function isCursorAfterXrefDisplayProperty(editor: any) {
  let position = new Position(editor.selection.active.line, editor.selection.active.character)
  let wordRange = editor.document.getWordRangeAtPosition(position, RE_XREF)
  if (wordRange) {
    const xref = editor.document.getText(wordRange);
    let captureGroup = RE_XREF.exec(xref);
    if (captureGroup && (captureGroup[5])) {
      return true;
    }
  }
  return false;
}

export function isCursorAfterXrefUid(editor: any) {
  let position = new Position(editor.selection.active.line, editor.selection.active.character)
  let wordRange = editor.document.getWordRangeAtPosition(position, RE_XREF)
  if (wordRange) {
    const xref = editor.document.getText(wordRange);
    let captureGroup = RE_XREF.exec(xref);
    if (captureGroup && (captureGroup[2] || captureGroup[3] || captureGroup[4])) {
      return true;
    }
  }
  return false;
}

export function isCursorStartAngleBracketsXref(editor: any) {
  const range = new Range(editor.selection.start.line, 0, editor.selection.end.line, editor.selection.active.character);
  const cursorText = editor.document.getText(range);
  const isCursorStartXref = cursorText.indexOf("<xref") > -1;
  if (!isCursorStartXref) {
    return cursorText.indexOf("<") > -1
  }
  return isCursorStartXref
}

export function applyXrefCommand() {
  const commands = [
    { command: applyXref.name, callback: applyXref },
  ];
  return commands;
}

export async function applyXref() {
  reporter.sendTelemetryEvent(`${telemetryCommand}`);
  let editor = window.activeTextEditor;
  if (!editor) {
    noActiveEditorMessage();
    return;
  } else {
    if (!isMarkdownFileCheck(editor, false)) {
      return;
    }
  }
  let xref = "";
  const selection = editor.selection;
  const selectedText = editor.document.getText(selection);
  // if theres no selected text, add xref syntax as <xref:...>
  let xrefSelection = await getXrefSelection()
  if (xrefSelection) {
    if (selectedText === "") {
      let displayProperty = await getXrefDisplayProperty();
      if (displayProperty && displayProperty.label != "none") {
        xrefSelection.label = `${xrefSelection.label}?displayProperty=${displayProperty.label}`;
      }
      xref = `<xref:${encodeSpecialCharacters(xrefSelection.label)}>`
    } else {
      xref = `[${selectedText}](xref:${xrefSelection.label})`
    }
  }
  insertContentToEditor(editor, applyXref.name, xref, true);
  // Gets the cursor position
  const position = editor.selection.active;
  const positionCharacter = applyXref.name === "applyXref" ? position.character + xref.length : position.character + 1;
  // Makes the cursor position in between syntaxs
  setCursorPosition(editor, position.line, positionCharacter);
  sendTelemetryData(telemetryCommand, "");
}

function encodeSpecialCharacters(content: string) {
  content = content.replace(/\*/g, "%2A")
  content = content.replace(/#/g, "%23")
  content = content.replace(/`/g, "%60")
  return content;
}

async function getXrefDisplayProperty() {
  const items: QuickPickItem[] = [];
  items.push({
    description: "None (default)",
    label: "none",
  });
  items.push({
    description: "Name with Type",
    label: "nameWithType",
  });
  items.push({
    description: "Full Name",
    label: "fullName",
  });
  return window.showQuickPick(items, { placeHolder: "Select Display Property" }).then((selection) => {
    if (!selection) {
      return;
    }
    return selection;
  });
}

async function getXrefSelection() {
  const items: QuickPickItem[] = [];
  let uid: string | undefined = await window.showInputBox({ placeHolder: "Enter XREF Search Term" });
  if (uid) {
    let content = await getAsync(`${rootUrl}/autocomplete?tags=${tags}&text=${uid}`);
    content.data.map((item: { tags: any; uid: string; }) => {
      items.push({
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
