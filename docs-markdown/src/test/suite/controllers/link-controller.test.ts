import * as chai from 'chai';
import { resolve } from 'path';
import { commands, window } from 'vscode';
import {
	collapseRelativeLinks,
	collapseRelativeLinksForEditor,
	collapseRelativeLinksInFolder,
	linkControllerCommands
} from '../../../controllers/link-controller';
import * as common from '../../../helper/common';
import { loadDocumentAndGetItReady } from '../../test.common/common';

// tslint:disable-next-line: no-var-requires
const expect = chai.expect;

suite('Link Controller', () => {
	// Reset and tear down the spies
	teardown(() => chai.spy.restore(common));
	suiteTeardown(async () => await commands.executeCommand('workbench.action.closeAllEditors'));
	test('italicFormattingCommand', () => {
		const controllerCommands = [
			{ callback: collapseRelativeLinks, command: 'collapseRelativeLinks' },
			{ callback: collapseRelativeLinksInFolder, command: 'collapseRelativeLinksInFolder' }
		];
		expect(linkControllerCommands).to.deep.equal(controllerCommands);
	});
	test('noActiveEditorMessage', async () => {
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		await collapseRelativeLinksForEditor(null);
		expect(spy).to.have.been.called();
	});
	test('Collapse relative links', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/link-controller.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const replacements = await collapseRelativeLinksForEditor(window.activeTextEditor);
		expect(replacements).to.equal(3);
	});
});
