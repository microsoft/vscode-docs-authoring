import * as chai from 'chai';
import * as spies from 'chai-spies';
import * as os from 'os';
import { resolve } from 'path';
import { commands, Position, Range, Selection, Uri, window } from 'vscode';
import * as capitalizationOfMetadata from '../../../../controllers/cleanup/capitalizationOfMetadata';
import {
	applyCleanup,
	applyCleanupCommand,
	applyCleanupFile,
	applyCleanupFolder
} from '../../../../controllers/cleanup/cleanup-controller';
import * as singleValuedMetadata from '../../../../controllers/cleanup/handleSingleValuedMetadata';
import * as microsoftLinks from '../../../../controllers/cleanup/microsoftLinks';
import * as removeEmptyMetadata from '../../../../controllers/cleanup/removeEmptyMetadata';
import * as utilities from '../../../../controllers/cleanup/utilities';
import * as masterRedirection from '../../../../controllers/redirects/generateRedirectionFile';
import * as common from '../../../../helper/common';
import * as telemetry from '../../../../helper/telemetry';
import {
	extendedSleepTime,
	loadDocumentAndGetItReady,
	sleep,
	sleepTime
} from '../../../test.common/common';
chai.use(spies);

import sinon = require('sinon');

const expect = chai.expect;
const filePath = resolve(
	__dirname,
	'../../../../../../src/test/data/repo/articles/docs-markdown.md'
);
const folderPath = resolve(__dirname, '../../../../../../src/test/data/repo/articles');

suite('Cleanup Controller', () => {
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
	test('cleanup repo - applyCleanupCommand', () => {
		const controllerCommands = [{ command: applyCleanup.name, callback: applyCleanup }];
		expect(applyCleanupCommand()).to.deep.equal(controllerCommands);
	});
	test('cleanup repo - getCleanUpQuickPick', async () => {
		const spy = chai.spy.on(utilities, 'getCleanUpQuickPick');
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves('');
		await applyCleanup();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('cleanup repo - noActiveEditorMessage', async () => {
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves('selection');
		await applyCleanup();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('cleanup repo - master redirection file', async () => {
		await loadDocumentAndGetItReady(filePath);

		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({ label: 'master redirection file', detail: '' });
		const spy = chai.spy.on(masterRedirection, 'generateMasterRedirectionFile');
		await applyCleanup();
		await sleep(sleepTime);
		stubShowQuickPick.restore();
		expect(spy).to.have.been.called();
	});
	test('cleanup folder - single-valued metadata (recursive folders)', async () => {
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({ label: 'single-valued metadata', detail: '' });
		const markdown = resolve(
			__dirname,
			'../../../../../../src/test/data/repo/articles/test/cleanup-test.md'
		);
		await loadDocumentAndGetItReady(markdown);
		await applyCleanupFolder(
			Uri.file(resolve(__dirname, '../../../../../../src/test/data/repo/articles/test'))
		);
		await sleep(400);
		const actualText = window.activeTextEditor?.document.getText();
		const expectedText = '---' + os.EOL + 'ms.author: "foo"' + os.EOL + '---' + os.EOL;
		// cleanup the modified *.md to prevent false positives for future tests.
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { exec } = require('child_process');
		exec('cd ' + __dirname + ' && git checkout ' + markdown);
		chai.assert.equal(expectedText, actualText);
		stubShowQuickPick.restore();
	});
	test('cleanup repo - recurseCallback - microsoft links', async () => {
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({ label: 'microsoft links', detail: '' });
		const spy = chai.spy.on(utilities, 'recurseCallback');
		await applyCleanup();
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('cleanup repo - recurseCallback - capitalization of metadata values', async () => {
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick
			.onCall(0)
			.resolves({ label: 'capitalization of metadata values', detail: '' });
		const spy = chai.spy.on(utilities, 'recurseCallback');
		await applyCleanup();
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('cleanup repo - empty metadata - empty values', async () => {
		await loadDocumentAndGetItReady(filePath);
		const mockShowQuickPick = sinon.stub(window, 'showQuickPick');
		mockShowQuickPick.onFirstCall().resolves({ label: 'empty metadata', detail: '' });
		mockShowQuickPick
			.onSecondCall()
			.resolves({ label: 'remove metadata attributes with empty values', detail: '' });
		const spy = chai.spy.on(removeEmptyMetadata, 'removeEmptyMetadata');
		await applyCleanup();
		await sleep(extendedSleepTime);
		mockShowQuickPick.restore();
		expect(spy).to.have.been.called();
	});
	test('cleanup repo - empty metadata - n/a', async () => {
		await loadDocumentAndGetItReady(filePath);
		const mockShowQuickPick = sinon.stub(window, 'showQuickPick');
		mockShowQuickPick.onFirstCall().resolves({ label: 'empty metadata', detail: '' });
		mockShowQuickPick
			.onSecondCall()
			.resolves({ label: `remove metadata attributes with "na" or "n/a"`, detail: '' });
		const spy = chai.spy.on(removeEmptyMetadata, 'removeEmptyMetadata');
		await applyCleanup();
		await sleep(extendedSleepTime);
		mockShowQuickPick.restore();
		expect(spy).to.have.been.called();
	});
	test('cleanup repo - empty metadata - commented', async () => {
		await loadDocumentAndGetItReady(filePath);
		const mockShowQuickPick = sinon.stub(window, 'showQuickPick');
		mockShowQuickPick.onFirstCall().resolves({ label: 'empty metadata', detail: '' });
		mockShowQuickPick
			.onSecondCall()
			.resolves({ label: 'remove commented out metadata attributes', detail: '' });
		const spy = chai.spy.on(removeEmptyMetadata, 'removeEmptyMetadata');
		await applyCleanup();
		await sleep(extendedSleepTime);
		mockShowQuickPick.restore();
		expect(spy).to.have.been.called();
	});
	test('cleanup repo - empty metadata - all', async () => {
		await loadDocumentAndGetItReady(filePath);
		const mockShowQuickPick = sinon.stub(window, 'showQuickPick');
		mockShowQuickPick.onFirstCall().resolves({ label: 'empty metadata', detail: '' });
		mockShowQuickPick.onSecondCall().resolves({ label: 'remove all', detail: '' });
		const spy = chai.spy.on(removeEmptyMetadata, 'removeEmptyMetadata');
		await applyCleanup();
		await sleep(extendedSleepTime);
		mockShowQuickPick.restore();
		expect(spy).to.have.been.called();
	});
	test('cleanup file - getCleanUpQuickPick', async () => {
		const spy = chai.spy.on(utilities, 'getCleanUpQuickPick');
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves('');
		await applyCleanupFile(Uri.file(filePath));
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('cleanup file - single-valued metadata', async () => {
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({ label: 'single-valued metadata', detail: '' });
		const spy = chai.spy.on(singleValuedMetadata, 'handleSingleValuedMetadata');
		await applyCleanupFile(Uri.file(filePath));
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('cleanup file - microsoft links', async () => {
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({ label: 'microsoft links', detail: '' });
		const spy = chai.spy.on(microsoftLinks, 'microsoftLinks');
		await applyCleanupFile(Uri.file(filePath));
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('cleanup file - capitalization of metadata values', async () => {
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick
			.onCall(0)
			.resolves({ label: 'capitalization of metadata values', detail: '' });
		const spy = chai.spy.on(capitalizationOfMetadata, 'capitalizationOfMetadata');
		await applyCleanupFile(Uri.file(filePath));
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('cleanup file - empty metadata - empty values', async () => {
		const mockShowQuickPick = sinon.stub(window, 'showQuickPick');
		mockShowQuickPick.onFirstCall().resolves({ label: 'empty metadata', detail: '' });
		mockShowQuickPick
			.onSecondCall()
			.resolves({ label: 'remove metadata attributes with empty values', detail: '' });
		const spy = chai.spy.on(removeEmptyMetadata, 'removeEmptyMetadata');
		await applyCleanupFile(Uri.file(filePath));
		mockShowQuickPick.restore();
		expect(spy).to.have.been.called();
	});
	test('cleanup file - empty metadata - n/a', async () => {
		const mockShowQuickPick = sinon.stub(window, 'showQuickPick');
		mockShowQuickPick.onFirstCall().resolves({ label: 'empty metadata', detail: '' });
		mockShowQuickPick
			.onSecondCall()
			.resolves({ label: `remove metadata attributes with "na" or "n/a"`, detail: '' });
		const spy = chai.spy.on(removeEmptyMetadata, 'removeEmptyMetadata');
		await applyCleanupFile(Uri.file(filePath));
		mockShowQuickPick.restore();
		expect(spy).to.have.been.called();
	});
	test('cleanup file - empty metadata - commented', async () => {
		const mockShowQuickPick = sinon.stub(window, 'showQuickPick');
		mockShowQuickPick.onFirstCall().resolves({ label: 'empty metadata', detail: '' });
		mockShowQuickPick
			.onSecondCall()
			.resolves({ label: 'remove commented out metadata attributes', detail: '' });
		const spy = chai.spy.on(removeEmptyMetadata, 'removeEmptyMetadata');
		await applyCleanupFile(Uri.file(filePath));
		mockShowQuickPick.restore();
		expect(spy).to.have.been.called();
	});
	test('cleanup file - empty metadata - all', async () => {
		const mockShowQuickPick = sinon.stub(window, 'showQuickPick');
		mockShowQuickPick.onFirstCall().resolves({ label: 'empty metadata', detail: '' });
		mockShowQuickPick.onSecondCall().resolves({ label: 'remove all', detail: '' });
		const spy = chai.spy.on(removeEmptyMetadata, 'removeEmptyMetadata');
		await applyCleanupFile(Uri.file(filePath));
		mockShowQuickPick.restore();
		expect(spy).to.have.been.called();
	});
	test('cleanup folder - getCleanUpQuickPick', async () => {
		const spy = chai.spy.on(utilities, 'getCleanUpQuickPick');
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves('');
		await applyCleanupFolder(Uri.file(folderPath));
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('cleanup folder - single-valued metadata', async () => {
		const mockShowQuickPick = sinon.stub(window, 'showQuickPick');
		mockShowQuickPick.onFirstCall().resolves({ label: 'single-valued metadata', detail: '' });
		const spy = chai.spy.on(singleValuedMetadata, 'handleSingleValuedMetadata');
		await applyCleanupFolder(Uri.file(folderPath));
		await sleep(extendedSleepTime);
		expect(spy).to.have.been.called();
		mockShowQuickPick.restore();
	});
	test('cleanup folder - microsoft links', async () => {
		const mockShowQuickPick = sinon.stub(window, 'showQuickPick');
		mockShowQuickPick.onFirstCall().resolves({ label: 'microsoft links', detail: '' });
		const spy = chai.spy.on(microsoftLinks, 'microsoftLinks');
		await applyCleanupFolder(Uri.file(folderPath));
		await sleep(extendedSleepTime);
		expect(spy).to.have.been.called();
		mockShowQuickPick.restore();
	});
	test('cleanup folder - capitalization of metadata values', async () => {
		const mockShowQuickPick = sinon.stub(window, 'showQuickPick');
		mockShowQuickPick
			.onFirstCall()
			.resolves({ label: 'capitalization of metadata values', detail: '' });
		const spy = chai.spy.on(capitalizationOfMetadata, 'capitalizationOfMetadata');
		await applyCleanupFolder(Uri.file(folderPath));
		await sleep(extendedSleepTime);
		expect(spy).to.have.been.called();
		mockShowQuickPick.restore();
	});
	test('cleanup folder - empty metadata - empty values', async () => {
		const mockShowQuickPick = sinon.stub(window, 'showQuickPick');
		mockShowQuickPick.onFirstCall().resolves({ label: 'empty metadata', detail: '' });
		mockShowQuickPick
			.onSecondCall()
			.resolves({ label: 'remove metadata attributes with empty values', detail: '' });
		const spy = chai.spy.on(removeEmptyMetadata, 'removeEmptyMetadata');
		await applyCleanupFolder(Uri.file(folderPath));
		await sleep(extendedSleepTime);
		mockShowQuickPick.restore();
		expect(spy).to.have.been.called();
	});
	test('cleanup folder - empty metadata - n/a', async () => {
		const mockShowQuickPick = sinon.stub(window, 'showQuickPick');
		mockShowQuickPick.onFirstCall().resolves({ label: 'empty metadata', detail: '' });
		mockShowQuickPick
			.onSecondCall()
			.resolves({ label: `remove metadata attributes with "na" or "n/a"`, detail: '' });
		const spy = chai.spy.on(removeEmptyMetadata, 'removeEmptyMetadata');
		await applyCleanupFolder(Uri.file(folderPath));
		await sleep(extendedSleepTime);
		mockShowQuickPick.restore();
		expect(spy).to.have.been.called();
	});
	test('cleanup folder - empty metadata - commented', async () => {
		const mockShowQuickPick = sinon.stub(window, 'showQuickPick');
		mockShowQuickPick.onFirstCall().resolves({ label: 'empty metadata', detail: '' });
		mockShowQuickPick
			.onSecondCall()
			.resolves({ label: 'remove commented out metadata attributes', detail: '' });
		const spy = chai.spy.on(removeEmptyMetadata, 'removeEmptyMetadata');
		await applyCleanupFolder(Uri.file(folderPath));
		await sleep(extendedSleepTime);
		mockShowQuickPick.restore();
		expect(spy).to.have.been.called();
	});
	test('cleanup folder - empty metadata - all', async () => {
		const mockShowQuickPick = sinon.stub(window, 'showQuickPick');
		mockShowQuickPick.onFirstCall().resolves({ label: 'empty metadata', detail: '' });
		mockShowQuickPick.onSecondCall().resolves({ label: 'remove all', detail: '' });
		const spy = chai.spy.on(removeEmptyMetadata, 'removeEmptyMetadata');
		await applyCleanupFolder(Uri.file(folderPath));
		await sleep(extendedSleepTime);
		mockShowQuickPick.restore();
		expect(spy).to.have.been.called();
	});
	test('dirty doc - skips cleanup', async () => {
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({ label: 'single-valued metadata', detail: '' });
		const markdown = resolve(
			__dirname,
			'../../../../../../src/test/data/repo/markdown-stubs/cleanup-test.md'
		);
		await loadDocumentAndGetItReady(markdown);
		const editor = window.activeTextEditor;
		const content = 'some_content';
		await common.insertContentToEditor(
			editor,
			content,
			true,
			new Selection(new Position(5, 0), new Position(5, 6))
		);
		await applyCleanupFolder(
			Uri.file(resolve(__dirname, '../../../../../../src/test/data/repo/markdown-stubs'))
		);
		await sleep(400);
		const actualText = window.activeTextEditor?.document.getText();
		const expectedText = '---' + os.EOL + 'ms.author: ["foo"]' + os.EOL + '---' + os.EOL + content;
		// cleanup the modified *.md to prevent false positives for future tests.
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { exec } = require('child_process');
		exec('cd ' + __dirname + ' && git checkout ' + markdown);
		chai.assert.equal(expectedText, actualText);
		stubShowQuickPick.restore();
	});
});
