import { workspace } from 'vscode';
import { output } from '../helper/common';
import * as os from 'os';

const LINK_RE = /(\[.*?\]\()(.*~.*?)(\))/g;
const ROOTPATH_RE = /.*~/;
export function rootDirectory(md, options) {
	const replaceRootDirectoryWithFullPath = (src: string) => {
		let captureGroup;
		while ((captureGroup = LINK_RE.exec(src))) {
			const repoRoot = workspace.workspaceFolders[0].uri.fsPath;

			if (captureGroup && captureGroup.length > 3 && captureGroup[2].includes('~')) {
				const pathArr = repoRoot.split('\\');
				if (pathArr.length > 0) {
					const root = pathArr.pop();
					const filePath = captureGroup[2].replace(ROOTPATH_RE, `//${root}`);
					src =
						src.slice(0, captureGroup.index) +
						captureGroup[1] +
						filePath +
						captureGroup[3] +
						src.slice(captureGroup.index + captureGroup[0].length, src.length);
				}
			}
		}
		return src;
	};

	const resolveRootDirectory = state => {
		try {
			state.src = replaceRootDirectoryWithFullPath(state.src);
		} catch (error) {
			output.appendLine(error);
		}
	};
	md.core.ruler.before('normalize', 'rootDirectory', resolveRootDirectory);
}
