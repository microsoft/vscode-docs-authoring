/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chai from 'chai';
import * as sinon from 'sinon';
import * as os from 'os';
import { resolve } from 'path';
import { window } from 'vscode';
import { loadDocumentAndGetItReady } from '../../test.common/common';
import {
	tryFindFile,
	getOSPlatform,
	postWarning,
	postInformation,
	postError,
	unsupportedFileMessage,
	isValidEditor,
	rtrim,
	isMarkdownFileCheckWithoutNotification,
	isValidFileCheck,
	detectFileExtension,
	extractDocumentLink,
	escapeRegExp,
	splice
} from '../../../helper/common';
const expect = chai.expect;

suite('Common', () => {
	test('tryFindFile returns file path', async () => {
		const testFile = '../../../../../src/test/data/repo/articles';
		const testFileName = 'common.md';
		const filePath = resolve(__dirname, testFile);
		const foundFile = tryFindFile(filePath, testFileName);
		expect(foundFile).to.equal(`${filePath}\\${testFileName}`);
	});
	test('tryFindFile glob returns file path', async () => {
		const testFile = '../../../../../src/test/data/repo';
		const testFileName = 'common.md';
		const filePath = resolve(__dirname, testFile);
		const foundFile = tryFindFile(filePath, testFileName);
		expect(foundFile).to.equal(`${filePath}\\articles\\${testFileName}`);
	});
	test('getOSPlatform returns osPlatform', async () => {
		const osSpy = sinon.stub(os, 'platform');
		osSpy.onCall(0).returns('linux');
		const osPlatform = getOSPlatform();
		expect(osPlatform).to.equal('linux');
	});
	test('postWarning showWarning is called', async () => {
		const spy = chai.spy(window.showWarningMessage);
		postWarning('message');
		expect(spy).to.be.have.been.called;
	});
	test('postInformation showInformation is called', async () => {
		const spy = chai.spy(window.showInformationMessage);
		postInformation('message');
		expect(spy).to.be.have.been.called;
	});
	test('postError showErrorMessage is called', async () => {
		const spy = chai.spy(window.showErrorMessage);
		postError('message');
		expect(spy).to.be.have.been.called;
	});
	test('unsupportedFileMessage postWarning is called', async () => {
		const spy = chai.spy(window.showWarningMessage);
		unsupportedFileMessage('languageId');
		expect(spy).to.be.have.been.called;
	});
	test('isValidEditor returns false', async () => {
		const editor = window.activeTextEditor!;
		const val = isValidEditor(editor, false, 'test');
		expect(val).to.equal(false);
	});
	test('rtrim removes space', async () => {
		const val = rtrim('test ', ' ');
		expect(val).to.equal('test');
	});
	test('isMarkdownFileCheckWithoutNotification returns false', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/yaml-controller.yml'
		);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		const val = isMarkdownFileCheckWithoutNotification(editor);
		expect(val).to.equal(false);
	});
	test('isMarkdownFileCheckWithoutNotification returns true', async () => {
		const filePath = resolve(__dirname, '../../../../../src/test/data/repo/articles/common.md');
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		const val = isMarkdownFileCheckWithoutNotification(editor);
		expect(val).to.equal(true);
	});
	test('isValidFileCheck returns true', async () => {
		const filePath = resolve(__dirname, '../../../../../src/test/data/repo/articles/common.md');
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		const val = isValidFileCheck(editor, ['markdown']);
		expect(val).to.equal(true);
	});
	test('detectFileExtension returns .md', async () => {
		const filePath = resolve(__dirname, '../../../../../src/test/data/repo/articles/common.md');
		const val = detectFileExtension(filePath);
		expect(val).to.equal('.md');
	});
	test('extractDocumentLink returns filePath documentLink', async () => {
		const filePath = resolve(__dirname, '../../../../../src/test/data/repo/articles/common.md');
		await loadDocumentAndGetItReady(filePath);
		const document = window.activeTextEditor.document;
		const documentLink = extractDocumentLink(document, '../images/test.png', 34);
		expect(documentLink).to.have.property('range');
		expect(documentLink).to.have.property('target');
	});
	test('extractDocumentLink returns https documentLink', async () => {
		const filePath = resolve(__dirname, '../../../../../src/test/data/repo/articles/common.md');
		await loadDocumentAndGetItReady(filePath);
		const document = window.activeTextEditor.document;
		const documentLink = extractDocumentLink(document, 'https://www.google.com', 107);
		expect(documentLink).to.have.property('range');
		expect(documentLink).to.have.property('target');
	});
	test('escapeRegExp returns escaped characters', async () => {
		const content = escapeRegExp('test[]');
		expect(content).to.equal('test\\[\\]');
	});
	test('splice returns spliced content', async () => {
		const content = splice(5, 'brown jumped', ' fox');
		expect(content).to.equal('brown fox jumped');
	});
});
