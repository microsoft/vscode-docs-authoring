import * as vscode from 'vscode';
import { isValidFile } from './document';
import { patterns, LabelInfo, Switchers } from './models';

const myStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);

/**
 * @description Update StatusBarItem with name of active tab, otherwise hide.
 * @returns
 */
export function updateStatusBarItem() {
  if (!isValidFile()) {
    clearStatusBarItem();
    return;
  }
  let statusText = '';

  clearStatusBarItem();

  const tabInfo = getTabInfo();
  statusText = applyStatusBar(tabInfo);
  if (statusText) {
    return;
  }

  const zoneInfo = getZoneInfo();
  statusText = applyStatusBar(zoneInfo);
}

function getTabInfo() {
  let matches = getMatchData(patterns.tabs.regex);
  let currentLine = getLineNumber(vscode.window.activeTextEditor);
  let label = Switchers.tabs;
  return { matches, currentLine, label };
}

function getZoneInfo() {
  let matches = getMatchData(patterns.zones.regex);
  let currentLine = getLineNumber(vscode.window.activeTextEditor);
  let label = Switchers.zones;
  return { matches, currentLine, label };
}

function applyStatusBar(statusInfo: { matches: LabelInfo[]; currentLine: number; label: string }) {
  let statusText: string = '';
  const { matches, currentLine, label } = statusInfo;

  for (let i = 0; i < matches.length - 1; i++) {
    if (matches[i].line <= currentLine && currentLine < matches[i + 1].line) {
      if (matches[i].text) {
        statusText = `$(milestone) ${label}: ${matches[i].text}`;
        myStatusBarItem.text = statusText;
        myStatusBarItem.show();
        break;
      }
    }
  }
  return statusText;
}

/**
 * @description Clear text and hide statusBarItem.
 * @returns
 */
function clearStatusBarItem() {
  myStatusBarItem.text = '';
  myStatusBarItem.hide();
}

/**
 * @description Get line number of active cursor position.
 * @param editor
 * @returns line number
 */
function getLineNumber(editor: vscode.TextEditor | undefined): number {
  let line = 0;
  if (editor) {
    line = editor.selection.active.line;
  }
  return line;
}

/**
 * @description Create an array of tabs or zones including the start line and text label.
 * @returns array of tabs or zones (LabelInfo[])
 */
function getMatchData(regEx: RegExp): Array<LabelInfo> {
  if (!vscode.window.activeTextEditor) {
    return [];
  }

  // regex returns the zone name in a capture group
  const text = vscode.window.activeTextEditor.document.getText();
  let matches: LabelInfo[] = [];
  let match: RegExpExecArray | null;

  // add each regex match to the zones array
  while ((match = regEx.exec(text))) {
    const { positionAt } = vscode.window.activeTextEditor.document;
    const startPos = positionAt(match.index);
    matches.push({ line: startPos.line, text: match[1] });
  }
  return matches;
}
