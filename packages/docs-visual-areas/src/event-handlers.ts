import { TextDocumentWillSaveEvent, workspace } from 'vscode';
import { triggerUpdateDecorations } from './decorations';

export function addEventHandlers() {
	workspace.onWillSaveTextDocument(willSaveTextDocument);
	async function willSaveTextDocument(e: TextDocumentWillSaveEvent) {
		e.waitUntil(Promise.resolve(triggerUpdateDecorations()));
	}
}
