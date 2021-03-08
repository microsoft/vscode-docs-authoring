import { activate } from '../../extension';
import { resolve } from 'path';
import { ExtensionContext, Uri, commands, Disposable, ExtensionMode } from 'vscode';
import * as applyController from '../../controllers/apply-controller';
import * as extractController from '../../controllers/extract-controller';
import * as chai from 'chai';
import * as spies from 'chai-spies';
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
let emptySecret: any;
const uri = resolve(__dirname, '../../../../../src/test/data/repo/articles/docs-metadata.md');
let environmentalMutator: EnvironmentalMutator;
let subscriptions: Subscription[];
export const context: ExtensionContext = {
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
	storageUri: Uri.parse('https://github.com/microsoft/vscode-docs-authoring')
};
let disposable: Disposable;
suite('Extension Tests', function () {
	// Defines a Mocha unit test
	test('Apply and Extract called', function () {
		const spy = chai.spy.on(commands, 'registerCommand');
		activate(context);
		expect(spy).to.have.been.called();
	});
});
