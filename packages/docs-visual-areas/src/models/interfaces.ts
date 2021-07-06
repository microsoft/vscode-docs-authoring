import * as vscode from 'vscode';
import { Switchers } from './enums';

export interface LabelInfo {
  line: number;
  text: string;
}

export interface AreaDecoration {
  decorationOptions: vscode.DecorationOptions;
  decorationType: vscode.TextEditorDecorationType;
  color: string;
  isEnd: boolean;
}

export type DecoratorFunction = (
  activeTextEditor: vscode.TextEditor,
  match: RegExpExecArray,
  previousDecoration?: AreaDecoration,
) => AreaDecoration;

export interface AreaPattern {
  regex: RegExp;
  name: Switchers;
  getDecorations?: DecoratorFunction;
}
