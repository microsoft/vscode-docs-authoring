import * as chai from 'chai';
import * as spies from 'chai-spies';
import { resolve, basename, dirname } from 'path';
import { commands, window, InputBoxOptions } from 'vscode';
import * as common from '../../../helper/common';
import * as telemetry from '../../../helper/telemetry';
import { loadDocumentAndGetItReady, sleep, sleepTime } from '../../test.common/common';
import {
	yamlCommands,
	insertTocEntry,
	insertTocEntryWithOptions,
	insertExpandableParentNode
} from '../../../controllers/yaml/yaml-controller';
import * as checkForPreviousEntry from '../../../controllers/yaml/checkForPreviousEntry';
import * as createEntry from '../../../controllers/yaml/createEntry';
import * as createParentNode from '../../../controllers/yaml/createParentNode';
import { showTOCQuickPick } from '../../../controllers/yaml/showTOCQuickPick';

chai.use(spies);

import sinon = require('sinon');

const expect = chai.expect;

suite('Yaml Controller', () => {
	suiteSetup(async () => {
		sinon.stub(telemetry, 'sendTelemetryData');
	});
	// Reset and tear down the spies
	teardown(() => {
		chai.spy.restore(common);
	});
	suiteTeardown(async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
		sinon.restore();
	});
	test('yaml-controller - yamlCommands', () => {
		const controllerCommands = [
			{ command: insertTocEntry.name, callback: insertTocEntry },
			{
				command: insertTocEntryWithOptions.name,
				callback: insertTocEntryWithOptions
			},
			{
				command: insertExpandableParentNode.name,
				callback: insertExpandableParentNode
			}
		];
		expect(yamlCommands()).to.deep.equal(controllerCommands);
	});
	test('yaml-controller - insertTocEntry', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/yaml-controller.yml'
		);
		await loadDocumentAndGetItReady(filePath);
		const testFile = '../../../../../src/test/data/repo/articles/docs-markdown.md';
		const testFilePath = resolve(__dirname, testFile);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({
			label: `${basename(testFilePath)}`,
			description: `${dirname(testFilePath)}`
		});
		const stubShowInputBox = sinon.stub(window, 'showInputBox');
		stubShowInputBox.onCall(0).resolves('Docs Markdown Reference');

		const spy = chai.spy.on(checkForPreviousEntry, 'checkForPreviousEntry');
		await insertTocEntry();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
		stubShowInputBox.restore();
	});
	test('yaml-controller - insertTocEntryWithOptions', async () => {
		const testFile = '../../../../../src/test/data/repo/articles/docs-markdown.md';
		const testFilePath = resolve(__dirname, testFile);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({
			label: `${basename(testFilePath)}`,
			description: `${dirname(testFilePath)}`
		});
		const stubShowInputBox = sinon.stub(window, 'showInputBox');
		stubShowInputBox.onCall(0).resolves('Docs Markdown Reference');

		const spy = chai.spy.on(checkForPreviousEntry, 'checkForPreviousEntry');
		await insertTocEntryWithOptions();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
		stubShowInputBox.restore();
	});
	test('yaml-controller - insertTocEntryWithOptions', async () => {
		const testFile = '../../../../../src/test/data/repo/articles/docs-markdown.md';
		const testFilePath = resolve(__dirname, testFile);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({
			label: `${basename(testFilePath)}`,
			description: `${dirname(testFilePath)}`
		});
		const stubShowInputBox = sinon.stub(window, 'showInputBox');
		stubShowInputBox.onCall(0).resolves('Docs Markdown Reference');

		const spy = chai.spy.on(createParentNode, 'createParentNode');
		await insertExpandableParentNode();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
		stubShowInputBox.restore();
	});
	test('yaml-controller - showQuickPick', async () => {
		const testFile = '../../../../../src/test/data/repo/articles/docs-markdown.md';
		const testFilePath = resolve(__dirname, testFile);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({
			label: `${basename(testFilePath)}`,
			description: `${dirname(testFilePath)}`
		});
		const stubShowInputBox = sinon.stub(window, 'showInputBox');
		stubShowInputBox.onCall(0).resolves('Docs Markdown Reference');

		const spy = chai.spy.on(createEntry, 'createEntry');
		await showTOCQuickPick(true);
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
		stubShowInputBox.restore();
	});
});
