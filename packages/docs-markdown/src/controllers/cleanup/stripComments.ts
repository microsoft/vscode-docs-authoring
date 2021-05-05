import { reporter } from '../../helper/telemetry';
import { readWriteFileWithProgress } from './utilities';
import markdown = require('remark-parse');
import unified = require('unified');

const telemetryCommand: string = 'applyCleanup';
export const hashtagRegex = new RegExp(/#(?!#)(.*)/gm);
export const htmlRegex = new RegExp(/<!--[\s\S]*?-->/g);

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
		return readWriteFileWithProgress(progress, file, message, files, index, (data: any) => {
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

export function removeHtmlComments(data: string) {
	const processor: any = unified().use(markdown, { commonmark: true }).parse(data);
	if (processor.children) {
		processor.children.forEach((md: any) => {
			if (md.type === 'html') {
				data = data.replace(htmlRegex, '');
			}
		});
		return data;
	}
}

export function removeHashtagComments(data: string) {
	const matches = data.match(hashtagRegex);
	if (matches) {
		matches.forEach(match => {
			if (!match.includes('YamlMime')) {
				data = data.replace(match, '');
			}
		});
	}
	return data;
}
