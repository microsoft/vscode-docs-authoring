import { reporter } from '../../helper/telemetry';
import { readWriteFileWithProgress } from './utilities';
import markdown = require('remark-parse');
import unified = require('unified');
import { output } from '../../helper/output';

const telemetryCommand: string = 'applyCleanup';
export const hashtagRegex = new RegExp(/#(?!#)\s?.*/gm);

/**
 * Delete comments from yaml and markdown
 */
export function removeCommentsFromFile(
	progress: any,
	file: string,
	files: string[] | null,
	index: number | null
): Promise<any> {
	const message = 'Remove comments from file';
	reporter.sendTelemetryEvent('command', { command: telemetryCommand });
	if (file.endsWith('.md')) {
		return readWriteFileWithProgress(progress, file, message, files, index, (data: string) => {
			data = removeHtmlComments(data);
			return data;
		});
	} else if (file.endsWith('.yml')) {
		return readWriteFileWithProgress(progress, file, message, files, index, (data: string) => {
			data = removeHashtagComments(data);
			return data;
		});
	} else {
		return Promise.resolve();
	}
}

/**
 * check for html blocks and make sure they are comments.
 * get the first word of the comment and build replacement regex to remove the comment.
 */
export function removeHtmlComments(data: string) {
	try {
		const processor: any = unified().use(markdown).parse(data);
		if (processor.children) {
			processor.children.forEach((md: any) => {
				if (md.type === 'html' && md.value.startsWith('<!--')) {
					const firstWordRegex = /<!--\W*(\w+)/gim;
					const htmlComment = md.value.match(firstWordRegex);
					const firstWord: string = htmlComment.toString().replace(/[^a-zA-Z0-9]+/, '');
					const commentRegex = new RegExp(`<!--\\s*${firstWord}([^]+?)-->`, 'gmi');
					data = data.replace(commentRegex, '');
				}
			});
			return data;
		}
	} catch (error) {
		output.appendLine(error);
	}
}

export function removeHashtagComments(data: string) {
	try {
		const matches = data.match(hashtagRegex);
		if (matches) {
			matches.forEach(match => {
				if (!match.includes('YamlMime')) {
					data = data.replace(match, '');
				}
			});
		}
		return data;
	} catch (error) {
		output.appendLine(error);
	}
}
