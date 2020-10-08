import * as chai from 'chai';
import * as spies from 'chai-spies';
import { resolve } from 'path';
import { commands, window, Selection } from 'vscode';
import {
	sortSelectionAscending,
	sortSelectionDescending,
	insertSortSelectionCommands
} from '../../../controllers/sort-controller';
import * as common from '../../../helper/common';
import * as telemetry from '../../../helper/telemetry';
import { loadDocumentAndGetItReady, sleep } from '../../test.common/common';

chai.use(spies);

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sinon = require('sinon');
const expect = chai.expect;

suite('Sort Controller', () => {
	teardown(() => {
		chai.spy.restore(common);
	});
	suiteTeardown(async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
	});
	test('insertSortSelectionCommands', () => {
		const controllerCommands = [
			{
				command: sortSelectionAscending.name,
				callback: sortSelectionAscending
			},
			{
				command: sortSelectionDescending.name,
				callback: sortSelectionDescending
			}
		];
		expect(insertSortSelectionCommands()).to.deep.equal(controllerCommands);
	});
	test('noActiveEditorMessage', () => {
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		sortSelectionAscending();
		expect(spy).to.have.been.called();
	});
	test('Sort Selection Ascending', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		common.setSelectorPosition(editor, 3, 0, 6, 19);
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		sortSelectionAscending();
		await sleep(100);
		const line3 = editor?.document.lineAt(3).text;
		const line4 = editor?.document.lineAt(4).text;
		const line5 = editor?.document.lineAt(5).text;
		const line6 = editor?.document.lineAt(6).text;
		stub.restore();

		expect(line3).to.equal('author: meganbradley');
		expect(line4).to.equal(
			'description: The OPS platform guide to Markdown and DocFX Flavored Markdown (DFM) extensions.'
		);
		expect(line5).to.equal('ms.author: mbradley');
		expect(line6).to.equal('title: Docs Markdown reference');
	});
	test('Sort Selection Descending', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		common.setSelectorPosition(editor, 3, 0, 6, 19);
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		sortSelectionDescending();
		await sleep(100);
		const line3 = editor?.document.lineAt(3).text;
		const line4 = editor?.document.lineAt(4).text;
		const line5 = editor?.document.lineAt(5).text;
		const line6 = editor?.document.lineAt(6).text;
		stub.restore();

		expect(line3).to.equal('title: Docs Markdown reference');
		expect(line4).to.equal('ms.author: mbradley');
		expect(line5).to.equal(
			'description: The OPS platform guide to Markdown and DocFX Flavored Markdown (DFM) extensions.'
		);
		expect(line6).to.equal('author: meganbradley');
	});
});
