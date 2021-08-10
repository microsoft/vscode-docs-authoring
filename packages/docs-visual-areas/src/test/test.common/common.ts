import { resolve } from 'path';
import {
	commands,
	Uri,
	window,
	workspace,
	ExtensionContext,
	ExtensionMode,
	ExtensionKind
} from 'vscode';

export const sleepTime = 50;
export const extendedSleepTime = 300;
export const longSleepTime = 3000;

export function sleep(ms: number): Promise<void> {
	return new Promise(r => {
		setTimeout(r, ms);
	});
}

export async function loadDocumentAndGetItReady(filePath: string) {
	const docUri = Uri.file(filePath);
	const document = await workspace.openTextDocument(docUri);
	await window.showTextDocument(document);
}

export async function openTestRepository() {
	const filePath = resolve(__dirname, '../../../../src/test/data/repo');
	const repoUri = Uri.file(filePath);
	await commands.executeCommand('vscode.openFolder', repoUri);
}

export async function createDocumentAndGetItReady() {
	await commands.executeCommand('workbench.action.files.newUntitledFile');
}

interface Subscription {
	dispose(): any;
}
interface EnvironmentalMutator {
	type: any;
	value: any;
}
const uri = resolve(__dirname, '../../../../../src/test/data/repo/articles/common.md');
let environmentalMutator: EnvironmentalMutator;
const subscriptions: Subscription[] = [];
let emptySecret: any;

export const context: ExtensionContext = {
	globalState: {
		keys: () => [],
		get: key => {},
		update: (key, value) => Promise.resolve(),
		setKeysForSync(keys: string[]): void {}
	},
	secrets: {
		store: (key, value) => Promise.resolve(),
		get: async key => '',
		delete: key => Promise.resolve(),
		onDidChange: emptySecret
	},
	subscriptions,
	workspaceState: {
		keys: () => [],
		get: () => {},
		update: (key, value) => Promise.resolve()
	},
	extensionPath: '',
	asAbsolutePath: relative => '',
	storagePath: '',
	globalStoragePath: '',
	logPath: '',
	extensionUri: Uri.parse(uri),
	environmentVariableCollection: {
		persistent: false,
		replace: (variable, value) => {},
		append: (variable, value) => {},
		prepend: (variable, value) => {},
		get: variable => environmentalMutator,
		forEach: () => {},
		clear: () => {},
		delete: () => {}
	},
	extensionMode: ExtensionMode.Test,
	globalStorageUri: Uri.parse('https://github.com/microsoft/vscode-docs-authoring'),
	logUri: Uri.parse('https://github.com/microsoft/vscode-docs-authoring'),
	storageUri: Uri.parse('https://github.com/microsoft/vscode-docs-authoring'),
	extension: {
		id: '',
		extensionUri: Uri.parse(uri),
		extensionKind: ExtensionKind.UI,
		exports: '',
		extensionPath: '',
		isActive: false,
		packageJSON: '',
		activate: () => Promise.resolve()
	}
};
