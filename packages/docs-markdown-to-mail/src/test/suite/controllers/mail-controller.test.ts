/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chai from 'chai';
import * as spies from 'chai-spies';
import { commands, workspace } from 'vscode';
import sinon = require('sinon');
import { mailerCommand, signInPrompt } from '../../../controllers/mail-controller';

chai.use(spies);
const expect = chai.expect;

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
});
