import * as chai from 'chai';
import * as spies from 'chai-spies';
import { resolve } from 'path';
import { commands, window } from 'vscode';
import {
	insertBookmarkCommands,
	insertBookmarkExternal,
	insertBookmarkInternal
} from '../../../controllers/bookmark-controller';
import * as common from '../../../helper/common';
import * as telemetry from '../../../helper/telemetry';
import { loadDocumentAndGetItReady, sleep, sleepTime } from '../../test.common/common';

chai.use(spies);

import sinon = require('sinon');

const expect = chai.expect;

suite('Bookmark Controller', () => {
	// Reset and tear down the spies
	suiteSetup(async () => {
		sinon.stub(telemetry, 'sendTelemetryData');
	});
	teardown(() => {
		chai.spy.restore(common);
		chai.spy.restore(window);
	});
	suiteTeardown(async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
		sinon.restore();
	});
	test('insertBookmarkCommands', () => {
		const controllerCommands = [
			{
				command: insertBookmarkExternal.name,
				callback: insertBookmarkExternal
			},
			{
				command: insertBookmarkInternal.name,
				callback: insertBookmarkInternal
			}
		];
		expect(insertBookmarkCommands()).to.deep.equal(controllerCommands);
	});
	test('insertBookmarkExternal::noActiveEditorMessage', async () => {
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		await insertBookmarkExternal();
		expect(spy).to.have.been.called();
	});
	test('insertBookmarkExternal::insertContentToEditor', async () => {
		const filePath = resolve(__dirname, '../../../../../src/test/data/repo');
		await loadDocumentAndGetItReady(`${filePath}/articles/bookmark.md`);
		const qpSelectionItems = [
			{ label: 'README.md', description: filePath },
			{ label: '## Getting Started\r\n', description: ' ' }
		];
		let counter = 0;
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves(qpSelectionItems[counter++]);
		stubShowQuickPick.onCall(1).resolves(qpSelectionItems[counter++]);
		const spy = chai.spy.on(common, 'insertContentToEditor');
		await insertBookmarkExternal();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('insertBookmarkInternal::no headings', async () => {
		const filePath = resolve(__dirname, '../../../../../src/test/data/repo/articles/bookmark.md');
		await loadDocumentAndGetItReady(filePath);
		const spy = chai.spy.on(window, 'showErrorMessage');
		await insertBookmarkInternal();
		expect(spy).to.have.been.called();
	});
	test('insertBookmarkInternal::insertContentToEditor', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({
			label: '### Third Level Heading\r\n',
			detail: ' '
		});
		const spy = chai.spy.on(common, 'insertContentToEditor');
		insertBookmarkInternal();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
	});
});
