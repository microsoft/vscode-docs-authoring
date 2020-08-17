import * as chai from 'chai';
import * as spies from 'chai-spies';
import { resolve } from 'path';
import { commands, window } from 'vscode';
import {
	applyCleanup,
	applyCleanupCommand
} from '../../../../controllers/cleanup/cleanup-controller';
import * as removeUnusedAssets from '../../../../controllers/cleanup/remove-unused-assets-controller';
import * as utilities from '../../../../controllers/cleanup/utilities';
import * as common from '../../../../helper/common';
import { loadDocumentAndGetItReady, sleep, sleepTime } from '../../../test.common/common';
chai.use(spies);

import sinon = require('sinon');

const expect = chai.expect;

const filePath = resolve(
	__dirname,
	'../../../../../../src/test/data/repo/articles/docs-markdown.md'
);

suite('Remove Unused Assets Controller', () => {
	// Reset and tear down the spies
	teardown(() => {
		chai.spy.restore(common);
		chai.spy.restore(window);
	});
	suiteTeardown(async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
	});
	test('cleanup repo - applyCleanupCommand', () => {
		const controllerCommands = [{ command: applyCleanup.name, callback: applyCleanup }];
		expect(applyCleanupCommand()).to.deep.equal(controllerCommands);
	});
	test('cleanup repo - getCleanUpQuickPick', async () => {
		const spy = chai.spy.on(utilities, 'getCleanUpQuickPick');
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick' as any);
		stubShowQuickPick.onCall(0).resolves('');
		await applyCleanup();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('cleanup repo - noActiveEditorMessage', async () => {
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick' as any);
		stubShowQuickPick.onCall(0).resolves('selection');
		await applyCleanup();
		await sleep(sleepTime);
		expect(spy).to.have.been.called();
		stubShowQuickPick.restore();
	});
	test('cleanup repo - unused images and includes', async () => {
		await loadDocumentAndGetItReady(filePath);
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick');
		stubShowQuickPick.onCall(0).resolves({ label: 'unused images and includes', detail: '' });
		const stubAssets = sinon.stub(removeUnusedAssets, 'removeUnusedImagesAndIncludes');
		await applyCleanup();
		await sleep(sleepTime);
		stubAssets.restore();
		sinon.assert.called(stubAssets);
		stubShowQuickPick.restore();
	});
});
