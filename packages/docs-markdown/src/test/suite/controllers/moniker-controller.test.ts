/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { resolve } from 'path';
import { commands, window } from 'vscode';
import { insertMoniker, insertMonikerCommand } from '../../../controllers/moniker-controller';
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

const testFile = '../../../../../src/test/data/repo/articles/moniker.md';
const monikerOptions = ['range equals', 'range greater than or equal', 'range less than or equal'];

// line ( y coord) , character (x coord)
const yamlLine = 10;
const yamlCharacter = 15;
const markLine = yamlLine + 4;
const markCharacter = 19;

suite('Moniker Controller', () => {
	// Reset and tear down the spies
	teardown(() => {
		chai.spy.restore(common);
		chai.spy.restore(window);
	});
	suiteTeardown(async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
	});
	test('insertMonikerCommand', () => {
		const controllerCommands = [{ command: insertMoniker.name, callback: insertMoniker }];
		expect(insertMonikerCommand()).to.deep.equal(controllerCommands);
	});
	test('noActiveEditorMessage', async () => {
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		await insertMoniker();
		expect(spy).to.have.been.called();
	});
	test('isMarkdownFileCheck', async () => {
		const filePath = resolve(__dirname, testFile);
		await loadDocumentAndGetItReady(filePath);
		const spy = chai.spy.on(common, 'isMarkdownFileCheck');
		await insertMoniker();
		await sleep(extendedSleepTime);
		expect(spy).to.have.been.called();
	});
	test('isContentOnCurrentLine', async () => {
		const spy = chai.spy.on(window, 'showErrorMessage');
		await insertMoniker();
		await sleep(extendedSleepTime);
		expect(spy).to.have.been.called();
	});
	// YAML Header test
	test('insertYamlMoniker - equal - output', async () => {
		const editor = window.activeTextEditor;
		common.setCursorPosition(editor!, yamlLine, 0);
		common.insertContentToEditor(editor!, '\r\n');
		common.insertContentToEditor(editor!, '', false, editor!.document.lineAt(10).range);
		common.setCursorPosition(editor!, yamlLine, 0); // move cursor back
		await sleep(sleepTime);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick' as any);
		stubShowQuickPick.onCall(0).resolves(monikerOptions[0]);
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		await insertMoniker();
		await sleep(extendedSleepTime);
		const output = editor?.document.lineAt(yamlLine).text;
		stub.restore();
		stubShowQuickPick.restore();
		expect(output).to.equal("monikerRange: ''");
	});

	test('insertYamlMoniker - equal - cursorPosition', async () => {
		const editor = window.activeTextEditor;
		const cursorPosition = [editor?.selection.active.line, editor?.selection.active.character];
		expect(cursorPosition).to.deep.equal([yamlLine, yamlCharacter]);
	});

	test('insertYamlMoniker - greater/equal - output', async () => {
		const editor = window.activeTextEditor;
		common.setCursorPosition(editor!, yamlLine, 0);
		common.insertContentToEditor(editor!, '\r\n');
		common.setCursorPosition(editor!, yamlLine, 0);

		await sleep(sleepTime);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick' as any);
		stubShowQuickPick.onCall(0).resolves(monikerOptions[1]);
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		await insertMoniker();
		await sleep(extendedSleepTime);
		const output = editor?.document.lineAt(yamlLine).text;
		stub.restore();
		stubShowQuickPick.restore();
		expect(output).to.equal("monikerRange: '>='");
	});

	test('insertYamlMoniker - greater/equal - cursorPosition', async () => {
		const editor = window.activeTextEditor;
		const cursorPosition = [editor?.selection.active.line, editor?.selection.active.character];

		expect(cursorPosition).to.deep.equal([yamlLine, yamlCharacter + 2]);
	});

	test('insertYamlMoniker - less/equal - output', async () => {
		const editor = window.activeTextEditor;
		common.setCursorPosition(editor!, yamlLine, 0);
		common.insertContentToEditor(editor!, '\r\n');
		common.setCursorPosition(editor!, yamlLine, 0);
		await sleep(sleepTime);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick' as any);
		stubShowQuickPick.onCall(0).resolves(monikerOptions[2]);
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		await insertMoniker();
		await sleep(extendedSleepTime);
		const output = editor?.document.lineAt(yamlLine).text;
		stub.restore();
		stubShowQuickPick.restore();
		expect(output).to.equal("monikerRange: '<='");
	});

	test('insertYamlMoniker - greater/equal - cursorPosition', async () => {
		const editor = window.activeTextEditor;
		const cursorPosition = [editor?.selection.active.line, editor?.selection.active.character];

		expect(cursorPosition).to.deep.equal([yamlLine, yamlCharacter + 2]);
	});

	// Markdown body test
	test('insertMarkdownMoniker - equal - output', async () => {
		const editor = window.activeTextEditor!;
		common.setCursorPosition(editor, markLine, 0);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick' as any);
		stubShowQuickPick.onCall(0).resolves(monikerOptions[0]);
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		await insertMoniker();
		await sleep(extendedSleepTime);
		const line1 = editor.document.lineAt(markLine).text;
		const line2 = editor.document.lineAt(markLine + 1).text;
		const line3 = editor.document.lineAt(markLine + 2).text;
		const output = line1 + line2 + line3;
		stub.restore();
		stubShowQuickPick.restore();
		expect(output).to.equal('::: moniker range=""::: moniker-end');
	});

	test('insertMarkdownMoniker - equal - cursorPosition', async () => {
		const editor = window.activeTextEditor!;
		const cursorPosition = [editor.selection.active.line, editor.selection.active.character];

		expect(cursorPosition).to.deep.equal([markLine + 2, markCharacter]);
	});

	test('insertMarkdownMoniker - greater/equal - output', async () => {
		const editor = window.activeTextEditor!;
		common.setCursorPosition(editor, markLine + 3, 0);
		common.insertContentToEditor(editor, '\r\n');
		common.setCursorPosition(editor, markLine + 3, 0);
		await sleep(sleepTime);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick' as any);
		stubShowQuickPick.onCall(0).resolves(monikerOptions[1]);
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		await insertMoniker();
		await sleep(extendedSleepTime);
		const line1 = editor.document.lineAt(markLine + 3).text;
		const line2 = editor.document.lineAt(markLine + 4).text;
		const line3 = editor.document.lineAt(markLine + 5).text;
		const output = line1 + line2 + line3;
		stub.restore();
		stubShowQuickPick.restore();
		expect(output).to.equal('::: moniker range=">="::: moniker-end');
	});

	test('insertMarkdownMoniker - greater/equal - cursorPosition', async () => {
		const editor = window.activeTextEditor!;
		const cursorPosition = [editor.selection.active.line, editor.selection.active.character];

		expect(cursorPosition).to.deep.equal([markLine + 5, markCharacter + 2]);
	});

	test('insertMarkdownMoniker - less/equal - output', async () => {
		const editor = window.activeTextEditor!;
		common.setCursorPosition(editor, markLine + 6, 0);
		common.insertContentToEditor(editor!, '\r\n');
		common.setCursorPosition(editor, markLine + 6, 0);
		await sleep(sleepTime);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick' as any);
		stubShowQuickPick.onCall(0).resolves(monikerOptions[2]);

		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		await insertMoniker();
		await sleep(extendedSleepTime);
		const line1 = editor.document.lineAt(markLine + 6).text;
		const line2 = editor.document.lineAt(markLine + 7).text;
		const line3 = editor.document.lineAt(markLine + 8).text;
		const output = line1 + line2 + line3;
		stub.restore();
		stubShowQuickPick.restore();

		expect(output).to.equal('::: moniker range="<="::: moniker-end');
	});

	test('insertMarkdownMoniker - less/equal - cursorPosition', async () => {
		const editor = window.activeTextEditor!;
		const cursorPosition = [editor.selection.active.line, editor.selection.active.character];
		expect(cursorPosition).to.deep.equal([markLine + 8, markCharacter + 2]);
	});
});
