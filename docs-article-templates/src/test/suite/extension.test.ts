import { activate } from '../../extension';
import { resolve } from 'path';
import { ExtensionContext, Uri, commands, Disposable } from 'vscode';
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { Reporter, PackageInfo } from '../../helper/telemetry';

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
let environmentalMutator: EnvironmentalMutator;
const subscriptions: Subscription[] = [];
const context: ExtensionContext = {
	globalState: {
		get: key => {},
		update: (key, value) => Promise.resolve()
	},
	subscriptions,
	workspaceState: {
		get: () => {},
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
	}
};
suite('Extension Tests', function () {
	// Defines a Mocha unit test
	test('registerCommand is called', function () {
		const spy = chai.spy.on(commands, 'registerCommand');
		activate(context);
		expect(spy).to.have.been.called();
	});
});
