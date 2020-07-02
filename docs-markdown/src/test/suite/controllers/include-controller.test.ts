import * as chai from 'chai';
import * as spies from 'chai-spies';
import * as glob from 'glob';
import * as os from 'os';
import { resolve, sep } from 'path';
import { commands, TextEditor, window, workspace } from 'vscode';
import { insertInclude, insertIncludeCommand } from '../../../controllers/include-controller';
import * as common from '../../../helper/common';
import * as telemetry from '../../../helper/telemetry';
import { extendedSleepTime, loadDocumentAndGetItReady, sleep } from '../../test.common/common';

chai.use(spies);
import sinon = require('sinon');
const expect = chai.expect;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const root = workspace.workspaceFolders![0].uri;
const testFile = '../../../../../src/test/data/repo/articles/includes.md';
const testFilePath = resolve(__dirname, testFile);
const qpSelectionItems = [
	{ description: root.fsPath + sep + 'includes', label: '1.md' },
	{ description: root.fsPath + sep + 'includes', label: '2.md' },
	{ description: root.fsPath + sep + 'includes', label: '3.md' }
];

suite('Include Controller', () => {
	suiteSetup(() => {
		sinon.stub(telemetry, 'sendTelemetryData');
	});
	// Reset and tear down the spies
	teardown(() => {
		chai.spy.restore(common);
		chai.spy.restore(window);
	});
	suiteTeardown(async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
		sinon.restore();
	});
	test('insertIncludeCommand', () => {
		const controllerCommands = [{ command: insertInclude.name, callback: insertInclude }];
		expect(insertIncludeCommand()).to.deep.equal(controllerCommands);
	});
	test('insertInclude - noActiveEditorMessage', async () => {
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		await insertInclude();
		expect(spy).to.have.been.called();
	});
	test('insertInclude - isMarkdownFileCheck', async () => {
		const spy = chai.spy.on(common, 'isMarkdownFileCheck');
		const stub = sinon.stub(glob, 'Glob');
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves('');
		await loadDocumentAndGetItReady(testFilePath);
		await insertInclude();
		expect(spy).to.have.been.called();
		stub.restore();
		stubShowQuickPick.restore();
	});
	test('insertInclude - hasValidWorkSpaceRootPath', async () => {
		const spy = chai.spy.on(common, 'hasValidWorkSpaceRootPath');
		const stub = sinon.stub(glob, 'glob');
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves('');
		await loadDocumentAndGetItReady(testFilePath);
		await insertInclude();
		expect(spy).to.have.been.called();
		stub.restore();
		stubShowQuickPick.restore();
	});
	test('Window NT - insertInclude', async () => {
		const stub = sinon.stub(os, 'type').callsFake(() => 'Windows_NT');
		const markdown = qpSelectionItems[0].description + sep + qpSelectionItems[0].label;
		await loadDocumentAndGetItReady(markdown);
		let editor = window.activeTextEditor;
		const originalText = editor?.document.getText();
		const expectedText = '[!INCLUDE [1](1.md)]' + originalText;
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves(qpSelectionItems[0]);

		await insertInclude();
		await sleep(extendedSleepTime);
		editor = window.activeTextEditor;
		const actualText = editor?.document.getText();
		expect(actualText).to.equal(expectedText);
		stub.restore();
		stubShowQuickPick.restore();
	});
	test('Darwin - insertInclude', async () => {
		const stub = sinon.stub(os, 'type').callsFake(() => 'Darwin');
		const markdown = qpSelectionItems[0].description + sep + qpSelectionItems[0].label;
		await loadDocumentAndGetItReady(markdown);
		let editor = window.activeTextEditor;
		const originalText = editor?.document.getText();
		const expectedText = '[!INCLUDE [1](1.md)]' + originalText;
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves(qpSelectionItems[0]);
		await insertInclude();
		await sleep(extendedSleepTime);
		editor = window.activeTextEditor;
		const actualText = editor?.document.getText();
		expect(actualText).to.equal(expectedText);
		stub.restore();
		stubShowQuickPick.restore();
	});
	test('Window NT - includeMultipleFiles', async () => {
		const stub = sinon.stub(os, 'type').callsFake(() => 'Windows_NT');
		const markdown = qpSelectionItems[1].description + sep + qpSelectionItems[1].label;
		await loadDocumentAndGetItReady(markdown);
		let editor = window.activeTextEditor;
		const originalText = editor?.document.getText();
		const expectedText =
			'[!INCLUDE [1](1.md)][!INCLUDE [2](2.md)][!INCLUDE [3](3.md)]' + originalText;

		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves(qpSelectionItems[0]);
		stubShowQuickPick.onCall(1).resolves(qpSelectionItems[1]);
		stubShowQuickPick.onCall(2).resolves(qpSelectionItems[2]);

		await insertInclude();
		await sleep(extendedSleepTime);

		await insertInclude();
		await sleep(extendedSleepTime);

		await insertInclude();
		await sleep(extendedSleepTime);
		editor = window.activeTextEditor;
		const actualText = editor?.document.getText();
		expect(actualText).to.equal(expectedText);
		stub.restore();
		stubShowQuickPick.restore();
	});
});
