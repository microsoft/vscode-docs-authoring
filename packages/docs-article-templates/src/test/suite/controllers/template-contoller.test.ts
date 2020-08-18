import * as chai from 'chai';
import * as spies from 'chai-spies';
import { commands } from 'vscode';
import {
	applyTemplate,
	applyTemplateCommand,
	downloadRepo
} from '../../../controllers/template-controller';
import * as common from '../../../helper/common';
import { sleep, sleepTime } from '../../test.common/common';

chai.use(spies);
const expect = chai.expect;

suite('Template Controller', () => {
	// Reset and tear down the spies
	teardown(() => {
		chai.spy.restore(common);
	});
	suiteTeardown(async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
	});
	test('applyTemplateCommand', () => {
		const controllerCommands = [{ command: applyTemplate.name, callback: applyTemplate }];
		expect(applyTemplateCommand()).to.deep.equal(controllerCommands);
	});
});
