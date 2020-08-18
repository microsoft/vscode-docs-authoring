import * as chai from 'chai';
import { resolve } from 'path';
import { commands, window } from 'vscode';
import {
	collapseRelativeLinks,
	collapseRelativeLinksForEditor,
	collapseRelativeLinksForFile,
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
	test('linkControllerCommands', () => {
		const controllerCommands = [
			{ callback: collapseRelativeLinks, command: 'collapseRelativeLinks' },
			{ callback: collapseRelativeLinksInFolder, command: 'collapseRelativeLinksInFolder' }
		];
		expect(linkControllerCommands).to.deep.equal(controllerCommands);
	});
	test('noActiveEditorMessage', async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		await collapseRelativeLinks();
		expect(spy).to.have.been.called();
	});
	test('Collapse relative links for editor', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/link-controller.md'
		);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor;
		const replacements = await collapseRelativeLinksForEditor(editor.document, editor);
		expect(replacements).to.equal(3);
	});
	test('Collapse relative links for file', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/link-controller.md'
		);
		const replacements = await collapseRelativeLinksForFile(filePath, false);
		expect(replacements).to.equal(3);
	});
});
