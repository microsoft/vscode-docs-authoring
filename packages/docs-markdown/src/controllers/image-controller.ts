import { existsSync } from 'fs';
import { basename, dirname, extname, join, relative } from 'path';
import * as recursive from 'recursive-readdir';
import {
	CompletionItem,
	InputBoxOptions,
	Position,
	QuickPickItem,
	QuickPickOptions,
	window,
	workspace,
	ExtensionContext
} from 'vscode';
import { Command } from '../Command';
import {
	hasValidWorkSpaceRootPath,
	ignoreFiles,
	insertContentToEditor,
	isMarkdownFileCheck,
	isValidEditor,
	noActiveEditorMessage,
	postWarning,
	setCursorPosition
} from '../helper/common';
import { sendTelemetryData } from '../helper/telemetry';

const telemetryCommandMedia: string = 'insertMedia';
const telemetryCommandLink: string = 'insertLink';
const imageExtensions = ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.svg'];

const telemetryCommand: string = 'insertImage';
let commandOption: string;

export const insertImageCommand: Command[] = [
	{ command: pickImageType.name, callback: pickImageType },
	{ command: applyImage.name, callback: applyImage },
	{ command: applyIcon.name, callback: applyIcon },
	{ command: applyComplex.name, callback: applyComplex },
	{ command: applyLocScope.name, callback: applyLocScope },
	{ command: applyLightbox.name, callback: applyLightbox },
	{ command: applyLink.name, callback: applyLink }
];

export async function pickImageType(context: ExtensionContext) {
	const opts: QuickPickOptions = { placeHolder: 'Select an Image type' };
	const items: QuickPickItem[] = [];
	const config = workspace.getConfiguration('markdown');
	const alwaysIncludeLocScope = config.get<boolean>('alwaysIncludeLocScope');

	items.push({
		description: '',
		label: 'Image'
	});
	items.push({
		description: '',
		label: 'Icon image'
	});
	items.push({
		description: '',
		label: 'Complex image'
	});
	if (!alwaysIncludeLocScope) {
		items.push({
			description: '',
			label: 'Add localization scope to image'
		});
	}
	items.push({
		description: '',
		label: 'Add lightbox to image'
	});
	items.push({
		description: '',
		label: 'Add link to image'
	});
	const selection = await window.showQuickPick(items, opts);
	if (!selection) {
		return;
	}
	switch (selection.label.toLowerCase()) {
		case 'image':
			await applyImage(context);
			commandOption = 'image';
			break;
		case 'icon image':
			await applyIcon();
			commandOption = 'icon';
			break;
		case 'complex image':
			await applyComplex(context);
			commandOption = 'complex';
			break;
		case 'add localization scope to image':
			await applyLocScope(context);
			commandOption = 'loc-scope';
			break;
		case 'add lightbox to image':
			await applyLightbox();
			commandOption = 'lightbox';
			break;
		case 'add link to image':
			await applyLink();
			commandOption = 'link';
			break;
	}
	sendTelemetryData(telemetryCommand, commandOption);
}

export async function applyImage(context: ExtensionContext) {
	// get editor, its needed to apply the output to editor window.
	const editor = window.activeTextEditor;
	let folderPath: string = '';

	if (!editor) {
		noActiveEditorMessage();
		return;
	}

	let image = '';
	if (checkEditor(editor)) {
		// Get images from repo as quickpick items
		// User should be given a list of quickpick items which list images from repo
		if (workspace.workspaceFolders) {
			folderPath = workspace.workspaceFolders[0].uri.fsPath;
		}

		// recursively get all the files from the root folder
		recursive(folderPath, ignoreFiles, async (err: any, files: any) => {
			if (err) {
				window.showErrorMessage(err);
			}

			const items: QuickPickItem[] = [];
			files.sort();

			files
				.filter((file: any) => imageExtensions.indexOf(extname(file.toLowerCase())) !== -1)
				.forEach((file: any) => {
					items.push({ label: basename(file), description: dirname(file) });
				});

			// allow user to select source items from quickpick
			const source = await window.showQuickPick(items, { placeHolder: 'Select Image from repo' });
			if (source && source.description) {
				const activeFileDir = dirname(editor.document.fileName);

				const sourcePath = relative(
					activeFileDir,
					join(source.description, source.label).split('//').join('//')
				).replace(/\\/g, '/');

				// Ask user input for alt text
				const selection = editor.selection;
				const selectedText = editor.document.getText(selection);
				let altText: string | undefined = '';
				if (selectedText === '') {
					// Ask user input for alt text
					altText = await window.showInputBox({
						placeHolder: 'Add alt text (up to 250 characters)',
						validateInput: (text: string) =>
							text !== ''
								? text.length <= 250
									? ''
									: 'alt text should be less than 250 characters'
								: 'alt-text input must not be empty'
					});
					if (!altText) {
						// if user did not enter any alt text, then exit.
						altText = '';
					}
				} else {
					altText = selectedText;
				}

				const config = workspace.getConfiguration('markdown');
				const alwaysIncludeLocScope = config.get<boolean>('alwaysIncludeLocScope');
				if (alwaysIncludeLocScope) {
					const allowlist: QuickPickItem[] = context.globalState.get('product');
					// show quickpick to user for products list.
					const locScope = await window.showQuickPick(allowlist, {
						placeHolder: 'Select from product list'
					});
					if (locScope) {
						image = `:::image type="content" source="${sourcePath}" alt-text="${altText}" loc-scope="${locScope.label}":::`;
					}
				} else {
					image = `:::image type="content" source="${sourcePath}" alt-text="${altText}":::`;
				}
				// output image content type
				insertContentToEditor(editor, image, true);
			}
		});
	}
}

function checkEditor(editor: any) {
	let actionType: string = 'Get File for Image';

	// determines the name to set in the ValidEditor check
	actionType = 'Art';
	commandOption = 'art';
	sendTelemetryData(telemetryCommandMedia, commandOption);

	// checks for valid environment
	if (!isValidEditor(editor, false, actionType)) {
		return;
	}

	if (!isMarkdownFileCheck(editor, false)) {
		return;
	}

	if (!hasValidWorkSpaceRootPath(telemetryCommandLink)) {
		return;
	}

	// The active file should be used as the origin for relative links.
	// The path is split so the file type is not included when resolving the path.
	const activeFileName = editor.document.fileName;
	const pathDelimited = editor.document.fileName.split('.');
	const activeFilePath = pathDelimited[0];

	// Check to see if the active file has been saved.  If it has not been saved, warn the user.
	// The user will still be allowed to add a link but it the relative path will not be resolved.

	if (!existsSync(activeFileName)) {
		window.showWarningMessage(
			activeFilePath + ' is not saved.  Cannot accurately resolve path to create link.'
		);
		return;
	}

	return true;
}
export async function applyIcon() {
	// get editor to see if user has selected text
	const editor = window.activeTextEditor;
	let folderPath: string = '';

	if (!editor) {
		noActiveEditorMessage();
		return;
	}

	let image = '';
	if (checkEditor(editor)) {
		const selection = editor.selection;
		const selectedText = editor.document.getText(selection);
		if (selectedText === '') {
			// Get images from repo as quickpick items
			// User should be given a list of quickpick items which list images from repo
			if (workspace.workspaceFolders) {
				folderPath = workspace.workspaceFolders[0].uri.fsPath;
			}

			// recursively get all the files from the root folder
			recursive(folderPath, ignoreFiles, async (err: any, files: any) => {
				if (err) {
					window.showErrorMessage(err);
				}

				const items: QuickPickItem[] = [];
				files.sort();

				files
					.filter((file: any) => imageExtensions.indexOf(extname(file.toLowerCase())) !== -1)
					.forEach((file: any) => {
						items.push({ label: basename(file), description: dirname(file) });
					});

				// allow user to select source items from quickpick
				const source = await window.showQuickPick(items, { placeHolder: 'Select Image from repo' });
				if (source && source.description) {
					const activeFileDir = dirname(editor.document.fileName);

					const sourcePath = relative(
						activeFileDir,
						join(source.description, source.label).split('//').join('//')
					).replace(/\\/g, '/');

					// output image content type
					image = `:::image type="icon" source="${sourcePath}" border="false":::`;
					insertContentToEditor(editor, image, true);
				}
			});
		}
	} else {
		// if user has selected text then exit?
		return;
	}
	return;
}
export async function applyComplex(context: ExtensionContext) {
	// get editor, its needed to apply the output to editor window.
	const editor = window.activeTextEditor;
	let folderPath: string = '';

	if (!editor) {
		noActiveEditorMessage();
		return;
	}

	let image = '';
	if (checkEditor(editor)) {
		// Get images from repo as quickpick items
		// User should be given a list of quickpick items which list images from repo
		if (workspace.workspaceFolders) {
			folderPath = workspace.workspaceFolders[0].uri.fsPath;
		}

		// recursively get all the files from the root folder
		recursive(folderPath, ignoreFiles, async (err: any, files: any) => {
			if (err) {
				window.showErrorMessage(err);
			}

			const items: QuickPickItem[] = [];
			files.sort();

			files
				.filter((file: any) => imageExtensions.indexOf(extname(file.toLowerCase())) !== -1)
				.forEach((file: any) => {
					items.push({ label: basename(file), description: dirname(file) });
				});

			// allow user to select source items from quickpick
			const source = await window.showQuickPick(items, { placeHolder: 'Select Image from repo' });
			if (source && source.description) {
				const activeFileDir = dirname(editor.document.fileName);

				const sourcePath = relative(
					activeFileDir,
					join(source.description, source.label).split('//').join('//')
				).replace(/\\/g, '/');

				const selection = editor.selection;
				const selectedText = editor.document.getText(selection);
				let altText: string | undefined = '';
				if (selectedText === '') {
					// Ask user input for alt text
					altText = await window.showInputBox({
						placeHolder: 'Add alt text (up to 250 characters)',
						validateInput: (text: string) =>
							text !== ''
								? text.length <= 250
									? ''
									: 'alt text should be less than 250 characters'
								: 'alt-text input must not be empty'
					});
					if (!altText) {
						// if user did not enter any alt text, then exit.
						altText = '';
					}
				} else {
					altText = selectedText;
				}
				const config = workspace.getConfiguration('markdown');
				const alwaysIncludeLocScope = config.get<boolean>('alwaysIncludeLocScope');
				if (alwaysIncludeLocScope) {
					const allowlist: QuickPickItem[] = context.globalState.get('product');
					// show quickpick to user for products list.
					const locScope = await window.showQuickPick(allowlist, {
						placeHolder: 'Select from product list'
					});
					if (locScope) {
						image = `:::image type="complex" source="${sourcePath}" alt-text="${altText}" loc-scope="${locScope.label}":::

:::image-end:::`;
					}
				} else {
					// output image complex type
					image = `:::image type="complex" source="${sourcePath}" alt-text="${altText}":::

:::image-end:::`;
				}

				insertContentToEditor(editor, image, true);
				// Set editor position to the middle of long description body
				setCursorPosition(
					editor,
					editor.selection.active.line + 1,
					editor.selection.active.character
				);
			}
		});
	}
}

export async function applyLocScope(context: ExtensionContext) {
	// get editor, its needed to apply the output to editor window.
	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}
	// if user has not selected any text, then continue
	const RE_LOC_SCOPE = /:::image\s+((source|type|alt-text|lightbox|border|link)="([a-zA-Z0-9_.\/ -]+)"\s*)+:::/gm;
	const position = new Position(editor.selection.active.line, editor.selection.active.character);
	// get the current editor position and check if user is inside :::image::: tags
	const wordRange = editor.document.getWordRangeAtPosition(position, RE_LOC_SCOPE);
	if (wordRange) {
		const start = RE_LOC_SCOPE.exec(editor.document.getText(wordRange));
		if (start) {
			const type = start[start.indexOf('type') + 1];
			if (type.toLowerCase() === 'icon') {
				window.showErrorMessage(
					'The loc-scope attribute should not be added to icons, which are not localized.'
				);
				return;
			}
		}
		// if user is inside :::image::: tag, then ask them for quickpick of products based on allow list
		const allowlist: QuickPickItem[] = context.globalState.get('product');
		// show quickpick to user for products list.
		const product = await window.showQuickPick(allowlist, {
			placeHolder: 'Select from product list'
		});
		if (!product) {
			// if user did not select source image then exit.
			return;
		} else {
			// insert loc-sope into editor
			await editor.edit(selected => {
				selected.insert(
					new Position(wordRange.end.line, wordRange.end.character - 3),
					` loc-scope="${product.label}"`
				);
			});
		}
	} else {
		const RE_LOC_SCOPE_EXISTS = /:::image\s+((source|type|alt-text|lightbox|border|loc-scope|link)="([a-zA-Z0-9_.\/ -]+)"\s*)+:::/gm;
		const locScopeAlreadyExists = editor.document.getWordRangeAtPosition(
			position,
			RE_LOC_SCOPE_EXISTS
		);
		if (locScopeAlreadyExists) {
			window.showErrorMessage('loc-scope attribute already exists on :::image::: tag.');
			return;
		}

		window.showErrorMessage('invalid cursor position. You must be inside :::image::: tags.');
	}
	return;
}

export async function applyLightbox() {
	// get editor, its needed to apply the output to editor window.
	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}

	// if user has not selected any text, then continue
	const RE_LIGHTBOX = /:::image\s+((source|type|alt-text|loc-scope|border|link)="([a-zA-Z0-9_.\/ -]+)"\s*)+:::/gm;
	const position = new Position(editor.selection.active.line, editor.selection.active.character);
	// get the current editor position and check if user is inside :::image::: tags
	const wordRange = editor.document.getWordRangeAtPosition(position, RE_LIGHTBOX);
	if (wordRange) {
		let folderPath = '';
		if (workspace.workspaceFolders) {
			folderPath = workspace.workspaceFolders[0].uri.fsPath;
		}
		// get available files
		recursive(folderPath, ignoreFiles, async (err: any, files: any) => {
			if (err) {
				window.showErrorMessage(err);
			}

			const items: QuickPickItem[] = [];
			files.sort();

			files
				.filter((file: any) => imageExtensions.indexOf(extname(file.toLowerCase())) !== -1)
				.forEach((file: any) => {
					items.push({ label: basename(file), description: dirname(file) });
				});

			// show quickpick to user available images.
			const image = await window.showQuickPick(items, { placeHolder: 'Select Image from repo' });
			if (image && image.description) {
				// insert lightbox into editor
				const activeFileDir = dirname(editor.document.fileName);

				const imagePath = relative(
					activeFileDir,
					join(image.description, image.label).split('//').join('//')
				).replace(/\\/g, '/');

				await editor.edit(selected => {
					selected.insert(
						new Position(wordRange.end.line, wordRange.end.character - 3),
						` lightbox="${imagePath}"`
					);
				});
			}
		});
	} else {
		const RE_LIGHTBOX_EXISTS = /:::image\s+((source|type|alt-text|lightbox|border|loc-scope|link)="([a-zA-Z0-9_.\/ -]+)"\s*)+:::/gm;
		const lightboxAlreadyExists = editor.document.getWordRangeAtPosition(
			position,
			RE_LIGHTBOX_EXISTS
		);
		if (lightboxAlreadyExists) {
			window.showErrorMessage('lightbox attribute already exists on :::image::: tag.');
			return;
		}

		window.showErrorMessage('invalid cursor position. You must be inside :::image::: tags.');
	}
	return;
}

export function imageKeyWordHasBeenTyped(editor: any) {
	const RE_IMAGE = /image/g;
	if (editor) {
		const position = new Position(editor.selection.active.line, editor.selection.active.character);
		const wordRange = editor.document.getWordRangeAtPosition(position, RE_IMAGE);
		if (wordRange) {
			return true;
		}
	}
}
export function imageCompletionProvider() {
	const completionItems: CompletionItem[] = [];
	completionItems.push(
		new CompletionItem(`:::image type="content" source="" alt-text="" loc-scope="":::`)
	);
	completionItems.push(
		new CompletionItem(`:::image type="icon" source="" alt-text="" loc-scope="":::`)
	);
	completionItems.push(
		new CompletionItem(`:::image type="complex" source="" alt-text="" loc-scope="":::`)
	);
	return completionItems;
}

export async function applyLink() {
	// get editor, its needed to apply the output to editor window.
	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}

	// if user has not selected any text, then continue
	const RE_LINK = /:::image\s+((source|type|alt-text|lightbox|border|loc-scope)="([a-zA-Z0-9_.\/ -]+)"\s*)+:::/gm;
	const position = new Position(editor.selection.active.line, editor.selection.active.character);
	// get the current editor position and check if user is inside :::image::: tags
	const wordRange = editor.document.getWordRangeAtPosition(position, RE_LINK);
	if (wordRange) {
		const options: InputBoxOptions = {
			placeHolder: 'Enter link (URL or relative path)'
		};
		const imageLink = await window.showInputBox(options);
		if (imageLink === undefined) {
			postWarning('No link provided, abandoning command.');
		} else {
			await editor.edit(selected => {
				selected.insert(
					new Position(wordRange.end.line, wordRange.end.character - 3),
					` link="${imageLink}"`
				);
			});
		}
	} else {
		const RE_LINK_EXISTS = /:::image\s+((source|type|alt-text|lightbox|border|loc-scope|link)="([a-zA-Z0-9_.\/ -:]+)"\s*)+:::/gm;
		const linkAlreadyExists = editor.document.getWordRangeAtPosition(position, RE_LINK_EXISTS);
		if (linkAlreadyExists) {
			window.showErrorMessage('link attribute already exists on :::image::: tag.');
			return;
		}

		window.showErrorMessage('invalid cursor position. You must be inside :::image::: tags.');
	}
	return;
}
