import * as chai from 'chai';
import { resolve } from 'path';
import { commands, window } from 'vscode';
import { previewTopic, seoPreview } from '../../../controllers/preview-controller';
import * as common from '../../../helper/common';
import * as telemetry from '../../../helper/telemetry';
import { loadDocumentAndGetItReady, sleep } from '../../test.common/common';
import * as vscode from 'vscode';

// tslint:disable-next-line: no-var-requires
import sinon = require('sinon');

const expect = chai.expect;

suite('Preview Controller', () => {
	teardown(() => {
		chai.spy.restore(common);
	});
	suiteTeardown(async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
	});
	test('previewTopicCommands', () => {
		const controllerCommands = [
			{ command: previewTopic.name, callback: previewTopic },
			{ command: seoPreview.name, callback: seoPreview }
		];
	});
	test('noActiveEditorMessage', () => {
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		previewTopic();
		expect(spy).to.have.been.called();
	});
	test('isMarkdownFileCheck', async () => {
		const filePath = resolve(__dirname, '../../../../../src/test/data/repo/articles/preview.md');
		await loadDocumentAndGetItReady(filePath);
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		const spy = chai.spy.on(common, 'isMarkdownFileCheck');
		previewTopic();
		expect(spy).to.have.been.called();
		stub.restore();
	});
	test('showPreviewToSide - checkExtension', async () => {
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		const spy = chai.spy.on(common, 'checkExtension');
		previewTopic();
		await sleep(100);
		expect(spy).to.have.been.called();
		stub.restore();
	});
	test('seoPreview - checkExtension', async () => {
		const stub = sinon.stub(telemetry, 'sendTelemetryData');
		const spy = chai.spy.on(common, 'checkExtension');
		previewTopic();
		await sleep(100);
		expect(spy).to.have.been.called();
		stub.restore();
	});
});
