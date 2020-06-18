import * as assert from 'assert';
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { resolve } from 'path';
import { commands, window } from 'vscode';
import {
	insertMetadataCommands,
	updateImplicitMetadataValues,
	updateMetadataDate
} from '../../../controllers/metadata-controller';
import * as common from '../../../helper/common';
import * as telemetry from '../../../helper/telemetry';
import { loadDocumentAndGetItReady } from '../../test.common/common';

chai.use(spies);

// tslint:disable-next-line: no-var-requires
import sinon = require('sinon');

const expect = chai.expect;

suite('Metadata Controller', () => {
	// Reset and tear down the spies
	teardown(() => {
		chai.spy.restore(common);
	});

	suiteTeardown(async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
		sinon.restore();
	});

	suiteSetup(() => {
		sinon.stub(telemetry, 'sendTelemetryData');
	});

	test('insertMetadataCommands', () => {
		const controllerCommands = [
			{ command: updateMetadataDate.name, callback: updateMetadataDate },
			{ command: updateImplicitMetadataValues.name, callback: updateImplicitMetadataValues }
		];
		expect(insertMetadataCommands()).to.deep.equal(controllerCommands);
	});

	test('noActiveEditorMessage', async () => {
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		await updateImplicitMetadataValues();
		expect(spy).to.have.been.called();
	});

	test('update author implicit', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/metadata/metadata-controller-author.md'
		);
		await loadDocumentAndGetItReady(filePath);
		await updateImplicitMetadataValues();

		const expectedText = '---\r\nauthor: lamebrain\r\n---\r\n';
		const editor = window.activeTextEditor;
		const actualText = editor?.document.getText();
		assert.equal(expectedText, actualText);
	});

	test('update date implicit', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/metadata/metadata-controller-date.md'
		);
		await loadDocumentAndGetItReady(filePath);
		await updateImplicitMetadataValues();

		const expectedText = `---\r\nms.date: ${common.toShortDate(new Date())}\r\n---\r\n`;
		const editor = window.activeTextEditor;
		const actualText = editor?.document.getText();
		assert.equal(expectedText, actualText);
	});
});
