import { readFileSync } from 'fs';
import { basename, resolve } from 'path';
import { window, workspace } from 'vscode';
import { output } from '../helper/common';

/* tslint:disable: no-conditional-assignment */
const INCLUDE_RE = /\[!include\s*\[\s*.+?\s*]\(\s*(.+?)\s*\)\s*]/i;
const FRONTMATTER_RE = /^---[\s\S]+?---/gim;
const ROOTPATH_RE = /.*~/gim;
export function include(md, options) {
	const replaceIncludeWithContents = (src: string, rootdir: string) => {
		let captureGroup;
		if (!rootdir) {
			const filePath = window.activeTextEditor.document.fileName;
			rootdir = filePath.replace(basename(filePath), '');
		}
		while ((captureGroup = INCLUDE_RE.exec(src))) {
			const repoRoot = workspace.workspaceFolders[0].uri.fsPath;
			let filePath = resolve(rootdir, captureGroup[1].trim());
			if (filePath.includes('~')) {
				filePath = filePath.replace(ROOTPATH_RE, repoRoot);
			}
			let mdSrc = '';
			try {
				mdSrc = readFileSync(filePath, 'utf8');
				mdSrc = mdSrc.replace(FRONTMATTER_RE, '');
			} catch (error) {
				mdSrc = captureGroup[0].substring(1, captureGroup[0].length);
				output.appendLine(error);
			}
			src =
				src.slice(0, captureGroup.index) +
				mdSrc +
				src.slice(captureGroup.index + captureGroup[0].length, src.length);
		}
		return src;
	};

	const importInclude = state => {
		try {
			state.src = replaceIncludeWithContents(state.src, options.root);
		} catch (error) {
			output.appendLine(error);
		}
	};
	md.core.ruler.before('normalize', 'include', importInclude);
}
