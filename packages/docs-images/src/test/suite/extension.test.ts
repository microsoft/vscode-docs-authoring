import { activate } from '../../extension';
import { resolve } from 'path';
import { ExtensionContext, Uri, commands } from 'vscode';
import chai from 'chai';
import spies from 'chai-spies';
chai.use(spies);

const expect = chai.expect;

interface Subscription {
	dispose(): any;
}
interface EnvironmentalMutator {
	type: any;
	value: any;
}
const uri = resolve(__dirname, '../../../../../src/test/data/repo/articles/docs-images.md');
let environmentalMutator: EnvironmentalMutator;
const subscriptions: Subscription[] = [
	{
		dispose: () => {}
	}
];
const context: ExtensionContext = {
	globalState: {
		get: (key: any) => {},
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
		replace: (variable: any, value: any) => {},
		append: (variable: any, value: any) => {},
		prepend: (variable: any, value: any) => {},
		get: (variable: any) => environmentalMutator,
		forEach: () => {},
		clear: () => {},
		delete: () => {}
	},
	extensionMode: 1
};
suite('Extension Tests', function () {
	// Defines a Mocha unit test
	test('registerCommand called', function () {
		const spy = chai.spy.on(commands, 'registerCommand');
		activate(context);
		expect(spy).to.have.been.called();
	});
});
