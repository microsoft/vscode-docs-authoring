import { resolve } from 'path';
import { commands, Uri, window, workspace, ExtensionContext } from 'vscode';
import { TokenResponse } from '../../helper/Auth';

export const sleepTime = 50;
export const extendedSleepTime = 300;
export const longSleepTime = 30000;

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

export const tokenResponse: TokenResponse = {
	_authority: '',
	accessToken: '',
	_clientId: '',
	expiresIn: 0,
	expiresOn: new Date(),
	isMRRT: false,
	resource: '',
	tokenType: ''
};

interface Subscription {
	dispose(): any;
}
interface EnvironmentalMutator {
	type: any;
	value: any;
}
const uri = resolve(__dirname, '../../../../../src/test/data/repo/articles/common.md');
let environmentalMutator: EnvironmentalMutator;
let subscriptions: Subscription[];

export const context: ExtensionContext = {
	globalState: {
		get: key => undefined,
		update: (key, value) => Promise.resolve()
	},
	subscriptions,
	workspaceState: {
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
	}
};
