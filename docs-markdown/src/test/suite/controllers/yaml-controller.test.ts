import * as chai from 'chai';
import * as spies from 'chai-spies';
import { resolve, basename, dirname } from 'path';
import { commands, window, InputBoxOptions } from 'vscode';
import * as common from '../../../helper/common';
import * as telemetry from '../../../helper/telemetry';
import {
	loadDocumentAndGetItReady,
	sleep,
	sleepTime,
	extendedSleepTime
} from '../../test.common/common';
import {
	yamlCommands,
	insertTocEntry,
	insertTocEntryWithOptions,
	insertExpandableParentNode
} from '../../../controllers/yaml/yaml-controller';
import * as checkForPreviousEntry from '../../../controllers/yaml/checkForPreviousEntry';
import * as createEntry from '../../../controllers/yaml/createEntry';
import * as parentNode from '../../../controllers/yaml/createParentNode';
import { createParentNode } from '../../../controllers/yaml/createParentNode';
import { showTOCQuickPick } from '../../../controllers/yaml/showTOCQuickPick';

chai.use(spies);

import sinon = require('sinon');

const expect = chai.expect;

suite('Yaml Controller', () => {
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
	test('yamlCommands', () => {
		const controllerCommands = [
			{ command: insertTocEntry.name, callback: insertTocEntry },
			{
				command: insertTocEntryWithOptions.name,
				callback: insertTocEntryWithOptions
			},
			{
				command: insertExpandableParentNode.name,
				callback: insertExpandableParentNode
			}
		];
		expect(yamlCommands()).to.deep.equal(controllerCommands);
	});
	test('insertTocEntry', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/yaml-controller.yml'
		);
		await loadDocumentAndGetItReady(filePath);
		const testFile = '../../../../../src/test/data/repo/articles/docs-markdown.md';
		const testFilePath = resolve(__dirname, testFile);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({
			label: `${basename(testFilePath)}`,
			description: `${dirname(testFilePath)}`
		});
		const stubShowInputBox = sinon.stub(window, 'showInputBox');
		stubShowInputBox.onCall(0).resolves('Docs Markdown Reference');

		const spy = chai.spy.on(checkForPreviousEntry, 'checkForPreviousEntry');
		await insertTocEntry();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
		stubShowInputBox.restore();
	});
	test('insertTocEntryWithOptions', async () => {
		const testFile = '../../../../../src/test/data/repo/articles/docs-markdown.md';
		const testFilePath = resolve(__dirname, testFile);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({
			label: `${basename(testFilePath)}`,
			description: `${dirname(testFilePath)}`
		});
		const stubShowInputBox = sinon.stub(window, 'showInputBox');
		stubShowInputBox.onCall(0).resolves('Docs Markdown Reference');

		const spy = chai.spy.on(checkForPreviousEntry, 'checkForPreviousEntry');
		await insertTocEntryWithOptions();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
		stubShowInputBox.restore();
	});
	test('insertTocEntryWithOptions', async () => {
		const testFile = '../../../../../src/test/data/repo/articles/docs-markdown.md';
		const testFilePath = resolve(__dirname, testFile);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({
			label: `${basename(testFilePath)}`,
			description: `${dirname(testFilePath)}`
		});
		const stubShowInputBox = sinon.stub(window, 'showInputBox');
		stubShowInputBox.onCall(0).resolves('Docs Markdown Reference');

		const spy = chai.spy.on(parentNode, 'createParentNode');
		await insertExpandableParentNode();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
		stubShowInputBox.restore();
	});
	test('showQuickPick', async () => {
		const testFile = '../../../../../src/test/data/repo/articles/docs-markdown.md';
		const testFilePath = resolve(__dirname, testFile);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({
			label: `${basename(testFilePath)}`,
			description: `${dirname(testFilePath)}`
		});
		const stubShowInputBox = sinon.stub(window, 'showInputBox');
		stubShowInputBox.onCall(0).resolves('Docs Markdown Reference');

		const spy = chai.spy.on(createEntry, 'createEntry');
		await showTOCQuickPick(true);
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
		stubShowInputBox.restore();
	});
	test('showQuickPick nested - formatted correctly', async () => {
		const testFile = '../../../../../src/test/data/repo/articles/bookmark.md';
		const testFilePath = resolve(__dirname, testFile);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({
			label: `${basename(testFilePath)}`,
			description: `${dirname(testFilePath)}`
		});
		const stubShowInputBox = sinon.stub(window, 'showInputBox');
		stubShowInputBox.onCall(0).resolves('This is a bookmark page');
		const file = '../../../../../src/test/data/repo/articles/yaml-controller2.yml';
		const filePath = resolve(__dirname, file);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		common.setCursorPosition(editor, 7, 0);
		await common.insertContentToEditor(editor, '    ', false);
		await sleep(sleepTime);
		await showTOCQuickPick(false);
		await sleep(sleepTime);
		const actualText = editor?.document.getText();
		const expectedText = [
			'- name: Docs Markdown Reference1',
			'  href: docs-markdown1.md',
			'- name: template-controller.md',
			'  items:',
			'    - name: Docs Markdown Reference2',
			'      href: docs-markdown2.md',
			'    - name: This is a bookmark page',
			'      href: bookmark.md'
		].join('\r\n');
		expect(expectedText).to.be.equal(actualText);
		stubShowQuickPick.restore();
		stubShowInputBox.restore();
	});
	test('showQuickPick nested with options - formatted correctly', async () => {
		const testFile = '../../../../../src/test/data/repo/articles/bookmark.md';
		const testFilePath = resolve(__dirname, testFile);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({
			label: `${basename(testFilePath)}`,
			description: `${dirname(testFilePath)}`
		});
		const stubShowInputBox = sinon.stub(window, 'showInputBox');
		stubShowInputBox.onCall(0).resolves('This is a bookmark page');
		const file = '../../../../../src/test/data/repo/articles/yaml-controller3.yml';
		const filePath = resolve(__dirname, file);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		common.setCursorPosition(editor, 7, 0);
		await common.insertContentToEditor(editor, '    ', false);
		await sleep(sleepTime);
		await showTOCQuickPick(true);
		await sleep(sleepTime);
		const actualText = editor?.document.getText();
		const expectedText = [
			'- name: Docs Markdown Reference1',
			'  href: docs-markdown1.md',
			'- name: template-controller.md',
			'  items:',
			'    - name: Docs Markdown Reference2',
			'      href: docs-markdown2.md',
			'    - name: This is a bookmark page',
			'      displayName: #optional string for searching TOC',
			'      href: bookmark.md',
			'      uid: #optional string',
			'      expanded: #true or false, false is default'
		].join('\r\n');
		expect(expectedText).to.be.equal(actualText);
		stubShowQuickPick.restore();
		stubShowInputBox.restore();
	});
	test('showQuickPick first position - formatted correctly', async () => {
		const testFile = '../../../../../src/test/data/repo/articles/bookmark.md';
		const testFilePath = resolve(__dirname, testFile);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({
			label: `${basename(testFilePath)}`,
			description: `${dirname(testFilePath)}`
		});
		const stubShowInputBox = sinon.stub(window, 'showInputBox');
		stubShowInputBox.onCall(0).resolves('This is a bookmark page');
		const file = '../../../../../src/test/data/repo/articles/yaml-controller4.yml';
		const filePath = resolve(__dirname, file);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		common.setCursorPosition(editor, 0, 0);
		await showTOCQuickPick(false);
		await sleep(sleepTime);
		const actualText = editor?.document.getText();
		const expectedText = ['- name: This is a bookmark page', '  href: bookmark.md'].join('\r\n');
		expect(expectedText).to.be.equal(actualText);
		stubShowQuickPick.restore();
		stubShowInputBox.restore();
	});
	test('showQuickPick first position with options - formatted correctly', async () => {
		const testFile = '../../../../../src/test/data/repo/articles/bookmark.md';
		const testFilePath = resolve(__dirname, testFile);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({
			label: `${basename(testFilePath)}`,
			description: `${dirname(testFilePath)}`
		});
		const stubShowInputBox = sinon.stub(window, 'showInputBox');
		stubShowInputBox.onCall(0).resolves('This is a bookmark page');
		const file = '../../../../../src/test/data/repo/articles/yaml-controller5.yml';
		const filePath = resolve(__dirname, file);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		common.setCursorPosition(editor, 0, 0);
		await showTOCQuickPick(true);
		await sleep(sleepTime);
		const actualText = editor?.document.getText();
		const expectedText = [
			'- name: This is a bookmark page',
			'  displayName: #optional string for searching TOC',
			'  href: bookmark.md',
			'  uid: #optional string',
			'  expanded: #true or false, false is default'
		].join('\r\n');
		expect(expectedText).to.be.equal(actualText);
		stubShowQuickPick.restore();
		stubShowInputBox.restore();
	});
	test('createParentNode first position - formatted correctly', async () => {
		const testFile = '../../../../../src/test/data/repo/articles/bookmark.md';
		const testFilePath = resolve(__dirname, testFile);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({
			label: `${basename(testFilePath)}`,
			description: `${dirname(testFilePath)}`
		});
		const stubShowInputBox = sinon.stub(window, 'showInputBox');
		stubShowInputBox.onCall(0).resolves('This is a bookmark page');
		const file = '../../../../../src/test/data/repo/articles/yaml-controller6.yml';
		const filePath = resolve(__dirname, file);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		common.setCursorPosition(editor, 0, 0);
		await createParentNode();
		await sleep(sleepTime);
		const actualText = editor?.document.getText();
		const expectedText = ['- name:', '  items:', '  - name:', '    href:'].join('\r\n');
		expect(expectedText).to.be.equal(actualText);
		stubShowQuickPick.restore();
		stubShowInputBox.restore();
	});
	test('createParentNode nested - formatted correctly', async () => {
		const testFile = '../../../../../src/test/data/repo/articles/bookmark.md';
		const testFilePath = resolve(__dirname, testFile);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({
			label: `${basename(testFilePath)}`,
			description: `${dirname(testFilePath)}`
		});
		const stubShowInputBox = sinon.stub(window, 'showInputBox');
		stubShowInputBox.onCall(0).resolves('This is a bookmark page');
		const file = '../../../../../src/test/data/repo/articles/yaml-controller7.yml';
		const filePath = resolve(__dirname, file);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		common.setCursorPosition(editor, 7, 0);
		await common.insertContentToEditor(editor, '    ', false);
		await sleep(sleepTime);
		await createParentNode();
		await sleep(sleepTime);
		const actualText = editor?.document.getText();
		const expectedText = [
			'- name: Docs Markdown Reference1',
			'  href: docs-markdown1.md',
			'- name: template-controller.md',
			'  items:',
			'    - name: Docs Markdown Reference2',
			'      href: docs-markdown2.md',
			'    - name:',
			'      items:',
			'      - name:',
			'        href:'
		].join('\r\n');
		expect(expectedText).to.be.equal(actualText);
		stubShowQuickPick.restore();
		stubShowInputBox.restore();
	});
});
