import * as assert from 'assert';
import * as chai from 'chai';
import * as os from 'os';
import * as spies from 'chai-spies';
import { resolve } from 'path';
import { commands, window } from 'vscode';
import * as metadataController from '../../../controllers/metadata-controller';
import * as common from '../../../helper/common';
import * as telemetry from '../../../helper/telemetry';
import { extendedSleepTime, loadDocumentAndGetItReady, sleep } from '../../test.common/common';

chai.use(spies);

import sinon = require('sinon');

const expect = chai.expect;

suite('Metadata Controller', () => {
	suiteSetup(() => {
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
	test('insertMetadataCommands', () => {
		const controllerCommands = [
			{
				command: metadataController.updateMetadataDate.name,
				callback: metadataController.updateMetadataDate
			},
			{
				command: metadataController.updateImplicitMetadataValues.name,
				callback: metadataController.updateImplicitMetadataValues
			}
		];
		expect(metadataController.insertMetadataCommands()).to.deep.equal(controllerCommands);
	});
	test('updateImplicitMetadataValues().noActiveEditorMessage()', async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		metadataController.updateImplicitMetadataValues();
		expect(spy).to.have.been.called();
	});
	test('updateImplicitMetadataValues().isMarkdownFileCheck()', async () => {
		// pass in a non-markdown file
		const filePath = resolve(__dirname, '../../../../../src/test/data/repo/docfx.json');
		await loadDocumentAndGetItReady(filePath);

		const spy = chai.spy.on(common, 'isMarkdownFileCheck');
		await metadataController.updateImplicitMetadataValues();
		expect(spy).to.have.been.called();
	});
	test('updateImplicitMetadataValues()', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/test/metadata.md'
		);
		await loadDocumentAndGetItReady(filePath);

		const expectedText =
			'---' +
			os.EOL +
			'author: bar' +
			os.EOL +
			'manager: bar' +
			os.EOL +
			'titleSuffix: bar' +
			os.EOL +
			'ms.author: bar' +
			os.EOL +
			'ms.date: ' +
			common.toShortDate(new Date()) +
			os.EOL +
			'ms.service: bar' +
			os.EOL +
			'ms.subservice: bar' +
			os.EOL +
			'---' +
			os.EOL;

		await metadataController.updateImplicitMetadataValues();
		const actualText = window.activeTextEditor?.document.getText();

		// cleanup the modified metadata.md to prevent false positives for future tests.
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { exec } = require('child_process');
		exec('cd ' + __dirname + ' && git checkout ' + filePath);
		assert.equal(expectedText, actualText);
	});
	test('updateMetadataDate().noActiveEditorMessage()', async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		metadataController.updateMetadataDate();
		expect(spy).to.have.been.called();
	});
	test('updateMetadataDate().isMarkdownFileCheck()', async () => {
		// pass in a non-markdown file
		const filePath = resolve(__dirname, '../../../../../src/test/data/repo/docfx.json');
		await loadDocumentAndGetItReady(filePath);

		const spy = chai.spy.on(common, 'isMarkdownFileCheck');
		await metadataController.updateMetadataDate();
		expect(spy).to.have.been.called();
	});
	test('updateMetadataDate()', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/test/metadata1.md'
		);
		await loadDocumentAndGetItReady(filePath);

		const expectedText =
			'---' + os.EOL + 'ms.date: ' + common.toShortDate(new Date()) + os.EOL + '---' + os.EOL;

		await metadataController.updateMetadataDate();
		await sleep(500);
		const actualText = window.activeTextEditor?.document.getText();

		// cleanup the modified metadata.md to prevent false positives for future tests.
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { exec } = require('child_process');
		exec('cd ' + __dirname + ' && git checkout ' + filePath);
		assert.equal(expectedText, actualText);
	});
});
