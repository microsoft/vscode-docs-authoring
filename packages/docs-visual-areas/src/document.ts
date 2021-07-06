import * as vscode from 'vscode';
import { fileTypes } from './models';

export function isValidFile() {
  let isValid = false;
  const document = vscode.window.activeTextEditor?.document;
  isValid = !!(document && fileTypes.includes(document.languageId));
  return isValid;
}
