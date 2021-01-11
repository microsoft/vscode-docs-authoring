import * as assert from 'assert';
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { commands, MessageItem, window, workspace } from 'vscode';
import * as metadata from '../../../controllers/metadata-controller';
import * as common from '../../../helper/common';
import * as metadataHelper from '../../../helper/metadata';
import * as telemetry from '../../../helper/telemetry';
import * as utility from '../../../helper/utility';
import { loadDocumentAndGetItReady } from '../../test.common/common';
import { resolve } from 'path';
import sinon = require('sinon');

chai.use(spies);

const expect = chai.expect;

suite('Metadata Helper', () => {
	// eslint-disable-next-line @typescript-eslint/no-var-requires

	setup(async () => {
		sinon.stub(workspace, 'onWillSaveTextDocument');
		sinon.stub(telemetry, 'sendTelemetryData');
	});

	// Reset and tear down the spies
	teardown(async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
		chai.spy.restore(common);
		chai.spy.restore(metadata);
		sinon.restore();
	});
	test('insertMetadataCommands', () => {
		const controllerCommands = [
			{
				command: metadataHelper.disableMetadataDateReminder.name,
				callback: metadataHelper.disableMetadataDateReminder
			},
			{
				command: metadataHelper.enableMetadataDateReminder.name,
				callback: metadataHelper.enableMetadataDateReminder
			}
		];
		expect(metadataHelper.insertMetadataHelperCommands()).to.deep.equal(controllerCommands);
	});
	test('noActiveEditorMessage', async () => {
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		await commands.executeCommand('workbench.action.closeAllEditors');
		await metadataHelper.metadataDateReminder();
		expect(spy).to.have.been.called();
	});
	test('metadataDateReminder => user selects to update ms.date', async () => {
		sinon.stub(workspace, 'getConfiguration').returns({
			get: () => true,
			has: () => true,
			inspect: () => {
				return { key: '' };
			},
			update: () => Promise.resolve()
		});
		const stub = sinon.stub(metadata, 'updateMetadataDate');
		const config = workspace.getConfiguration('markdown');
		await config.update('enableMetadataDateReminder', true);
		// stub user response choosing to update the ms.date
		const stubShowInformationMessage = sinon.stub(window, 'showInformationMessage');
		stubShowInformationMessage.onCall(0).resolves(Promise.resolve('Update') as any);
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/test/metadata2.md'
		);
		await loadDocumentAndGetItReady(filePath);
		await metadataHelper.metadataDateReminder();
		assert.strictEqual(stub.callCount, 1);
		stub.restore();
		stubShowInformationMessage.restore();
	});
	test('metadataDateReminder => user selects not to update ms.date', async () => {
		sinon.stub(workspace, 'getConfiguration').returns({
			get: () => true,
			has: () => true,
			inspect: () => {
				return { key: '' };
			},
			update: () => Promise.resolve()
		});
		const stub = sinon.stub(metadata, 'updateMetadataDate');
		const config = workspace.getConfiguration('markdown');
		await config.update('enableMetadataDateReminder', true);
		// creates user response choosing not to update the ms.date
		const stubShowInformationMessage = sinon.stub(window, 'showInformationMessage');
		stubShowInformationMessage.onCall(0).resolves(Promise.resolve(undefined) as any);
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/test/metadata3.md'
		);
		await loadDocumentAndGetItReady(filePath);
		await metadataHelper.metadataDateReminder();
		assert.strictEqual(stub.callCount, 0);
		stub.restore();
		stubShowInformationMessage.restore();
	});
	test('metadataDateReminder => only remind once', async () => {
		sinon.stub(workspace, 'getConfiguration').returns({
			get: () => true,
			has: () => true,
			inspect: () => {
				return { key: '' };
			},
			update: () => Promise.resolve()
		});
		const stub = sinon.stub(utility, 'findReplacement');
		const config = workspace.getConfiguration('markdown');
		await config.update('enableMetadataDateReminder', true);
		const stubShowInformationMessage = sinon.stub(window, 'showInformationMessage');
		stubShowInformationMessage.onCall(0).resolves(Promise.resolve(undefined) as any);
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/test/metadata4.md'
		);
		await loadDocumentAndGetItReady(filePath);
		await metadataHelper.metadataDateReminder();
		assert.strictEqual(stub.callCount, 1);
		await metadataHelper.metadataDateReminder();
		// method should not have been called again as reminder was already called
		assert.strictEqual(stub.callCount, 1);
		stub.restore();
		stubShowInformationMessage.restore();
	});
	test('disableMetadataDateReminder()', async () => {
		sinon.stub(workspace, 'getConfiguration').returns({
			get: () => false,
			has: () => true,
			inspect: () => {
				return { key: '' };
			},
			update: () => Promise.resolve()
		});
		await metadataHelper.disableMetadataDateReminder();
		const config = workspace.getConfiguration('markdown');
		assert.strictEqual(config.get<boolean>('enableMetadataDateReminder'), false);
	});
	test('enableMetadataDateReminder()', async () => {
		sinon.stub(workspace, 'getConfiguration').returns({
			get: () => true,
			has: () => true,
			inspect: () => {
				return { key: '' };
			},
			update: () => Promise.resolve()
		});
		await metadataHelper.enableMetadataDateReminder();
		const config = workspace.getConfiguration('markdown');
		assert.strictEqual(config.get<boolean>('enableMetadataDateReminder'), true);
	});
});
