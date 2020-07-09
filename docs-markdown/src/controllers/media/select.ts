import { window } from 'vscode';
import { noActiveEditorMessage, isValidEditor, isMarkdownFileCheck } from '../../helper/common';
import { Insert, insertVideo, insertURL } from './insert';
import { insertBookmarkInternal, insertBookmarkExternal } from '../bookmark-controller';
import { MediaType } from './MediaType';

/**
 * Creates an entry point for creating an internal (link type) or external link (url type).
 */
export function selectLinkType() {
	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	} else {
		if (!isValidEditor(editor, false, 'insert link')) {
			return;
		}

		if (!isMarkdownFileCheck(editor, false)) {
			return;
		}

		const linkTypes = ['Heading in this file', 'Heading in another file'];
		window.showQuickPick(linkTypes).then(qpSelection => {
			if (qpSelection === linkTypes[0]) {
				insertBookmarkInternal();
			} else if (qpSelection === linkTypes[1]) {
				insertBookmarkExternal();
			}
		});
	}
}

/**
 * Creates an entry point for creating an internal (link type) or external link (url type).
 */
export function selectLinkTypeToolbar(toolbar?: boolean) {
	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}

	if (!isValidEditor(editor, false, 'insert link')) {
		return;
	}

	if (!isMarkdownFileCheck(editor, false)) {
		return;
	}

	const linkTypes = ['External', 'Internal', 'Bookmark in this file', 'Bookmark in another file'];
	window.showQuickPick(linkTypes).then(qpSelection => {
		if (qpSelection === linkTypes[0]) {
			insertURL();
		} else if (qpSelection === linkTypes[1]) {
			Insert(MediaType.Link);
		} else if (qpSelection === linkTypes[2]) {
			insertBookmarkInternal();
		} else if (qpSelection === linkTypes[3]) {
			insertBookmarkExternal();
		}
	});
}

/**
 * Creates an entry point for creating an internal (link type) or external link (url type).
 */
export function selectMediaType() {
	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	} else {
		if (!isValidEditor(editor, false, 'insert media')) {
			return;
		}

		if (!isMarkdownFileCheck(editor, false)) {
			return;
		}

		const mediaTypes = ['Image', 'Video'];
		window.showQuickPick(mediaTypes).then(qpSelection => {
			if (qpSelection === mediaTypes[0]) {
				Insert(MediaType.ImageOrVideo);
			} else if (qpSelection === mediaTypes[1]) {
				insertVideo();
			}
		});
	}
}
