import * as chai from 'chai';
import {
	insertNotebook,
	updateNotebook,
	notebookControllerCommands,
	toRaw,
	toUrl
} from '../../../controllers/notebook-controller';
import { commands } from 'vscode';
import * as common from '../../../helper/common';

// tslint:disable-next-line: no-var-requires
const expect = chai.expect;

suite('Notebook Controller', () => {
	teardown(() => chai.spy.restore(common));

	suiteTeardown(async () => await commands.executeCommand('workbench.action.closeAllEditors'));

	test('notebookControllerCommands', () => {
		const controllerCommands = [
			{ command: 'insertNotebook', callback: insertNotebook },
			{ command: 'updateNotebook', callback: updateNotebook }
		];
		expect(notebookControllerCommands).to.deep.equal(controllerCommands);
	});

	test('insertNotebook shows noActiveEditorMessage', async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		await insertNotebook();
		expect(spy).to.have.been.called();
	});

	test('updateNotebook shows noActiveEditorMessage', async () => {
		await commands.executeCommand('workbench.action.closeAllEditors');
		const spy = chai.spy.on(common, 'noActiveEditorMessage');
		await updateNotebook();
		expect(spy).to.have.been.called();
	});

	test('toRaw correctly convert from base URL to raw URL', async () => {
		const expected =
			'https://raw.githubusercontent.com/Azure/MachineLearningNotebooks/master/tutorials/create-first-ml-experiment/tutorial-1st-experiment-sdk-train.ipynb';

		expect(
			toRaw(
				'https://github.com/Azure/MachineLearningNotebooks/blob/master/tutorials/create-first-ml-experiment/tutorial-1st-experiment-sdk-train.ipynb'
			)
		).to.equal(expected);

		expect(toRaw(expected)).to.equal(expected);
	});

	test('toUrl correctly converts from raw URL to base URL', async () => {
		const expected =
			'https://github.com/Azure/MachineLearningNotebooks/blob/master/tutorials/create-first-ml-experiment/tutorial-1st-experiment-sdk-train.ipynb';

		expect(
			toUrl(
				'https://raw.githubusercontent.com/Azure/MachineLearningNotebooks/master/tutorials/create-first-ml-experiment/tutorial-1st-experiment-sdk-train.ipynb'
			)
		).to.equal(expected);

		expect(toUrl(expected)).to.equal(expected);
	});
});
