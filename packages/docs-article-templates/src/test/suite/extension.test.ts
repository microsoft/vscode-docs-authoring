import { activate, deactivate } from '../../extension';
import { resolve } from 'path';
import { ExtensionContext, Uri, commands, ExtensionMode, ExtensionKind } from 'vscode';
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { sleep, sleepTime } from '../test.common/common';

chai.use(spies);
import sinon = require('sinon');

const expect = chai.expect;
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
let emptySecret: any;
let environmentalMutator: EnvironmentalMutator;
const subscriptions: Subscription[] = [];
const extensionMode: ExtensionMode = 1;
const context: ExtensionContext = {
	globalState: {
		get: key => {},
		update: (key, value) => Promise.resolve(),
		keys: () => [],
		setKeysForSync(keys: string[]): void {}
	},
	subscriptions,
	workspaceState: {
		get: () => {},
		keys: () => [],
		update: (key, value) => Promise.resolve()
	},
	extensionPath: '',
	asAbsolutePath: relative => resolve(__dirname, '../../../../package.json'),
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
	extensionMode,
	globalStorageUri: Uri.parse('https://github.com/microsoft/vscode-docs-authoring'),
	logUri: Uri.parse('https://github.com/microsoft/vscode-docs-authoring'),
	storageUri: Uri.parse('https://github.com/microsoft/vscode-docs-authoring'),
	secrets: {
		store: (key, value) => Promise.resolve(),
		get: async key => '',
		delete: key => Promise.resolve(),
		onDidChange: emptySecret
	},
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

suite('Extension Tests', function () {
	test('registerCommand is called', function () {
		const spy = chai.spy.on(commands, 'registerCommand');
		activate(context);
		expect(spy).to.have.been.called();
	});
	test('deactivate', () => {
		const spy = chai.spy(deactivate);
		deactivate();
		sleep(sleepTime);
		expect(spy).to.be.have.been.called;
	});
});
