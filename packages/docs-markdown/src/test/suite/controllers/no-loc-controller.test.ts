/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { resolve } from 'path';
import { commands, window } from 'vscode';
import * as common from '../../../helper/common';
import * as telemetry from '../../../helper/telemetry';
import {
	loadDocumentAndGetItReady,
	sleep,
	sleepTime,
	extendedSleepTime
} from '../../test.common/common';

chai.use(spies);

import sinon = require('sinon');
import { noLocTextCommand, noLocText } from '../../../controllers/no-loc-controller';

const expect = chai.expect;

suite('No-loc Controller', () => {
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
	test('noLocTextCommand', () => {
		const controllerCommands = [{ command: noLocText.name, callback: noLocText }];
		expect(noLocTextCommand()).to.deep.equal(controllerCommands);
	});
	test('noActiveEditorMessage', async () => {
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		await noLocText();
		expect(spy).to.have.been.called();
	});
	test('isMarkdownFileCheck', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/no-loc-controller.md'
		);
		await loadDocumentAndGetItReady(filePath);

		const spy = chai.spy.on(common, 'isMarkdownFileCheck');
		await noLocText();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
	});
	test('noLocText - md - insertYamlNoLocEntry - isContentOnCurrentLine', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/no-loc-controller.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const spy = chai.spy.on(window, 'showErrorMessage');
		const editor = window.activeTextEditor!;
		common.setCursorPosition(editor, 2, 0);
		await noLocText();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
	});
	test('noLocText - md - insertYamlNoLocEntry - insertContentToEditor', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/no-loc-controller.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const spy = chai.spy.on(common, 'insertContentToEditor');
		const editor = window.activeTextEditor!;
		common.setCursorPosition(editor, 2, 0);
		common.insertContentToEditor(editor, '\r\n');
		common.setCursorPosition(editor, 2, 0);
		await sleep(extendedSleepTime);
		await noLocText();
		await sleep(extendedSleepTime);
		expect(spy).to.have.been.called();
	});
	test('noLocText - md - insertMarkdownNoLocEntry - insertContentToEditor', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/no-loc-controller.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const spy = chai.spy.on(common, 'insertContentToEditor');
		const editor = window.activeTextEditor!;
		common.setCursorPosition(editor, 12, 0);
		common.insertContentToEditor(editor, '\r\n');
		common.setCursorPosition(editor, 12, 0);
		await sleep(extendedSleepTime);
		await noLocText();
		await sleep(extendedSleepTime);
		expect(spy).to.have.been.called();
	});
	test('noLocText - md - insertMarkdownNoLocEntry - insertContentToEditor - textSelection', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/no-loc-controller.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const spy = chai.spy.on(common, 'insertContentToEditor');
		const editor = window.activeTextEditor!;
		common.setSelectorPosition(editor, 16, 0, 16, 6);
		await sleep(extendedSleepTime);
		await noLocText();
		await sleep(extendedSleepTime);
		expect(spy).to.have.been.called();
	});
	test('noLocText - yml - insertYamlNoLocEntry - insertContentToEditor', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/no-loc-controller.yml'
		);
		await loadDocumentAndGetItReady(filePath);
		const spy = chai.spy.on(common, 'insertContentToEditor');
		await noLocText();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
	});
});
