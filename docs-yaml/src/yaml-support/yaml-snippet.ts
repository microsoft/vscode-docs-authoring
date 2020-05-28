import { readdirSync, readFileSync } from 'fs';
import * as Fuse from 'fuse.js';
import { safeLoad } from 'js-yaml';
import { join } from 'path';
import {
	CompletionItem,
	CompletionItemKind,
	CompletionItemProvider,
	Position,
	SnippetString,
	TextDocument
} from 'vscode';
import { reporter } from '../helper/telemetry';
import { SNIPPETS_ROOT_PATH } from './yaml-constant';

/// Internal representation of a yaml code snippet corresponding to CompletionItemProvider
export interface CodeSnippet {
	readonly name: string;
	readonly label: string;
	readonly description: string;
	readonly body: string;
}

/**
 * A docs-yaml completion provider provides yaml code snippets for docs-yaml, eg: Achievements, Module.
 */
export class DocsYamlCompletionProvider implements CompletionItemProvider {
	// Storing all loaded yaml code snippets from snippets folder
	private snippets: CodeSnippet[] = [];

	// Default constructor
	public constructor() {
		this.loadCodeSnippets();
	}

	// Provide code snippets for vscode
	public provideCompletionItems(doc: TextDocument, pos: Position) {
		reporter.sendTelemetryEvent(`yaml.schemaError`);
		const wordPos = doc.getWordRangeAtPosition(pos);
		const word = doc.getText(wordPos);

		return this.filterCodeSnippets(word).map(
			(snippet: CodeSnippet): CompletionItem => {
				const item = new CompletionItem(snippet.label, CompletionItemKind.Snippet);
				item.insertText = new SnippetString(snippet.body);
				item.documentation = snippet.description;
				return item;
			}
		);
	}

	// Load yaml code snippets from snippets folder
	private loadCodeSnippets(): void {
		this.snippets = readdirSync(__dirname)
			.filter((filename: string): boolean => filename.endsWith('.yaml'))
			.map(
				(filename: string): CodeSnippet =>
					this.readYamlCodeSnippet(join(SNIPPETS_ROOT_PATH, filename))
			);
	}

	// Filter all internal code snippets using the parameter word
	private filterCodeSnippets(word: string): CodeSnippet[] {
		const searcher = new Fuse(this.snippets, { keys: ['name'] });
		return searcher.search(word.toLowerCase());
	}

	// Parse a yaml snippet file into a CodeSnippet
	private readYamlCodeSnippet(filename: string): CodeSnippet {
		return safeLoad(readFileSync(filename, 'utf-8')) as CodeSnippet;
	}
}
