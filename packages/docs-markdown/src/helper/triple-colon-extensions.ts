import {
	CancellationToken,
	CompletionContext,
	CompletionItem,
	CompletionItemKind,
	CompletionItemProvider,
	MarkdownString,
	Position,
	Range,
	SnippetString,
	TextDocument
} from 'vscode';
import { matchAll } from './common';

/* Triple colon extensions for completion provider
 * used to quickly insert the triple colon syntax into markdown
 */
export interface TripleColonExtension {
	readonly content: string;
	readonly extension: string;
}

export type TripleColonExtensions = TripleColonExtension[];

const tripleColonExtensions: TripleColonExtensions = [
	{
		content: `column:::
    {content}
:::column-end:::`,
		extension: 'Column :::column:::'
	},
	{
		content: `image type="content" source="{source}" alt-text="{alt-text}":::`,
		extension: 'Image :::image:::'
	},
	{
		content: `moniker range="{range}"
    {content}
:::moniker-end`,
		extension: 'Moniker :::moniker:::'
	},
	{
		content: `no-loc text="{text}":::`,
		extension: 'No-Loc :::no-loc:::'
	},
	{
		content: `row:::
    :::column:::
        {content}
    :::column-end:::
    :::column:::
        {content}
    :::column-end:::
:::row-end:::`,
		extension: 'Row :::row:::'
	},
	{
		content: `zone target="{target}" pivot="{pivot}"
    {content}
:::zone-end`,
		extension: 'Zone :::zone:::'
	}
];

export function getTripleColonCompletionItems(
	range: Range | undefined,
	isCancellationRequested: boolean
) {
	if (range) {
		const completionItems: CompletionItem[] = [];
		tripleColonExtensions.forEach(tripleColonExtension => {
			const extension = tripleColonExtension.extension;
			const markdownSample = new MarkdownString('Output:\r\n');
			markdownSample.appendMarkdown(`:::${tripleColonExtension.content}`);

			const item = new CompletionItem(tripleColonExtension.extension, CompletionItemKind.Value);
			item.detail = markdownSample.value;
			item.documentation = new MarkdownString(`Use the _${extension}_ extension.`);
			item.insertText = new SnippetString(tripleColonExtension.content);
			item.sortText = extension;

			completionItems.push(item);
		});

		return isCancellationRequested ? undefined : completionItems;
	}

	return undefined;
}

export const tripleColonCompletionItemsProvider: CompletionItemProvider = {
	provideCompletionItems(
		document: TextDocument,
		position: Position,
		token: CancellationToken,
		context: CompletionContext
	) {
		const range = document.getWordRangeAtPosition(position, /:::/);
		if (range) {
			const text = document.getText();
			if (text) {
				const TRIPLE_COLON_RE = /:::/gm;
				const results = matchAll(TRIPLE_COLON_RE, text);
				if (results) {
					for (let i = 0; i < results.length; ++i) {
						if (i % 2 === 0) {
							const match = results[i];
							if (match) {
								const index = match.index || -1;
								const pos = document.positionAt(index);
								const positionIsInRange =
									(pos.line === range.start.line && pos.character >= range.start.character) ||
									(pos.line === range.end.line && pos.character <= range.end.character);
								if (index >= 0 && positionIsInRange) {
									return getTripleColonCompletionItems(range, token.isCancellationRequested);
								}
							}
						}
					}
				}
			}
		}

		return undefined;
	}
};
