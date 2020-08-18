/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chai from 'chai';
import { resolve } from 'path';
import {
	CancellationTokenSource,
	CompletionContext,
	CompletionItem,
	CompletionItemKind,
	MarkdownString,
	Position,
	Range,
	SnippetString,
	window
} from 'vscode';
import {
	getTripleColonCompletionItems,
	tripleColonCompletionItemsProvider
} from '../../../helper/triple-colon-extensions';
import { loadDocumentAndGetItReady } from '../../test.common/common';
const expect = chai.expect;

suite('Triple Colon Extension Provider', () => {
	test('Get Extension Completion Provider Items', async () => {
		const testFile = '../../../../../src/test/data/repo/articles/triple-colon-extension.md';

		const filePath = resolve(__dirname, testFile);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor!;
		const position = new Position(16, editor.selection.active.character);
		await editor.edit(editBuilder => {
			editBuilder.insert(position, ':::');
		});
		const source = new CancellationTokenSource();
		const context: CompletionContext = {
			triggerKind: 1
		};
		const completionList = tripleColonCompletionItemsProvider.provideCompletionItems(
			editor.document,
			position,
			source.token,
			context
		);
		const completionItems = getTripleColonCompletionItems(new Range(position, position), false);
		expect(completionList).to.deep.equal(completionItems);
	});
	test('Select Image Extension Completion Provider', async () => {
		const editor = window.activeTextEditor!;
		const position = new Position(16, editor.selection.active.character);
		const source = new CancellationTokenSource();
		const context: CompletionContext = {
			triggerKind: 1
		};
		const completionItems = tripleColonCompletionItemsProvider.provideCompletionItems(
			editor.document,
			position,
			source.token,
			context
		) as CompletionItem[];
		const kind: CompletionItemKind = 11;
		const label = 'Image :::image:::';
		const completionItem = new CompletionItem(label, kind);
		completionItem.detail =
			'Output:\r\n:::image type="content" source="{source}" alt-text="{alt-text}":::';
		completionItem.documentation = new MarkdownString(
			'Use the _Image :::image:::_ extension.',
			false
		);
		completionItem.insertText = new SnippetString(
			'image type="content" source="{source}" alt-text="{alt-text}":::'
		);
		completionItem.sortText = label;
		expect(completionItems[1]).to.deep.equal(completionItem);
	});
});
