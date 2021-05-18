const fs = require('fs').promises;
import util = require('util');
import { showStatusMessage } from './common';
import { output } from './output';
const readFile = util.promisify(fs.readFile);

export const headingTextRegex = /^ {0,3}(#{1,6})(.*)/m;

export async function tryGetHeader(absolutePathToFile) {
	const content = await readFile(absolutePathToFile, 'utf8');
	const headings = getHeadings(content);
	if (headings.length > 0) {
		const header = headings[0];
		return header.substring(header.indexOf(' ')).trim().toLowerCase();
	}
	return '';
}

export function getHeadings(content) {
	try {
		const regex = new RegExp(`^(---)([^]+?)(---)$`, 'm');
		const contentWithoutMetadata = content.replace(regex, '');
		const headings = contentWithoutMetadata.match(headingTextRegex);
		return headings;
	} catch (error) {
		showStatusMessage(error);
	}
}
