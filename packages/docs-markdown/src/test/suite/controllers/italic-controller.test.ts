/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { resolve } from 'path';
import { commands, window, Selection } from 'vscode';
import { formatItalic, italicFormattingCommand } from '../../../controllers/italic-controller';
import * as common from '../../../helper/common';
import * as telemetry from '../../../helper/telemetry';
import { loadDocumentAndGetItReady, sleep, sleepTime } from '../../test.common/common';

chai.use(spies);

// tslint:disable-next-line: no-var-requires
import sinon = require('sinon');
const expect = chai.expect;

suite('Italic Controller', () => {
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
	test('ItalicFormattingCommand', () => {
		const controllerCommands = [{ command: formatItalic.name, callback: formatItalic }];
		expect(italicFormattingCommand()).to.deep.equal(controllerCommands);
	});
	test('noActiveEditorMessage', async () => {
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		await formatItalic();
		expect(spy).to.have.been.called();
	});
	test('isMarkdownFileCheck', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const spy = chai.spy.on(common, 'isMarkdownFileCheck');
		await formatItalic();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
	});
	test('Italic Format Empty Selection', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		common.setSelectorPosition(editor, 14, 0, 14, 0);

		const spy = chai.spy.on(common, 'insertContentToEditor');
		await formatItalic();
		await sleep(sleepTime);

		expect(spy).to.have.been.called();
	});
	test('Italic Format Single Selection', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		common.setSelectorPosition(editor, 15, 0, 15, 1);

		const spy = chai.spy.on(common, 'insertContentToEditor');
		await formatItalic();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
	});
	test('Italic Format Word Selection', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		common.setSelectorPosition(editor, 163, 0, 163, 4);
		await formatItalic();
		await sleep(sleepTime);
		const line = editor?.document.lineAt(163).text;

		expect(line).to.equal('*Body*');
	});
	test('Italic Format Multiple Selection', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		const cursorPosition = editor?.selection.active;
		const fromPositionOne = cursorPosition.with(45, 2);
		const toPositionOne = cursorPosition.with(45, 11);
		const fromPositionTwo = cursorPosition.with(45, 39);
		const toPositionTwo = cursorPosition.with(45, 45);
		editor.selections = [
			new Selection(fromPositionOne, toPositionOne),
			new Selection(fromPositionTwo, toPositionTwo)
		];
		await formatItalic();
		await sleep(sleepTime);
		const line = editor?.document.lineAt(45).text;

		expect(line).to.equal('> *Dangerous* certain consequences of an *action*.');
	});
});
