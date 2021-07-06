import * as vscode from 'vscode';
import { visualAreasSection, AllSettings } from '../models';

export function getGutterIndicatorHeight() {
  return readConfiguration<number>(AllSettings.gutterIndicatorHeight);
}

export function getGutterIndicatorOffset() {
  return readConfiguration<number>(AllSettings.gutterIndicatorOffset);
}

export function getGutterIndicatorOpacity() {
  const percentage = readConfiguration<number>(AllSettings.gutterIndicatorOpacity);
  let hex = Math.floor((percentage * 255) / 100).toString(16);

  if (hex.length === 1) {
    hex = `0${hex}`;
  }

  return hex;
}

export function getGutterIndicatorWidth() {
  return readConfiguration<number>(AllSettings.gutterIndicatorWidth);
}

export function readConfiguration<T>(setting: AllSettings, defaultValue?: T | undefined) {
  const value: T | undefined = vscode.workspace
    .getConfiguration(visualAreasSection)
    .get<T | undefined>(setting, defaultValue);
  return value as T;
}
