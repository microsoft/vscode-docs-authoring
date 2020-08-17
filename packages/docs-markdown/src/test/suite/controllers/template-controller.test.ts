/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { resolve } from 'path';
import { commands, window } from 'vscode';
import { applyTemplate, applyTemplateCommand } from '../../../controllers/template-controller';
import * as common from '../../../helper/common';
import * as telemetry from '../../../helper/telemetry';
import { loadDocumentAndGetItReady, sleep, sleepTime } from '../../test.common/common';

chai.use(spies);
import sinon = require('sinon');
const expect = chai.expect;

const testFile = '../../../../../src/test/data/repo/articles/template-controller.md';

suite('Template Controller', () => {
	// Reset and tear down the spies
	suiteSetup(async () => {
		sinon.stub(telemetry, 'sendTelemetryData');
	});
	teardown(() => {
		chai.spy.restore(common);
	});
	suiteTeardown(async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
		sinon.restore();
	});
	test('applyTemplateCommand', () => {
		const controllerCommands = [{ command: applyTemplate.name, callback: applyTemplate }];
		expect(applyTemplateCommand()).to.deep.equal(controllerCommands);
	});
	test('applyTemplate - generateTimestamp', async () => {
		const filePath = resolve(__dirname, testFile);
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves('docs-article-metadata.md');
		const spy = chai.spy.on(common, 'generateTimestamp');
		applyTemplate();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('applyTemplate - checkExtension', async () => {
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves('docs-article-metadata.md');
		const spy = chai.spy.on(common, 'checkExtension');
		applyTemplate();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('applyTemplate - executeCommand', async () => {
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves('docs-article-metadata.md');
		sinon.stub(common, 'checkExtension').returns(true);
		const spy = chai.spy.on(commands, 'executeCommand');
		applyTemplate();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
});
