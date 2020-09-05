/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as assert from 'assert';
import Axios from 'axios';
import * as chai from 'chai';
import * as spies from 'chai-spies';
import * as os from 'os';
import { resolve, relative } from 'path';
import { commands, QuickPickItem, window, ExtensionContext, Uri } from 'vscode';
import * as common from '../../../helper/common';
import * as utility from '../../../helper/utility';
import * as telemetry from '../../../helper/telemetry';
import {
	loadDocumentAndGetItReady,
	sleep,
	extendedSleepTime,
	sleepTime
} from '../../test.common/common';

chai.use(spies);
import path = require('path');

import sinon = require('sinon');
import {
	insertSnippetCommand,
	insertSnippet
} from '../../../controllers/snippet/snippet-controller';

const expect = chai.expect;

suite('Snippet Controller', () => {
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
	test('insertSnippetCommand', () => {
		const controllerCommands = [{ command: insertSnippet.name, callback: insertSnippet }];
		expect(insertSnippetCommand()).to.deep.equal(controllerCommands);
	});
	test('insertSnippet - noActiveEditorMessage has been called', async () => {
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		insertSnippet();
		expect(spy).to.have.been.called();
	});
	test('insertSnippet - isValidEditor', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/snippet-controller.md'
		);
		await loadDocumentAndGetItReady(filePath);

		const spy = chai.spy.on(common, 'isValidEditor');
		insertSnippet();
		expect(spy).to.have.been.called();
	});
	test('insertSnippet - isMarkdownFileCheck has been called', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/snippet-controller.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const spy = chai.spy.on(common, 'isMarkdownFileCheck');
		insertSnippet();
		expect(spy).to.have.been.called();
	});
	test('insertSnippet - hasValidWorkSpaceRootPath has been called', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/snippet-controller.md'
		);
		await loadDocumentAndGetItReady(filePath);

		const spy = chai.spy.on(common, 'hasValidWorkSpaceRootPath');
		insertSnippet();
		expect(spy).to.have.been.called();
	});
	test('insertSnippet - search has been called', async () => {
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const quickPickItem: QuickPickItem = {
			label: 'Full Search',
			description: 'Look in all directories for snippet'
		};
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/snippet-controller.md'
		);
		stubShowQuickPick.onCall(0).resolves(quickPickItem);
		const stubShowInputBox = sinon.stub(window, 'showInputBox');
		stubShowInputBox.onCall(0).resolves('');
		await loadDocumentAndGetItReady(filePath);

		const spy = chai.spy.on(utility, 'search');
		await insertSnippet();
		await sleep(extendedSleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
		stubShowInputBox.restore();
	});
	test('insertSnippet - search - Full Search', async () => {
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		const fullSearchQuickPickItem: QuickPickItem = {
			label: 'Full Search',
			description: 'Look in all directories for snippet'
		};
		const testFile = 'ca1021-avoid-out-parameters_1.cs';
		const selectedFileQuickPickItem: QuickPickItem = {
			label: testFile,
			description: path.resolve(
				__dirname,
				'../../../../../src/test/data/repo/articles/snippet/CSharp/' + testFile
			)
		};
		const idOrRangeQuickPickItem: QuickPickItem = {
			label: 'Id',
			description: 'Select code by id tag (for example: <Snippet1>)'
		};
		stubShowQuickPick.onCall(0).resolves(fullSearchQuickPickItem);
		stubShowQuickPick.onCall(1).resolves(selectedFileQuickPickItem);
		stubShowQuickPick.onCall(2).resolves(idOrRangeQuickPickItem);
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/snippet-controller.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubShowInputBox = sinon.stub(window, 'showInputBox');
		stubShowInputBox.onCall(0).resolves('.cs');
		stubShowInputBox.onCall(1).resolves('tag');
		const spy = chai.spy.on(utility, 'search');
		await insertSnippet();
		await sleep(extendedSleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
		stubShowInputBox.restore();
	});
});
