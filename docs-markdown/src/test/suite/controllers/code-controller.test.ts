/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { resolve } from 'path';
import { commands, window } from 'vscode';
import { codeFormattingCommand, formatCode } from '../../../controllers/code-controller';
import * as common from '../../../helper/common';
import * as telemetry from '../../../helper/telemetry';
import { loadDocumentAndGetItReady, sleep, sleepTime } from '../../test.common/common';

chai.use(spies);
const expect = chai.expect;
import sinon = require('sinon');
const testFile = '../../../../../src/test/data/repo/articles/code.md';

// create x number of cursors below current cursor position , then select lines associated with each cursor
async function multiCursorSelectLine(x: number) {
	while (x !== 0) {
		await commands.executeCommand('editor.action.insertCursorBelow');
		x--;
	}
	await commands.executeCommand('cursorEndSelect');
}
// select x number of lines by dragging down from main cursor
async function cursorDownSelect(x: number) {
	while (x !== 0) {
		await commands.executeCommand('cursorDownSelect');
		x--;
	}
}

suite('Code Controller', () => {
	// Reset and tear down the spies
	teardown(() => {
		chai.spy.restore(common);
		chai.spy.restore(window);
	});
	suiteTeardown(async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
	});
	test('codeFormattingCommand', () => {
		const controllerCommands = [{ command: formatCode.name, callback: formatCode }];
		expect(codeFormattingCommand()).to.deep.equal(controllerCommands);
	});
	test('noActiveEditorMessage', async () => {
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		await formatCode();
		expect(spy).to.have.been.called();
	});
	test('isValidEditor', async () => {
		const filePath = resolve(__dirname, testFile);
		await loadDocumentAndGetItReady(filePath);
		const spy = chai.spy.on(common, 'isValidEditor');
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		await formatCode();
		stub.restore();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
	});
	test('isMarkdownFileCheck', async () => {
		const spy = chai.spy.on(common, 'isMarkdownFileCheck');
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		await formatCode();
		stub.restore();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
	});
	// single line selection test
	test('selectionIsSingleLine - singleCursorSelection', async () => {
		const editor = window.activeTextEditor;
		common.setCursorPosition(editor!, 1, 0);
		await commands.executeCommand('cursorEndSelect');
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		await formatCode();
		stub.restore();
		await sleep(sleepTime);
		const output = editor?.document.lineAt(1).text;
		expect(output).to.equal('`# required metadata`');
	});
	test('selectionIsSingleLine - singleCursorSelection - isInlineCode', async () => {
		const editor = window.activeTextEditor;
		common.setCursorPosition(editor!, 12, 12);
		await commands.executeCommand('cursorEndSelect');
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		await formatCode();
		stub.restore();
		await sleep(sleepTime);
		const output = editor?.document.lineAt(12).text;
		expect(output).to.equal('# This is a code page');
	});
	test('selectionIsSingleLine - multipleCursorSelection', async () => {
		const editor = window.activeTextEditor;
		common.setCursorPosition(editor!, 4, 0);
		await multiCursorSelectLine(2);
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		await formatCode();
		stub.restore();
		await sleep(sleepTime);
		const output1 = editor!.document.lineAt(4).text;
		const output2 = editor!.document.lineAt(5).text;
		const output3 = editor!.document.lineAt(6).text;
		const result = output1 + output2 + output3;
		expect(result).to.equal('`author: meganbradley``ms.author: mbradley``ms.date: 07/23/2018`');
	});
	// multi lines selection test
	test('multipleLinesAreSelected-isMultiLineCode-singleCursorSelection', async () => {
		const editor = window.activeTextEditor;
		common.setCursorPosition(editor!, 16, 0);
		await cursorDownSelect(2);
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves(undefined);
		await formatCode();
		stub.restore();
		await sleep(sleepTime);
		stubShowQuickPick.restore();
		const output = editor?.document.lineAt(17).text;
		expect(output).to.equal('let x = "JavaScript";');
	});
	test('multipleLinesAreSelected-singleCursorSelection-NotMultiLineCode-showSupportedLanguages-noSelection', async () => {
		const editor = window.activeTextEditor;
		const spy = chai.spy.on(common, 'postWarning');
		common.setCursorPosition(editor!, 20, 0);
		await cursorDownSelect(2);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves(undefined);
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		await formatCode();
		stub.restore();
		stubShowQuickPick.restore();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
	});
	test('multipleLinesAreSelected-singleCursorSelection-NotMultiLineCode-showSupportedLanguages-selectPython', async () => {
		const editor = window.activeTextEditor;
		common.setCursorPosition(editor!, 20, 0);
		await cursorDownSelect(2);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({ label: 'Python' });
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		await formatCode();
		await sleep(sleepTime);
		const output =
			editor!.document.lineAt(21).text +
			editor!.document.lineAt(22).text +
			editor!.document.lineAt(23).text +
			editor!.document.lineAt(24).text;
		expect(output).to.equal('```pythonx = "Python2"y = "Python3"```');
		stub.restore();
		stubShowQuickPick.restore();
	});
});
