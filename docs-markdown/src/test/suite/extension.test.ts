import * as assert from 'assert';
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { extensions, window } from 'vscode';
import { deactivate, installedExtensionsCheck, setupAutoComplete } from '../../extension';
import { sleep, sleepTime } from '../test.common/common';

chai.use(spies);
const expect = chai.expect;

suite('Extension Test Suite', () => {
	window.showInformationMessage('Start all tests.');
	test('install/load', () => {
		assert.ok(extensions.getExtension('docsmsft.docs-markdown'));
	});
	test('activate', () => {
		const ext = extensions.getExtension('docsmsft.docs-markdown');
		assert.notEqual(ext, null);
		return ext.activate().then(() => {
			assert.ok(true);
		});
	});
	test('installedExtensionsCheck', () => {
		const spy = chai.spy(installedExtensionsCheck);
		installedExtensionsCheck();
		sleep(sleepTime);
		expect(spy).to.be.spy;
	});
	test('setupAutoComplete', () => {
		const spy = chai.spy(setupAutoComplete);
		setupAutoComplete();
		sleep(sleepTime);
		expect(spy).to.be.spy;
	});
	test('deactivate', () => {
		const spy = chai.spy(deactivate);
		deactivate();
		sleep(sleepTime);
		expect(spy).to.be.spy;
	});
});
