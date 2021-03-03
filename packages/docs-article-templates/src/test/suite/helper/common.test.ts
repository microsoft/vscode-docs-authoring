/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chai from 'chai';
import { window } from 'vscode';
import { postWarning, postInformation, postError, showStatusMessage } from '../../../helper/common';

const expect = chai.expect;

suite('Common', () => {
	test('postWarning showWarning is called', async () => {
		const spy = chai.spy(window.showWarningMessage);
		postWarning('message');
		expect(spy).to.be.have.been.called;
	});
	test('postInformation showInformation is called', async () => {
		const spy = chai.spy(window.showInformationMessage);
		postInformation('message');
		expect(spy).to.be.have.been.called;
	});
	test('postError showErrorMessage is called', async () => {
		const spy = chai.spy(window.showErrorMessage);
		postError('message');
		expect(spy).to.be.have.been.called;
	});
	test('showStatusMessage is called', async () => {
		const output = window.createOutputChannel('docs-article-templates');
		const spy = chai.spy(output.appendLine);
		showStatusMessage('message');
		expect(spy).to.be.have.been.called;
	});
});
