import * as chai from 'chai';
import * as spies from 'chai-spies';
import { resolve } from 'path';
import { commands, window } from 'vscode';
import {
	automaticList,
	insertBulletedList,
	insertListsCommands,
	insertNestedList,
	insertNumberedList,
	removeNestedList
} from '../../../controllers/list-controller';
import * as common from '../../../helper/common';
import * as list from '../../../helper/list';
import * as telemetry from '../../../helper/telemetry';
import { loadDocumentAndGetItReady, sleep } from '../../test.common/common';

chai.use(spies);

// tslint:disable-next-line: no-var-requires
const sinon = require('sinon');

const expect = chai.expect;

suite('List Controller', () => {
	// Reset and tear down the spies
	teardown(() => {
		chai.spy.restore(common);
	});
	suiteTeardown(async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
	});

	test('insertListsCommands', () => {
		const controllerCommands = [
			{ command: automaticList.name, callback: automaticList },
			{ command: insertBulletedList.name, callback: insertBulletedList },
			{ command: insertNestedList.name, callback: insertNestedList },
			{ command: insertNumberedList.name, callback: insertNumberedList },
			{ command: removeNestedList.name, callback: removeNestedList }
		];
		expect(insertListsCommands()).to.deep.equal(controllerCommands);
	});
	test('noActiveEditorMessage', () => {
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		insertNumberedList();
		expect(spy).to.have.been.called();
	});
	test('isMarkdownFileCheck', async () => {
		const filePath = resolve(__dirname, '../../../../../src/test/data/repo/articles/list.md');
		await loadDocumentAndGetItReady(filePath);
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		const spy = chai.spy.on(common, 'isMarkdownFileCheck');
		insertNumberedList();
		await sleep(100);
		expect(spy).to.have.been.called();
		stub.restore();
	});
	test('checkEmptyLine', async () => {
		const editor = window.activeTextEditor;
		common.setCursorPosition(editor!, 28, 0);
		await sleep(100);
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		const spy = chai.spy.on(list, 'checkEmptyLine');
		insertNumberedList();
		await sleep(100);
		expect(spy).to.have.been.called();
		stub.restore();
	});
	test('checkEmptySelection', async () => {
		const editor = window.activeTextEditor;
		common.setCursorPosition(editor!, 29, 3);
		await sleep(100);
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		const spy = chai.spy.on(list, 'checkEmptySelection');
		insertNumberedList();
		await sleep(100);
		expect(spy).to.have.been.called();
		stub.restore();
	});
	test('insertList', async () => {
		const editor = window.activeTextEditor;
		common.setCursorPosition(editor!, 27, 0);
		await sleep(100);
		window.showQuickPick = (items: string[] | Thenable<string[]>) => {
			return Promise.resolve('Numbered list') as Thenable<any>;
		};
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		const spy = chai.spy.on(list, 'insertList');
		insertNumberedList();
		await sleep(100);
		expect(spy).to.have.been.called();
		stub.restore();
	});
	test('createNumberedListFromText', async () => {
		const editor = window.activeTextEditor;
		common.setSelectorPosition(editor!, 14, 0, 16, 19);
		await sleep(100);
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		const spy = chai.spy.on(list, 'createNumberedListFromText');
		insertNumberedList();
		await sleep(100);
		expect(spy).to.have.been.called();
		stub.restore();
	});
	test('createBulletedListFromText', async () => {
		const editor = window.activeTextEditor;
		common.setSelectorPosition(editor!, 18, 0, 20, 19);
		window.showQuickPick = (items: string[] | Thenable<string[]>) => {
			return Promise.resolve('Bulleted list') as Thenable<any>;
		};
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		const spy = chai.spy.on(list, 'createBulletedListFromText');
		insertBulletedList();
		await sleep(100);
		expect(spy).to.have.been.called();
		stub.restore();
	});
	test('insertContentToEditor', async () => {
		const spy = chai.spy.on(common, 'insertContentToEditor');
		automaticList();
		await sleep(100);
		expect(spy).to.have.been.called();
	});
	test('insertContentToEditor - nested list', async () => {
		const spy = chai.spy.on(common, 'insertContentToEditor');
		const editor = window.activeTextEditor;
		common.setSelectorPosition(editor!, 22, 0, 25, 21);
		insertNestedList();
		await sleep(100);
		expect(spy).to.have.been.called();
	});
	test('removeNestedListMultipleLine', async () => {
		const spy = chai.spy.on(list, 'removeNestedListMultipleLine');
		removeNestedList();
		await sleep(100);
		expect(spy).to.have.been.called();
	});
	test('removeNestedListSingleLine', async () => {
		const spy = chai.spy.on(list, 'removeNestedListSingleLine');
		removeNestedList();
		await sleep(100);
		expect(spy).to.have.been.called();
	});
});
