import {
    CancellationToken,
    CodeAction,
    CodeActionContext,
    CodeActionKind,
    CodeActionProvider,
    CompletionContext,
    CompletionItem,
    CompletionItemKind,
    CompletionItemProvider,
    Diagnostic,
    DiagnosticSeverity,
    MarkdownString,
    Position,
    QuickPickItem,
    Range,
    SnippetString,
    TextDocument,
    window,
    workspace,
} from "vscode";
import { matchAll } from "../helper/common";

/**
 * A docs-yaml completion provider provides yaml code snippets for docs-yaml, eg: Achievements, Module.
 */
export class DocsYamlDashCompletionProvider implements CompletionItemProvider {

    // Provide code snippets for vscode
    public provideCompletionItems(document: TextDocument, position: Position, token: CancellationToken, context: CompletionContext) {
        const range = document.getWordRangeAtPosition(position, /-/);
        if (range) {
            const text = document.getText();
            if (text) {
                const DASH_RE = /-/gm;
                const results = matchAll(DASH_RE, text);
                if (results) {
                    for (let i = 0; i < results.length; ++i) {
                        if (i % 2 === 0) {
                            const match = results[i];
                            if (match) {
                                const index = match.index || -1;
                                const pos = document.positionAt(index);
                                const positionIsInRange =
                                    pos.line === range.start.line && pos.character >= range.start.character ||
                                    pos.line === range.end.line && pos.character <= range.end.character;
                                if (index >= 0 && positionIsInRange) {
                                    return getCompletionItems(range, token.isCancellationRequested);
                                }
                            }
                        }
                    }
                }
            }
        }

        return undefined;
    }
}
