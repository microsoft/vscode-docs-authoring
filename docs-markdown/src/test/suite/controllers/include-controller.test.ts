/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { resolve } from 'path';
import { commands, TextEditor, window, workspace } from 'vscode';
import { insertInclude, insertIncludeCommand } from '../../../controllers/include-controller';
import * as common from '../../../helper/common';
import * as telemetry from '../../../helper/telemetry';
import { extendedSleepTime, loadDocumentAndGetItReady, sleep } from '../../test.common/common';

chai.use(spies);
import sinon = require('sinon');
const expect = chai.expect;

const root = workspace.workspaceFolders![0].uri;
const testFile = '../../../../../src/test/data/repo/articles/includes.md';
const qpSelectionItems = [
	{ description: root.fsPath + '\\includes', label: '1.md' },
	{ description: root.fsPath + '\\includes', label: '2.md' },
	{ description: root.fsPath + '\\includes', label: '3.md' }
];

// const extendedSleepTime = 400;

// new line in current cursor position
async function insertBlankLine(editor: TextEditor) {
	await common.insertContentToEditor(editor, 'test', '\r\n');
}
function moveCursor(editor: TextEditor, y: number, x: number) {
	common.setCursorPosition(editor, y, x);
}
suite('Include Controller', () => {
	// Reset and tear down the spies
	teardown(() => {
		chai.spy.restore(common);
		chai.spy.restore(window);
	});
	suiteTeardown(async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
	});
	test('insertIncludeCommand', () => {
		const controllerCommands = [{ command: insertInclude.name, callback: insertInclude }];
		expect(insertIncludeCommand()).to.deep.equal(controllerCommands);
	});
	test('noActiveEditorMessage', async () => {
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		await insertInclude();
		expect(spy).to.have.been.called();
	});
	test('isMarkdownFileCheck', async () => {
		const filePath = resolve(__dirname, testFile);
		await loadDocumentAndGetItReady(filePath);
		const spy = chai.spy.on(common, 'isMarkdownFileCheck');
		window.showQuickPick = () => {
			return Promise.resolve('') as Thenable<any>;
		};
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		await insertInclude();
		await sleep(extendedSleepTime);
		stub.restore();
		expect(spy).to.have.been.called();
	});
	test('hasValidWorkSpaceRootPath', async () => {
		const spy = chai.spy.on(common, 'hasValidWorkSpaceRootPath');
		window.showQuickPick = () => {
			return Promise.resolve('') as Thenable<any>;
		};
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		await insertInclude();
		await sleep(extendedSleepTime);
		stub.restore();
		expect(spy).to.have.been.called();
	});
	test('Window NT - includeOneFileEmptyLine', async () => {
		const editor = window.activeTextEditor!;
		moveCursor(editor, 12, 0);
		await insertBlankLine(editor);
		moveCursor(editor, 12, 0); // move cursor back
		await sleep(extendedSleepTime);
		window.showQuickPick = () => {
			return Promise.resolve(qpSelectionItems[0]) as Thenable<any>;
		};
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		await insertInclude();
		await sleep(extendedSleepTime);
		const output = editor.document.lineAt(12).text;
		stub.restore();
		expect(output).to.equal('[!INCLUDE [1](../includes/1.md)]');
	});
	test('Window NT - includeOneFileInline', async () => {
		const editor = window.activeTextEditor!;
		moveCursor(editor, 15, 8);
		window.showQuickPick = () => {
			return Promise.resolve(qpSelectionItems[0]) as Thenable<any>;
		};
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		await insertInclude();
		await sleep(extendedSleepTime);
		const output = editor.document.lineAt(15).text;
		stub.restore();
		expect(output).to.equal(
			'Markdown[!INCLUDE [1](../includes/1.md)] is a lightweight markup language with plain text formatting syntax.' +
				' Docs supports the CommonMark standard for Markdown, plus some custom Markdown extensions designed to provide richer content on docs.microsoft.com.' +
				' This article provides an alphabetical reference for using Markdown for docs.microsoft.com.'
		);
	});
	test('Window NT - includeMultipleFiles', async () => {
		const editor = window.activeTextEditor!;
		moveCursor(editor, 16, 0);
		window.showQuickPick = () => {
			return Promise.resolve(qpSelectionItems[0]) as Thenable<any>;
		};
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		await insertInclude();
		await sleep(extendedSleepTime);
		window.showQuickPick = () => {
			return Promise.resolve(qpSelectionItems[1]) as Thenable<any>;
		};
		await insertInclude();
		await sleep(extendedSleepTime);
		window.showQuickPick = () => {
			return Promise.resolve(qpSelectionItems[2]) as Thenable<any>;
		};
		await insertInclude();
		await sleep(extendedSleepTime);
		stub.restore();
		const output = editor?.document.lineAt(16).text;
		expect(output).to.equal(
			'[!INCLUDE [1](../includes/1.md)][!INCLUDE [2](../includes/2.md)][!INCLUDE [3](../includes/3.md)]'
		);
	});
});
