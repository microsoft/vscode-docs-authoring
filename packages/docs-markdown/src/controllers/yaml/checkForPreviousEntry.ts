import { invalidTocEntryPosition } from '../../constants/log-messages';
import { window } from 'vscode';
import { launchTOCQuickPick } from './showTOCQuickPick';

export async function checkForPreviousEntry(options: boolean) {
	const editor = window.activeTextEditor;
	if (!editor) {
		return;
	}

	// position variables
	const position = editor.selection.active;
	const cursorPosition = position.character;
	const currentLine = position.line;
	const totalLines = editor.document.lineCount;
	const startingCursorPosition = editor.selection.active.character;

	// scalar variables
	let itemsIndex: boolean = false;
	let itemsIndexFirstPosition: boolean = false;
	let nameIndex: boolean = false;

	// scalar regex
	const itemsScalarFirstPosition = /^items:/;
	const itemsScalar = /^\s+items:/;
	const nameScalarFirstPosition = /^-\sname:/;
	const nameScalar = /^\s+(-\sname:)/;
	const hrefScalar = /^\s+href:/;
	const displayNameScalar = /^\s+displayName:/;

	// check 1: opening items node
	const lineData = editor.document.lineAt(0);
	const lineText = lineData.text;
	if (lineText.match(itemsScalarFirstPosition)) {
		itemsIndexFirstPosition = true;
	} else {
		itemsIndexFirstPosition = false;
	}

	// case 1: opening items alignment
	if (currentLine === 1 && itemsIndexFirstPosition) {
		if (cursorPosition === 2) {
			await launchTOCQuickPick(options);
		} else {
			window.showErrorMessage(invalidTocEntryPosition);
		}
	}

	// check 2: items node
	if (currentLine > 0) {
		for (let i = currentLine; i < totalLines; i--) {
			if (i === 0) {
				break;
			}

			const stopAtParent = editor.document.lineAt(i);
			if (stopAtParent.text.match(itemsScalar)) {
				if (stopAtParent.firstNonWhitespaceCharacterIndex === 2 && startingCursorPosition > 2) {
					itemsIndex = false;
					break;
				}
			}

			// next line should have a greater starting position
			if (i === currentLine && i + 1 !== totalLines) {
				const lineData = editor.document.lineAt(i + 1);
				if (lineData.firstNonWhitespaceCharacterIndex > startingCursorPosition) {
					itemsIndex = false;
					break;
				}
			}

			const lineData = editor.document.lineAt(i);
			const lineText = lineData.text;
			if (lineText.match(itemsScalar)) {
				const itemScalarPosition = lineData.firstNonWhitespaceCharacterIndex;
				if (startingCursorPosition === itemScalarPosition) {
					itemsIndex = true;
					break;
				} else {
					itemsIndex = false;
					continue;
				}
			}
		}
	}

	// check 3: name scalar
	if (currentLine > 0) {
		const startPosition = editor.selection.active.line;
		let i = startPosition;
		for (i = startPosition; i < totalLines; i--) {
			if (i === 0) {
				break;
			}

			if (startingCursorPosition === 0) {
				const checkChild = editor.document.lineAt(i + 1);
				if (checkChild.firstNonWhitespaceCharacterIndex === startingCursorPosition) {
					nameIndex = true;
					break;
				}
			}

			const stopAtParent = editor.document.lineAt(i);
			if (stopAtParent.text.match(nameScalar)) {
				if (stopAtParent.firstNonWhitespaceCharacterIndex === 0) {
					nameIndex = false;
					break;
				}
			}

			// next line should have a greater starting position
			if (i === currentLine && i + 1 !== totalLines) {
				const lineData = editor.document.lineAt(i + 1);
				if (lineData.firstNonWhitespaceCharacterIndex > startingCursorPosition) {
					nameIndex = false;
					break;
				}
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

	// check 4: name scalar in first position
	if (currentLine > 0) {
		const startPosition = editor.selection.active.line;
		const totalLines = editor.document.lineCount;
		let i = startPosition;
		for (i = startPosition; i < totalLines; i--) {
			if (i === 0) {
				break;
			}

			if (startingCursorPosition === 0) {
				const checkChild = editor.document.lineAt(i + 1);
				if (checkChild.firstNonWhitespaceCharacterIndex === startingCursorPosition) {
					nameIndex = true;
					break;
				}
			}

			const stopAtParent = editor.document.lineAt(i);
			if (stopAtParent.text.match(nameScalar)) {
				if (stopAtParent.firstNonWhitespaceCharacterIndex === 0) {
					nameIndex = false;
					break;
				}
			}

			// next line should have a greater starting position
			if (i === currentLine && i + 1 !== totalLines) {
				const lineData = editor.document.lineAt(i + 1);
				if (lineData.firstNonWhitespaceCharacterIndex > startingCursorPosition) {
					nameIndex = false;
					break;
				}
			}
			const lineData = editor.document.lineAt(i);
			const lineText = lineData.text;
			if (lineText.match(nameScalarFirstPosition)) {
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

	// check if parent is href or displayName
	if (currentLine - 1 > 0) {
		if (
			editor.document.lineAt(currentLine - 1).text.match(hrefScalar) ||
			editor.document.lineAt(currentLine - 1).text.match(displayNameScalar)
		) {
			if (
				editor.document.lineAt(currentLine - 1).firstNonWhitespaceCharacterIndex ===
				startingCursorPosition
			) {
				nameIndex = false;
				itemsIndex = false;
			}
		}
	}

	// case 2: scalar alignment
	if (currentLine > 1) {
		if (itemsIndex) {
			await launchTOCQuickPick(options);
		} else if (nameIndex) {
			await launchTOCQuickPick(options);
		} else {
			window.showErrorMessage(invalidTocEntryPosition);
		}
	}

	// case 3: beginning of toc/first line
	if (currentLine === 0) {
		if (cursorPosition === 0) {
			await launchTOCQuickPick(options);
		} else {
			window.showErrorMessage(invalidTocEntryPosition);
		}
	}
}
