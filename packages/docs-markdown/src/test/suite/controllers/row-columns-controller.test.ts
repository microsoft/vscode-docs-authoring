/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { resolve } from 'path';
import { commands, window } from 'vscode';
import {
	insertRowsAndColumns,
	insertRowsAndColumnsCommand
} from '../../../controllers/row-columns-controller';
import * as helper from '../../../helper/rows-columns';
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

const testFile = '../../../../../src/test/data/repo/articles/row-columns-controller.md';

suite('Row columns Controller', () => {
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
	test('insertRowsAndColumnsCommand', () => {
		const controllerCommands = [
			{ command: insertRowsAndColumns.name, callback: insertRowsAndColumns }
		];
		expect(insertRowsAndColumnsCommand()).to.deep.equal(controllerCommands);
	});
	test('noActiveEditorMessage', async () => {
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		insertRowsAndColumns();
		expect(spy).to.have.been.called();
	});
	test('isMarkdownFileCheck', async () => {
		const filePath = resolve(__dirname, testFile);
		await loadDocumentAndGetItReady(filePath);
		const spy = chai.spy.on(common, 'isMarkdownFileCheck');
		insertRowsAndColumns();
		await sleep(extendedSleepTime);
		expect(spy).to.have.been.called();
	});
	test('insertRowsWithColumns', async () => {
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves('Two-column structure');
		const spy = chai.spy.on(helper, 'createRow');
		insertRowsAndColumns();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('insertNewColumn', async () => {
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves('New column');
		const spy = chai.spy.on(helper, 'addNewColumn');
		insertRowsAndColumns();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('insertNewColumnWithSpan', async () => {
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves('New column with span');
		const spy = chai.spy.on(helper, 'addNewColumnWithSpan');
		insertRowsAndColumns();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
});
