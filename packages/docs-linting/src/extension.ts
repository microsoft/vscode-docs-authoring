'use strict';

/* The module 'vscode' contains the VS Code extensibility API
 The LoadToolbar function will populate items in the toolbar, but only when the extension loads the first time.
 The common file provides functions that are useful across all commands.
 Logging, Error Handling, VS Code window updates, etc.
*/

import { ExtensionContext } from 'vscode';
import {
	addFrontMatterTitle,
	checkMarkdownlintCustomProperty,
	removeBlankLineInsideBlockQuote
} from './controllers/lint-config-controller';
import { generateTimestamp, output } from './helper/common';

export let extensionPath: string;

/**
 * Provides the commands to the extension. This method is called when extension is activated.
 * Extension is activated the very first time the command is executed.
 * preview commands -
 * formatting commands -
 *
 * param {vscode.ExtensionContext} the context the extension runs in, provided by vscode on activation of the extension.
 */
export function activate(context: ExtensionContext) {
	extensionPath = context.extensionPath;
	const { msTimeValue } = generateTimestamp();
	output.appendLine(`[${msTimeValue}] - Activating docs linting extension.`);
	// Markdownlint custom rule check
	checkMarkdownlintCustomProperty();

	// Update markdownlint.config to fix MD025 issue
	addFrontMatterTitle();

	// Update markdownlint.config to remove MD028 rule
	removeBlankLineInsideBlockQuote();
}

// this method is called when your extension is deactivated
export function deactivate() {
	output.appendLine('Deactivating docs-linting extension.');
}
