/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as assert from 'assert';
import Axios from 'axios';
import * as chai from 'chai';
import * as spies from 'chai-spies';
import * as os from 'os';
import { resolve, relative } from 'path';
import { commands, QuickPickItem, window, ExtensionContext, Uri } from 'vscode';
import {
	applyComplex,
	applyIcon,
	applyImage,
	applyLightbox,
	applyLink,
	applyLocScope,
	insertImageCommand,
	pickImageType
} from '../../../controllers/image-controller';
import * as common from '../../../helper/common';
import * as telemetry from '../../../helper/telemetry';
import { loadDocumentAndGetItReady, sleep, extendedSleepTime } from '../../test.common/common';
import { context } from '../../test.common/common';

chai.use(spies);

import sinon = require('sinon');

const expect = chai.expect;

suite('Image Controller', () => {
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
	test('insertImageCommand', () => {
		const controllerCommands = [
			{ command: pickImageType.name, callback: pickImageType },
			{ command: applyImage.name, callback: applyImage },
			{ command: applyIcon.name, callback: applyIcon },
			{ command: applyComplex.name, callback: applyComplex },
			{ command: applyLocScope.name, callback: applyLocScope },
			{ command: applyLightbox.name, callback: applyLightbox },
			{ command: applyLink.name, callback: applyLink }
		];
		expect(insertImageCommand).to.deep.equal(controllerCommands);
	});
	test('applyIcon', async () => {
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item1: QuickPickItem = {
			label: 'icon image'
		};
		const item2: QuickPickItem = {
			description: resolve(__dirname, '../../../../../src/test/data/repo/images/'),
			label: 'test.png'
		};
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/image-controller1.md'
		);
		stubShowQuickPick.onCall(0).resolves(item1);
		stubShowQuickPick.onCall(1).resolves(item2);

		await loadDocumentAndGetItReady(filePath);

		await pickImageType(context);
		await sleep(extendedSleepTime);
		const expectedText = ':::image type="icon" source="../images/test.png" border="false":::';
		const editor = window.activeTextEditor;
		const actualText = editor?.document.getText();
		assert.equal(expectedText, actualText);
		stubShowQuickPick.restore();
	});
	test('applyImage', async () => {
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item1: QuickPickItem = {
			label: 'image'
		};
		const item2: QuickPickItem = {
			description: resolve(__dirname, '../../../../../src/test/data/repo/images/'),
			label: 'test.png'
		};
		stubShowQuickPick.onCall(0).resolves(item1);
		stubShowQuickPick.onCall(1).resolves(item2);

		const stubShowInputBox = sinon.stub(window, 'showInputBox');
		stubShowInputBox.resolves('foo');

		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/image-controller2.md'
		);

		await loadDocumentAndGetItReady(filePath);
		await pickImageType(context);
		await sleep(extendedSleepTime);
		const expectedText = ':::image type="content" source="../images/test.png" alt-text="foo":::';
		const editor = window.activeTextEditor;
		const actualText = editor?.document.getText();
		assert.equal(expectedText, actualText);
		stubShowQuickPick.restore();
		stubShowInputBox.restore();
	});
	test('applyComplex', async () => {
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item1: QuickPickItem = {
			label: 'complex image'
		};
		const item2: QuickPickItem = {
			description: resolve(__dirname, '../../../../../src/test/data/repo/images/'),
			label: 'test.png'
		};
		stubShowQuickPick.onCall(0).resolves(item1);
		stubShowQuickPick.onCall(1).resolves(item2);

		const stubShowInputBox = sinon.stub(window, 'showInputBox');
		stubShowInputBox.resolves('foo');
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/image-controller3.md'
		);

		await loadDocumentAndGetItReady(filePath);
		await pickImageType(context);
		await sleep(extendedSleepTime);
		const expectedText =
			':::image type="complex" source="../images/test.png" alt-text="foo":::' +
			os.EOL +
			os.EOL +
			':::image-end:::';
		const editor = window.activeTextEditor;
		const actualText = editor?.document.getText();
		assert.equal(expectedText, actualText);
		stubShowQuickPick.restore();
		stubShowInputBox.restore();
	});
	test('applyLocScope', async () => {
		const data = ['foo'];
		const resolved = new Promise(r => r({ data }));
		const stubAxios = sinon.stub(Axios, 'get').returns(resolved);

		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item1: QuickPickItem = {
			label: 'add localization scope to image'
		};
		const item2: QuickPickItem = {
			label: 'markdown'
		};
		stubShowQuickPick.onCall(0).resolves(item1);
		stubShowQuickPick.onCall(1).resolves(item2);
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/image-controller4.md'
		);

		await loadDocumentAndGetItReady(filePath);
		let editor = window.activeTextEditor;
		common.setCursorPosition(editor!, 0, 4);
		await pickImageType(context);
		await sleep(extendedSleepTime);
		const expectedText =
			':::image type="content" source="../images/test.png" alt-text="foo" loc-scope="markdown":::' +
			os.EOL;
		editor = window.activeTextEditor;
		const actualText = editor?.document.getText();
		assert.equal(expectedText, actualText);
		stubShowQuickPick.restore();
		stubAxios.restore();
	});
	test('applyLightbox', async () => {
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item1: QuickPickItem = {
			label: 'add lightbox to image'
		};
		const item2: QuickPickItem = {
			description: resolve(__dirname, '../../../../../src/test/data/repo/images/'),
			label: 'test.png'
		};
		stubShowQuickPick.onCall(0).resolves(item1);
		stubShowQuickPick.onCall(1).resolves(item2);
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/image-controller5.md'
		);

		await loadDocumentAndGetItReady(filePath);
		let editor = window.activeTextEditor;
		common.setCursorPosition(editor!, 0, 4);
		await pickImageType(context);
		await sleep(extendedSleepTime);
		const expectedText =
			':::image type="content" source="../images/test.png" alt-text="foo" loc-scope="markdown" lightbox="../images/test.png":::' +
			os.EOL;
		editor = window.activeTextEditor;
		const actualText = editor?.document.getText();
		assert.equal(expectedText, actualText);
		stubShowQuickPick.restore();
	});
	test('applyLink', async () => {
		const data = ['foo'];
		const resolved = new Promise(r => r({ data }));
		const stubAxios = sinon.stub(Axios, 'get').returns(resolved);

		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const item1: QuickPickItem = {
			label: 'add link to image'
		};
		const item2: QuickPickItem = {
			label: 'https://microsoft.com'
		};
		stubShowQuickPick.onCall(0).resolves(item1);
		stubShowQuickPick.onCall(1).resolves(item2);
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/image-controller6.md'
		);

		await loadDocumentAndGetItReady(filePath);
		let editor = window.activeTextEditor;
		common.setCursorPosition(editor!, 0, 4);
		await pickImageType(context);
		await sleep(extendedSleepTime);
		const expectedText =
			':::image type="content" source="../images/test.png" alt-text="foo" link="https://microsoft.com":::' +
			os.EOL;
		editor = window.activeTextEditor;
		const actualText = editor?.document.getText();
		assert.equal(expectedText, actualText);
		stubShowQuickPick.restore();
		stubAxios.restore();
	});
});
