import * as assert from 'assert';
import * as chai from 'chai';
import * as utility from '../../../helper/utility';
import * as os from 'os';
import sinon = require('sinon');
import { workspace, window } from 'vscode';
import { resolve } from 'path';
import { loadDocumentAndGetItReady, sleep } from '../../test.common/common';
import common = require('mocha/lib/interfaces/common');
import { toShortDate } from '../../../helper/common';
import { findReplacement } from '../../../helper/utility';

const expect = chai.expect;

suite('Utility helper class', () => {
	test('inferLanguageFromFileExtension returns null when not found', () => {
		const lang = utility.inferLanguageFromFileExtension('.foobar');
		expect(lang).to.be.equal(null);
	});
	test('inferLanguageFromFileExtension returns correct language when found', () => {
		const lang = utility.inferLanguageFromFileExtension('.ts');
		expect(lang ? lang.language : '').to.be.equal('TypeScript');
	});
	test('videoLinkBuilder returns triple colon video', () => {
		workspace.getConfiguration = () => {
			return {
				get: () => true,
				has: () => true,
				inspect: () => {
					return { key: '' };
				},
				update: () => Promise.resolve()
			};
		};
		const videoLink = utility.videoLinkBuilder(
			'https://channel9.msdn.com/Series/Youve-Got-Key-Values-A-Redis-Jump-Start/03/player'
		);
		expect(videoLink).to.be.equal(
			`:::video source="https://channel9.msdn.com/Series/Youve-Got-Key-Values-A-Redis-Jump-Start/03/player":::`
		);
	});
	test('inferLanguageFromFileExtension returns correct language when found', () => {
		const lang = utility.inferLanguageFromFileExtension('.ts');
		expect(lang ? lang.language : '').to.be.equal('TypeScript');
	});
	test('findReplacement()', async () => {
		const filePath = resolve(__dirname, '../../../../../src/test/data/repo/articles/utility.md');
		await loadDocumentAndGetItReady(filePath);

		const editor = window.activeTextEditor;
		const replacementValue = 'ms.date: ' + toShortDate(new Date());

		const replacement = findReplacement(
			editor.document,
			editor.document.getText(),
			replacementValue,
			/ms.date:\s*\b(.+?)$/im
		);

		const startLine = 2;
		const endLine = 2;
		const startPost = 0;
		let endPos = 22;
		if (os.type() === 'Darwin') {
			endPos--;
		}

		assert.equal(replacement.selection.active.line, startLine);
		assert.equal(replacement.selection.active.character, endPos);
		assert.equal(replacement.selection.start.line, startLine);
		assert.equal(replacement.selection.start.character, startPost);
		assert.equal(replacement.selection.end.line, endLine);
		assert.equal(replacement.selection.end.character, endPos);
		assert.equal(replacement.value, replacementValue);
	});
});
