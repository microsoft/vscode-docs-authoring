import {
	CancellationToken,
	CompletionContext,
	CompletionItem,
	CompletionItemKind,
	MarkdownString,
	Position,
	Range,
	SnippetString,
	TextDocument,
	ExtensionContext,
	QuickPickItem
} from 'vscode';
import { matchAll } from './common';
import { CompletionItemProvider } from 'vscode';

export function getMsProdMetadataCompletionItems(
	range: Range | undefined,
	isCancellationRequested: boolean,
	context: ExtensionContext
) {
	if (range) {
		const msProd: QuickPickItem[] = context.globalState.get('ms.prod');
		const completionItems: CompletionItem[] = setCompletionItems(msProd);
		return isCancellationRequested ? undefined : completionItems;
	}
	return undefined;
}

export const msProdCompletionItemsProvider = (extensionContext): CompletionItemProvider => {
	return {
		provideCompletionItems(
			document: TextDocument,
			position: Position,
			token: CancellationToken,
			context: CompletionContext
		) {
			return setMetadataCompletionItems(
				getMsProdMetadataCompletionItems,
				/^ms.prod\s*:/gm,
				document,
				position,
				token,
				extensionContext
			);
		}
	};
};

function setMetadataCompletionItems(
	callback,
	regex: RegExp,
	document: TextDocument,
	position: Position,
	token: CancellationToken,
	extensionContext: ExtensionContext
) {
	const range = document.getWordRangeAtPosition(position, regex);
	if (range) {
		const text = document.getText();
		if (text) {
			const results = matchAll(regex, text);
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
								return callback(range, token.isCancellationRequested, extensionContext, text);
							}
						}
					}
				}
			}
		}
	}
	return undefined;
}

export function getMsServiceMetadataCompletionItems(
	range: Range | undefined,
	isCancellationRequested: boolean,
	context: ExtensionContext
) {
	if (range) {
		const msService: QuickPickItem[] = context.globalState.get('ms.service');
		const completionItems: CompletionItem[] = setCompletionItems(msService);
		return isCancellationRequested ? undefined : completionItems;
	}

	return undefined;
}

export const msServiceCompletionItemsProvider = (extensionContext): CompletionItemProvider => {
	return {
		provideCompletionItems(
			document: TextDocument,
			position: Position,
			token: CancellationToken,
			context: CompletionContext
		) {
			return setMetadataCompletionItems(
				getMsServiceMetadataCompletionItems,
				/^ms.service\s*:/gm,
				document,
				position,
				token,
				extensionContext
			);
		}
	};
};

export function getMsTechnologyMetadataCompletionItems(
	range: Range | undefined,
	isCancellationRequested: boolean,
	context: ExtensionContext,
	content: string
) {
	let msTechnology: QuickPickItem[] = [];
	if (range) {
		const MS_PROD_RE = /^ms.prod\s*:\s*(.*?)$/im;
		const match = MS_PROD_RE.exec(content);
		if (match && match.length > 1) {
			const msProd = match[1];
			const prodTechnology: any[] = context.globalState.get('prodTechnology');
			const filteredList = prodTechnology.filter(item => {
				const set = item.id.split(':');
				if (set.length > 2) {
					return set[2] === msProd;
				}
			});
			filteredList.forEach(item => {
				if (item.values) {
					Object.keys(item.values).forEach(value => {
						if (value) {
							msTechnology.push({
								label: value
							});
						}
					});
				}
			});
		} else {
			msTechnology = context.globalState.get('ms.technology');
		}
		const completionItems: CompletionItem[] = setCompletionItems(msTechnology);

		return isCancellationRequested ? undefined : completionItems;
	}

	return undefined;
}

export const msTechnologyCompletionItemsProvider = (extensionContext): CompletionItemProvider => {
	return {
		provideCompletionItems(
			document: TextDocument,
			position: Position,
			token: CancellationToken,
			context: CompletionContext
		) {
			return setMetadataCompletionItems(
				getMsTechnologyMetadataCompletionItems,
				/^ms.technology\s*:/gm,
				document,
				position,
				token,
				extensionContext
			);
		}
	};
};

export const msSubServiceCompletionItemsProvider = (extensionContext): CompletionItemProvider => {
	return {
		provideCompletionItems(
			document: TextDocument,
			position: Position,
			token: CancellationToken,
			context: CompletionContext
		) {
			return setMetadataCompletionItems(
				getMsSubServiceMetadataCompletionItems,
				/^ms.subservice\s*:/gm,
				document,
				position,
				token,
				extensionContext
			);
		}
	};
};

export function getMsSubServiceMetadataCompletionItems(
	range: Range | undefined,
	isCancellationRequested: boolean,
	context: ExtensionContext,
	content: string
) {
	let msSubService: QuickPickItem[] = [];
	if (range) {
		const MS_SERVICE_RE = /^ms.service\s*:\s*(.*?)$/im;
		const match = MS_SERVICE_RE.exec(content);
		if (match && match.length > 1) {
			const msProd = match[1];
			const serviceSubService: any[] = context.globalState.get('serviceSubService');
			const filteredList = serviceSubService.filter(item => {
				const set = item.id.split(':');
				if (set.length > 2) {
					return set[2] === msProd;
				}
			});
			filteredList.forEach(item => {
				if (item.values) {
					Object.keys(item.values).forEach(value => {
						if (value) {
							msSubService.push({
								label: value
							});
						}
					});
				}
			});
		} else {
			msSubService = context.globalState.get('ms.subservice');
		}
		const completionItems: CompletionItem[] = setCompletionItems(msSubService);

		return isCancellationRequested ? undefined : completionItems;
	}

	return undefined;
}

function setCompletionItems(msTechnology: QuickPickItem[]) {
	const completionItems: CompletionItem[] = [];
	msTechnology.forEach(metadataCompletion => {
		const completionItem = ` ${metadataCompletion.label}`;
		const markdownSample = new MarkdownString('Output:');
		markdownSample.appendMarkdown(completionItem);

		const item = new CompletionItem(completionItem, CompletionItemKind.Value);
		item.detail = ` ${markdownSample.value}`;
		item.documentation = new MarkdownString(`Select _${completionItem}_ value.`);
		item.insertText = new SnippetString(completionItem);
		item.sortText = completionItem;

		completionItems.push(item);
	});
	return completionItems;
}
