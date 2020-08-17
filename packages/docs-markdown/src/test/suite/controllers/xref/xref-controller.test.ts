/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as assert from 'assert';
import Axios from 'axios';
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { resolve } from 'path';
import { commands, QuickPickItem, window } from 'vscode';
import * as common from '../../../../helper/common';
import * as telemetry from '../../../../helper/telemetry';
import { loadDocumentAndGetItReady, sleep, sleepTime } from '../../../test.common/common';
import { applyXref, applyXrefCommand } from '../../../../controllers/xref/xref-controller';
import * as xrefHelper from '../../../../controllers/xref/xref-helper';
import * as httpHelper from '../../../../helper/http-helper';
import { getXrefSelection, getXrefDisplayProperty } from '../../../../controllers/xref/xref-helper';
chai.use(spies);

import sinon = require('sinon');
import { encodeSpecialXrefCharacters } from '../../../../controllers/xref/utilities';

const expect = chai.expect;

suite('Xref Controller', () => {
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
	test('applyXrefCommand', () => {
		const controllerCommands = [{ command: applyXref.name, callback: applyXref }];
		expect(applyXrefCommand()).to.deep.equal(controllerCommands);
	});
	test('noActiveEditorMessage', async () => {
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		applyXref();
		expect(spy).to.have.been.called();
	});
	test('isMarkdownFileCheck', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../../src/test/data/repo/articles/yaml-controller.yml'
		);
		await loadDocumentAndGetItReady(filePath);
		const spy = chai.spy.on(common, 'isMarkdownFileCheck');
		await applyXref();
		expect(spy).to.have.been.called();
	});
	test('applyXref is called', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../../src/test/data/repo/articles/xref-controller.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const stubGetXrefDisplayProperty = sinon.stub(xrefHelper, 'getXrefDisplayProperty');
		stubGetXrefDisplayProperty
			.onCall(0)
			.resolves(Promise.resolve({ description: 'None (default)', label: 'none' }));
		const stubGetXrefSelection = sinon.stub(xrefHelper, 'getXrefSelection');
		stubGetXrefSelection.onCall(0).resolves(Promise.resolve({ label: 'System.String' }));
		await applyXref();
		await sleep(sleepTime);
		const expectedText = '<xref:System.String>';
		const editor = window.activeTextEditor;
		const actualText = editor?.document.getText();
		assert.equal(expectedText, actualText);
		stubGetXrefDisplayProperty.restore();
		stubGetXrefSelection.restore();
	});
	test('xref-helper - getXrefSelection', async () => {
		const data = [{ tags: {}, uid: 'System.String' }];
		const resolved = new Promise(r => r({ data }));
		const stubAxios = sinon.stub(Axios, 'get').returns(resolved);

		const stubShowInputBox = sinon.stub(window, 'showInputBox').resolves('System.String');

		const spy = chai.spy.on(httpHelper, 'getAsync');
		await getXrefSelection();
		expect(spy).to.have.been.called();
		stubAxios.restore();
		stubShowInputBox.restore();
	});
	test('xref-helper - getXrefDisplayProperty', async () => {
		const showQuickPick = {
			description: 'None (default)',
			label: 'none'
		};
		const stubShowQuickPick = sinon.stub(window, 'showQuickPick').resolves(showQuickPick);

		const quickPick = await getXrefDisplayProperty();
		expect(quickPick).to.deep.equals(showQuickPick);
		stubShowQuickPick.restore();
	});
	test('utilities - encodeSpecialXrefCharacters', async () => {
		const content = '*#`';
		const output = encodeSpecialXrefCharacters(content);
		expect(output).to.equals('%2A%23%60');
	});
});
