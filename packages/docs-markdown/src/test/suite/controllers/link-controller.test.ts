import * as chai from 'chai';
import * as spies from 'chai-spies';
import { resolve } from 'path';
import { commands, Position, Range, window } from 'vscode';
import {
	collapseRelativeLinks,
	collapseRelativeLinksForEditor,
	collapseRelativeLinksForFile,
	collapseRelativeLinksInFolder,
	linkControllerCommands
} from '../../../controllers/links/link-controller';
import * as common from '../../../helper/common';
import * as linksToDoc from '../../../controllers/links/linkToDocsPageByUrl';
import Axios from 'axios';
import { loadDocumentAndGetItReady, sleep } from '../../test.common/common';
import * as getHeader from '../../../helper/getHeader';
import * as telemetry from '../../../helper/telemetry';

chai.use(spies);

import sinon = require('sinon');

const expect = chai.expect;

suite('Link Controller', () => {
	suiteSetup(() => {
		sinon.stub(telemetry, 'sendTelemetryData');
	});
	// Reset and tear down the spies
	teardown(() => chai.spy.restore(common));
	suiteTeardown(async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
		sinon.restore();
	});
	test('linkControllerCommands', () => {
		const controllerCommands = [
			{ callback: collapseRelativeLinks, command: 'collapseRelativeLinks' },
			{ callback: collapseRelativeLinksInFolder, command: 'collapseRelativeLinksInFolder' }
		];
		expect(linkControllerCommands).to.deep.equal(controllerCommands);
	});
	test('noActiveEditorMessage', async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		await collapseRelativeLinks();
		expect(spy).to.have.been.called();
	});
	test('Collapse relative links for editor', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/link-controller.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		const replacements = await collapseRelativeLinksForEditor(editor.document, editor);
		expect(replacements).to.equal(3);
	});
	test('Collapse relative links for file', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/link-controller.md'
		);
		const replacements = await collapseRelativeLinksForFile(filePath, false);
		expect(replacements).to.equal(3);
	});
	test('linkToDocsPageByUrl(urlValue) returns local repo path to markdown', async () => {
		const data = `<html>
		<head>
			<meta name="original_content_git_url" content="https://github.com/MicrosoftDocs/repo/blob/live/articles/docs-markdown.md">
		</head>
		<body lang="en-us" dir="ltr">
			<div></div>
		</body>
	</html>`;
		const resolved = new Promise(r => r({ data }));
		const stubAxios = sinon.stub(Axios, 'get').returns(resolved);
		const stubTryGetHeader = sinon
			.stub(getHeader, 'tryGetHeader')
			.returns(Promise.resolve('docs markdown reference'));
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/link-controller.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		common.setCursorPosition(editor, 10, 0);
		await linksToDoc.linkToDocsPageByUrl('https://docs.microsoft.com/en-us/repo/docs-markdown/');
		await sleep(500);
		const selection = editor.selection;
		const actualText = window.activeTextEditor?.document.getText(
			new Range(new Position(10, 0), new Position(10, selection.end.character))
		);
		expect(actualText).to.be.equal('[docs markdown reference](docs-markdown.md)');
		stubAxios.restore();
		stubTryGetHeader.restore();
	});
	test('linkToDocsPageByUrl() returns local repo path to markdown', async () => {
		const data = `<html>
		<head>
			<meta name="original_content_git_url" content="https://github.com/MicrosoftDocs/repo/blob/live/articles/docs-markdown.md">
		</head>
		<body lang="en-us" dir="ltr">
			<div></div>
		</body>
	</html>`;
		const resolved = new Promise(r => r({ data }));
		const stubAxios = sinon.stub(Axios, 'get').returns(resolved);
		const stubShowInputBox = sinon
			.stub(window, 'showInputBox')
			.resolves('https://docs.microsoft.com/en-us/repo/docs-markdown/');
		const stubTryGetHeader = sinon
			.stub(getHeader, 'tryGetHeader')
			.returns(Promise.resolve('docs markdown reference'));
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/link-controller.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		common.setCursorPosition(editor, 10, 0);
		await linksToDoc.linkToDocsPageByUrl();
		await sleep(500);
		const selection = editor.selection;
		const actualText = window.activeTextEditor?.document.getText(
			new Range(new Position(10, 0), new Position(10, selection.end.character))
		);
		expect(actualText).to.be.equal('[docs markdown reference](docs-markdown.md)');
		stubAxios.restore();
		stubTryGetHeader.restore();
		stubShowInputBox.restore();
	});
	test('linkToDocsPageByUrl() returns relative URL to markdown', async () => {
		const resolved = new Promise(r => r({}));
		const stubAxios = sinon.stub(Axios, 'get').returns(resolved);
		const stubShowInputBox = sinon.stub(window, 'showInputBox');
		stubShowInputBox.onCall(0).resolves('https://docs.microsoft.com/en-us/repo/docs-markdown/');
		stubShowInputBox.onCall(1).resolves('docs markdown reference');
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/link-controller.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		common.setCursorPosition(editor, 10, 0);
		await linksToDoc.linkToDocsPageByUrl();
		await sleep(500);
		const selection = editor.selection;
		const actualText = window.activeTextEditor?.document.getText(
			new Range(new Position(10, 0), new Position(10, selection.end.character))
		);
		expect(actualText).to.be.equal('[docs markdown reference](/repo/docs-markdown/)');
		stubAxios.restore();
		stubShowInputBox.restore();
	});
});
