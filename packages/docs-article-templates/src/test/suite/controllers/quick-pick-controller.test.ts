/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { resolve } from 'path';
import {
	commands,
	QuickPickItem,
	window,
	workspace,
	ExtensionContext,
	Uri,
	ExtensionMode,
	ExtensionKind
} from 'vscode';
import { loadDocumentAndGetItReady, sleep, sleepTime } from '../../test.common/common';
import { applyDocsTemplate } from '../../../controllers/quick-pick-controller';
import * as quickPickController from '../../../controllers/quick-pick-controller';
import sinon = require('sinon');

chai.use(spies);
const expect = chai.expect;
let emptySecret: any;

interface Subscription {
	dispose(): any;
}
interface EnvironmentalMutator {
	type: any;
	value: any;
}
const uri = resolve(
	__dirname,
	'../../../../../src/test/data/repo/articles/docs-article-templates.md'
);
let environmentalMutator: EnvironmentalMutator;
let subscriptions: Subscription[];
const context: ExtensionContext = {
	globalState: {
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
		exports: '',
		extensionKind: ExtensionKind.Workspace,
		extensionPath: '',
		extensionUri: Uri.parse('https://github.com/microsoft/vscode-docs-authoring'),
		id: '',
		isActive: true,
		packageJSON: '',
		activate: () => Promise.resolve()
	}
};

suite('Quick Pick Menu Controller', () => {
	suiteSetup(() => {
		sinon.stub(workspace, 'getConfiguration').returns({
			get: () => true,
			has: () => true,
			inspect: () => {
				return { key: '' };
			},
			update: () => Promise.resolve()
		});
	});
	suiteTeardown(async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
		sinon.restore();
	});
	test('Template quickpick', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-article-templates.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item: QuickPickItem = {
			description: '',
			label: 'Markdown article with standard metadata'
		};
		stubShowQuickPick.onCall(0).resolves(item);
		const spy = chai.spy.on(quickPickController, 'applyDocsTemplate');
		applyDocsTemplate(filePath);
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
});
