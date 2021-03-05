/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { resolve } from 'path';
import { commands, window, workspace, Uri } from 'vscode';
import { sleep, sleepTime } from '../../test.common/common';
import sinon = require('sinon');
import * as mailController from './../../../controllers/mail-controller';
import {
	convertMarkdownToHtml,
	mailerCommand,
	signInPrompt
} from '../../../controllers/mail-controller';
import * as common from '../../../helper/common';

chai.use(spies);
const expect = chai.expect;

const uri = Uri.file(
	resolve(__dirname, '../../../../src/test/data/repo/articles/sample-markdown.md')
);
const contextSelectedFolder = resolve(__dirname, '../../../../src/test/data/repo/articles');

suite('Mailer Controller', () => {
	suiteSetup(() => {
		sinon.stub(workspace, 'getConfiguration').returns({
			get: () => true,
			has: () => true,
			inspect: () => {
				return { key: '' };
			},
			update: () => Promise.resolve()
		});
	});
	suiteTeardown(async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
		sinon.restore();
	});
	test('Mailer Command', () => {
		const controllerCommands = [{ command: signInPrompt.name, callback: signInPrompt }];
		expect(mailerCommand()).to.deep.equal(controllerCommands);
	});
	test('Site-relative links', async () => {
		const spy = chai.spy.on(mailController, 'convertMarkdownToHtml');
		const editor = window.activeTextEditor;
		common.setSelectorPosition(editor, 15, 12, 15, 64);
		convertMarkdownToHtml();
		await sleep(sleepTime);
		const line = editor?.document.lineAt(15).text;
		expect(line).to.equal(
			'https://review.docs.microsoft.com/help/contribute/validation-ref/alt-text-bad-value'
		);
		//expect(spy).to.have.been.called();
	});
});
