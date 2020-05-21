'use strict';
import { ExtensionContext, languages, window } from 'vscode';
import { Reporter } from './helper/telemetry';
import {
	registerYamlSchemaSupport,
	loadSchemaConfig,
	addTocSchemaToConfig
} from './yaml-support/yaml-schema';
import { DocsYamlCompletionProvider } from './yaml-support/yaml-snippet';
import { output } from './helper/common';

export let extensionPath: string;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: ExtensionContext) {
	extensionPath = context.extensionPath;
	context.subscriptions.push(new Reporter(context));
	const subscriptions = [
		// Completion providers
		languages.registerCompletionItemProvider('yaml', new DocsYamlCompletionProvider())
	];
	await loadSchemaConfig();
	await addTocSchemaToConfig();
	await registerYamlSchemaSupport();
	subscriptions.forEach(element => {
		context.subscriptions.push(element);
	}, this);
}

// this method is called when your extension is deactivated
export function deactivate() {
	output.appendLine('Deactivating');
}
