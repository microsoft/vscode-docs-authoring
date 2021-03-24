import * as chai from 'chai';
import * as spies from 'chai-spies';
import { resolve } from 'path';
import { commands, window } from 'vscode';
import {
	insertTable,
	insertTableCommand,
	consolidateTable,
	distributeTable,
	convertTableToDataMatrix
} from '../../../controllers/table-controller';
import * as common from '../../../helper/common';
import * as telemetry from '../../../helper/telemetry';
import {
	extendedSleepTime,
	loadDocumentAndGetItReady,
	sleep,
	sleepTime
} from '../../test.common/common';

chai.use(spies);

import sinon = require('sinon');

const expect = chai.expect;

suite.only('Table Controller', () => {
	// Reset and tear down the spies
	teardown(() => {
		chai.spy.restore(common);
	});
	suiteSetup(() => {
		sinon.stub(telemetry, 'sendTelemetryData');
	});
	suiteTeardown(async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
		sinon.restore();
	});

	test('insertTableCommand', () => {
		const controllerCommands = [
			{ command: consolidateTable.name, callback: consolidateTable },
			{ command: distributeTable.name, callback: distributeTable },
			{ command: insertTable.name, callback: insertTable },
			{ command: convertTableToDataMatrix.name, callback: convertTableToDataMatrix }
		];
		expect(insertTableCommand()).to.deep.equal(controllerCommands);
	});
	test('noActiveEditorMessage', () => {
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		insertTable();
		expect(spy).to.have.been.called();
	});
	test('isMarkdownFileCheck', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);

		const spy = chai.spy.on(common, 'isMarkdownFileCheck');
		insertTable();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
	});
	test('insertContentToEditor', async () => {
		const stubShowInputBox = sinon.stub(window, 'showInputBox');
		stubShowInputBox.resolves('1:1');
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/table-controller.md'
		);
		await loadDocumentAndGetItReady(filePath);

		const spy = chai.spy.on(common, 'insertContentToEditor');
		insertTable();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowInputBox.restore();
	});
	test('distributeTable', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/table-controller2.md'
		);
		await loadDocumentAndGetItReady(filePath);

		const editor = window.activeTextEditor;
		common.setSelectorPosition(editor, 0, 0, 3, 0);
		await distributeTable();
		await sleep(extendedSleepTime);
		const expectedValue = '| Column1 |\r\n' + '|---------|\r\n' + '| Row1    |\r\n';
		const actualValue = editor.document.getText();
		expect(expectedValue).to.equal(actualValue);
	});
	test('consolidateTable', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/table-controller3.md'
		);
		await loadDocumentAndGetItReady(filePath);

		const editor = window.activeTextEditor;
		common.setSelectorPosition(editor, 0, 0, 3, 0);
		await consolidateTable();
		await sleep(sleepTime);
		const expectedValue = '| Column1 |\r\n' + '|--|\r\n' + '| Row1 |\r\n';
		const actualValue = editor.document.getText();
		expect(expectedValue).to.equal(actualValue);
	});
	test('convertTableToDataMatrix', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/table-controller4.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		common.setSelectorPosition(editor, 0, 0, 3, 0);
		await convertTableToDataMatrix();
		await sleep(sleepTime);
		const expectedValue = '||\r\n' + '|---------|\r\n' + '| **Row1** |';
		const actualValue = editor.document.getText();
		expect(expectedValue).to.equal(actualValue);
	});
});
