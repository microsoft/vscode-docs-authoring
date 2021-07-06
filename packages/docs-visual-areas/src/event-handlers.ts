import * as vscode from 'vscode';
import { triggerUpdateDecorations } from './decorations';
import { State } from './models';
import { updateStatusBarItem } from './statusbar';

export function addEventHandlers() {
  const { extensionContext: context } = State;
  let { activeTextEditor } = vscode.window;

  vscode.window.onDidChangeActiveTextEditor(
    editor => {
      activeTextEditor = editor;
      if (editor) {
        triggerUpdateDecorations();
        updateStatusBarItem();
      }
    },
    null,
    context.subscriptions,
  );

  vscode.workspace.onDidChangeTextDocument(
    event => {
      if (activeTextEditor && event.document === activeTextEditor.document) {
        triggerUpdateDecorations();
      }
    },
    null,
    context.subscriptions,
  );

  vscode.window.onDidChangeTextEditorSelection(
    event => {
      updateStatusBarItem();
    },
    null,
    context.subscriptions,
  );
}
