/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { resolve } from 'path';
import { commands, window, Selection } from 'vscode';
import { formatBold, boldFormattingCommand } from '../../../controllers/bold-controller';
import * as common from '../../../helper/common';
import * as telemetry from '../../../helper/telemetry';
import {
	loadDocumentAndGetItReady,
	sleep,
	sleepTime,
	extendedSleepTime
} from '../../test.common/common';

chai.use(spies);

// tslint:disable-next-line: no-var-requires
import sinon = require('sinon');
const expect = chai.expect;

suite('Bold Controller', () => {
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
	test('boldFormattingCommand', () => {
		const controllerCommands = [{ command: formatBold.name, callback: formatBold }];
		expect(boldFormattingCommand()).to.deep.equal(controllerCommands);
	});
	test('noActiveEditorMessage', async () => {
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		await formatBold();
		expect(spy).to.have.been.called();
	});
	test('isMarkdownFileCheck', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const spy = chai.spy.on(common, 'isMarkdownFileCheck');
		await formatBold();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
	});
	test('Bold Format Empty Selection', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		common.setSelectorPosition(editor, 12, 0, 12, 0);

		const spy = chai.spy.on(common, 'insertContentToEditor');
		await formatBold();
		await sleep(extendedSleepTime);

		expect(spy).to.have.been.called();
	});
	test('Bold Format Single Selection', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		common.setSelectorPosition(editor, 15, 0, 15, 1);

		const spy = chai.spy.on(common, 'insertContentToEditor');
		await formatBold();
		await sleep(extendedSleepTime);
		expect(spy).to.have.been.called();
	});
	test('Bold Format Word Selection', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		common.setSelectorPosition(editor, 159, 0, 159, 4);
		await formatBold();
		await sleep(extendedSleepTime);
		const line = editor?.document.lineAt(159).text;

		expect(line).to.equal('**Body**');
	});
	test('Bold Format Multiple Selection', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		const cursorPosition = editor?.selection.active;
		const fromPositionOne = cursorPosition.with(48, 0);
		const toPositionOne = cursorPosition.with(48, 5);
		const fromPositionTwo = cursorPosition.with(48, 13);
		const toPositionTwo = cursorPosition.with(48, 17);
		editor.selections = [
			new Selection(fromPositionOne, toPositionOne),
			new Selection(fromPositionTwo, toPositionTwo)
		];
		await formatBold();
		await sleep(extendedSleepTime);
		const line = editor?.document.lineAt(48).text;

		expect(line).to.equal('**These** alerts **look** like this on docs.microsoft.com:');
	});
});
