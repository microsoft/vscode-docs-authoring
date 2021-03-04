import * as chai from 'chai';
import * as spies from 'chai-spies';
import { commands } from 'vscode';
import {
	applyTemplate,
	applyTemplateCommand,
	downloadTemplateZip,
	unzipTemplates
} from '../../../controllers/template-controller';
import * as templateController from '../../../controllers/template-controller';
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
	test('Download template zip file', async () => {
		const spy = chai.spy.on(templateController, 'downloadTemplateZip');
		downloadTemplateZip();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
	});
	test('Unzip downloaded repo zip', async () => {
		const spy = chai.spy.on(templateController, 'unzipTemplates');
		unzipTemplates();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
	});
});
