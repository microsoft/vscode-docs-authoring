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
	window,
	ExtensionContext,
	Uri
} from 'vscode';
import { loadDocumentAndGetItReady } from '../../test.common/common';
import {
	msProdCompletionItemsProvider,
	getMsProdMetadataCompletionItems,
	getMsServiceMetadataCompletionItems,
	msServiceCompletionItemsProvider,
	msTechnologyCompletionItemsProvider,
	getMsTechnologyMetadataCompletionItems,
	msSubServiceCompletionItemsProvider,
	getMsSubServiceMetadataCompletionItems
} from '../../../helper/metadata-completion';
const expect = chai.expect;

interface Subscription {
	dispose(): any;
}
interface EnvironmentalMutator {
	type: any;
	value: any;
}
const uri = resolve(__dirname, '../../../../../src/test/data/repo/articles/common.md');
let environmentalMutator: EnvironmentalMutator;
let subscriptions: Subscription[];

export const context: ExtensionContext = {
	globalState: {
		get: key => [{ label: 'azure' }],
		update: (key, value) => Promise.resolve()
	},
	subscriptions,
	workspaceState: {
		get: () => {},
		update: (key, value) => Promise.resolve()
	},
	extensionPath: '',
	asAbsolutePath: relative => '',
	storagePath: '',
	globalStoragePath: '',
	logPath: '',
	extensionUri: Uri.parse(uri),
	environmentVariableCollection: {
		persistent: false,
		replace: (variable, value) => {},
		append: (variable, value) => {},
		prepend: (variable, value) => {},
		get: variable => environmentalMutator,
		forEach: () => {},
		clear: () => {},
		delete: () => {}
	}
};

suite('Metadata Provider', () => {
	test('ms.prod Metadata Completion Provider Items is called', async () => {
		const testFile = '../../../../../src/test/data/repo/articles/metadata-completion.md';

		const filePath = resolve(__dirname, testFile);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor!;
		const position = new Position(10, editor.selection.active.character);
		await editor.edit(editBuilder => {
			editBuilder.insert(position, 'ms.prod:');
		});
		const source = new CancellationTokenSource();
		const completionContext: CompletionContext = {
			triggerKind: 1
		};
		const provider = msProdCompletionItemsProvider(context);
		const completionList = provider.provideCompletionItems(
			editor.document,
			position,
			source.token,
			completionContext
		);
		const completionItems = getMsProdMetadataCompletionItems(
			new Range(position, position),
			false,
			context
		);
		expect(completionList).to.deep.equal(completionItems);
	});
	test('Select ms.prod Completion Provider', async () => {
		const editor = window.activeTextEditor!;
		const position = new Position(10, editor.selection.active.character);
		const source = new CancellationTokenSource();
		const completionContext: CompletionContext = {
			triggerKind: 1
		};
		const provider = msProdCompletionItemsProvider(context);
		const completionItems = provider.provideCompletionItems(
			editor.document,
			position,
			source.token,
			completionContext
		) as CompletionItem[];
		const kind: CompletionItemKind = 11;
		const label = ' azure';
		const completionItem = new CompletionItem(label, kind);
		completionItem.detail = ' Output: azure';
		completionItem.documentation = new MarkdownString('Select _ azure_ value.', false);
		completionItem.insertText = new SnippetString(' azure');
		completionItem.sortText = label;
		expect(completionItems[0]).to.deep.equal(completionItem);
	});
	test('ms.service Metadata Completion Provider Items is called', async () => {
		const testFile = '../../../../../src/test/data/repo/articles/metadata-completion.md';

		const filePath = resolve(__dirname, testFile);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor!;
		const position = new Position(10, editor.selection.active.character);
		await editor.edit(editBuilder => {
			editBuilder.insert(position, 'ms.service:');
		});
		const source = new CancellationTokenSource();
		const completionContext: CompletionContext = {
			triggerKind: 1
		};
		const provider = msServiceCompletionItemsProvider(context);
		const completionList = provider.provideCompletionItems(
			editor.document,
			position,
			source.token,
			completionContext
		);
		const completionItems = getMsServiceMetadataCompletionItems(
			new Range(position, position),
			false,
			context
		);
		expect(completionList).to.deep.equal(completionItems);
	});
	test('Select ms.service Completion Provider', async () => {
		const editor = window.activeTextEditor!;
		const position = new Position(10, editor.selection.active.character);
		const source = new CancellationTokenSource();
		const completionContext: CompletionContext = {
			triggerKind: 1
		};
		const provider = msServiceCompletionItemsProvider(context);
		const completionItems = provider.provideCompletionItems(
			editor.document,
			position,
			source.token,
			completionContext
		) as CompletionItem[];
		const kind: CompletionItemKind = 11;
		const label = ' azure';
		const completionItem = new CompletionItem(label, kind);
		completionItem.detail = ' Output: azure';
		completionItem.documentation = new MarkdownString('Select _ azure_ value.', false);
		completionItem.insertText = new SnippetString(' azure');
		completionItem.sortText = label;
		expect(completionItems[0]).to.deep.equal(completionItem);
	});
	test('ms.technology Metadata Completion Provider Items is called', async () => {
		const testFile = '../../../../../src/test/data/repo/articles/metadata-completion.md';

		const filePath = resolve(__dirname, testFile);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor!;
		const position = new Position(10, editor.selection.active.character);
		await editor.edit(editBuilder => {
			editBuilder.insert(position, 'ms.technology:');
		});
		const source = new CancellationTokenSource();
		const completionContext: CompletionContext = {
			triggerKind: 1
		};
		const provider = msTechnologyCompletionItemsProvider(context);
		const completionList = provider.provideCompletionItems(
			editor.document,
			position,
			source.token,
			completionContext
		);
		const completionItems = getMsTechnologyMetadataCompletionItems(
			new Range(position, position),
			false,
			context,
			'content'
		);
		expect(completionList).to.deep.equal(completionItems);
	});
	test('Select ms.technology Completion Provider', async () => {
		const editor = window.activeTextEditor!;
		const position = new Position(10, editor.selection.active.character);
		const source = new CancellationTokenSource();
		const completionContext: CompletionContext = {
			triggerKind: 1
		};
		const provider = msTechnologyCompletionItemsProvider(context);
		const completionItems = provider.provideCompletionItems(
			editor.document,
			position,
			source.token,
			completionContext
		) as CompletionItem[];
		const kind: CompletionItemKind = 11;
		const label = ' azure';
		const completionItem = new CompletionItem(label, kind);
		completionItem.detail = ' Output: azure';
		completionItem.documentation = new MarkdownString('Select _ azure_ value.', false);
		completionItem.insertText = new SnippetString(' azure');
		completionItem.sortText = label;
		expect(completionItems[0]).to.deep.equal(completionItem);
	});
	test('ms.subservice Metadata Completion Provider Items is called', async () => {
		const testFile = '../../../../../src/test/data/repo/articles/metadata-completion.md';

		const filePath = resolve(__dirname, testFile);
		await loadDocumentAndGetItReady(filePath);
		const editor = window.activeTextEditor!;
		const position = new Position(10, editor.selection.active.character);
		await editor.edit(editBuilder => {
			editBuilder.insert(position, 'ms.subservice:');
		});
		const source = new CancellationTokenSource();
		const completionContext: CompletionContext = {
			triggerKind: 1
		};
		const provider = msSubServiceCompletionItemsProvider(context);
		const completionList = provider.provideCompletionItems(
			editor.document,
			position,
			source.token,
			completionContext
		);
		const completionItems = getMsSubServiceMetadataCompletionItems(
			new Range(position, position),
			false,
			context,
			'content'
		);
		expect(completionList).to.deep.equal(completionItems);
	});
	test('Select ms.subservice Completion Provider', async () => {
		const editor = window.activeTextEditor!;
		const position = new Position(10, editor.selection.active.character);
		const source = new CancellationTokenSource();
		const completionContext: CompletionContext = {
			triggerKind: 1
		};
		const provider = msSubServiceCompletionItemsProvider(context);
		const completionItems = provider.provideCompletionItems(
			editor.document,
			position,
			source.token,
			completionContext
		) as CompletionItem[];
		const kind: CompletionItemKind = 11;
		const label = ' azure';
		const completionItem = new CompletionItem(label, kind);
		completionItem.detail = ' Output: azure';
		completionItem.documentation = new MarkdownString('Select _ azure_ value.', false);
		completionItem.insertText = new SnippetString(' azure');
		completionItem.sortText = label;
		expect(completionItems[0]).to.deep.equal(completionItem);
	});
});
