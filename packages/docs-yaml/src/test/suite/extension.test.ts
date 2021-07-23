import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import { window } from 'vscode';
import { deactivate } from '../../extension';

suite('Extension Test Suite', () => {
	window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		deactivate();

		assert.equal(-1, [1, 2, 3].indexOf(5));
		assert.equal(-1, [1, 2, 3].indexOf(0));
	});
});
