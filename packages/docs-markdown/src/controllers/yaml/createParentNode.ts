import { insertContentToEditor } from '../../helper/common';
import { invalidTocEntryPosition } from '../../constants/log-messages';
import { window } from 'vscode';

export async function createParentNode() {
	const editor = window.activeTextEditor;
	if (!editor) {
		return;
	}
	const position = editor.selection.active;
	const cursorPosition = position.character;
	const currentLine = position.line;
	const nameScalar = /^\s+(-\sname:)/;
	let nameIndex: boolean = false;
	const attributeSpace = ' ';

	if (currentLine > 0) {
		const startPosition = editor.selection.active.line;
		let startingCursorPosition: number;
		const totalLines = editor.document.lineCount;
		let i = startPosition;
		for (i = startPosition; i < totalLines; i--) {
			startingCursorPosition = editor.selection.active.character;
			if (i === 0) {
				break;
			}
			const lineData = editor.document.lineAt(i);
			const lineText = lineData.text;
			if (lineText.match(nameScalar)) {
				const nameScalarPosition = lineData.firstNonWhitespaceCharacterIndex;
				if (nameScalarPosition === startingCursorPosition) {
					nameIndex = true;
					break;
				} else {
					nameIndex = false;
					continue;
				}
			}
		}
	}

	if (cursorPosition === 0) {
		const parentNodeLineStart = `- name:
  items:
  - name:
    href:`;
		await insertContentToEditor(editor, parentNodeLineStart);
	}

	if (nameIndex && cursorPosition > 0) {
		const parentNodeLineStart = `- name:
    ${attributeSpace.repeat(cursorPosition - 2)}items:
    ${attributeSpace.repeat(cursorPosition - 2)}- name:
    ${attributeSpace.repeat(cursorPosition)}href:`;
		await insertContentToEditor(editor, parentNodeLineStart);
	}

	if (!nameIndex && cursorPosition !== 0) {
		window.showErrorMessage(invalidTocEntryPosition);
		return;
	}
}
