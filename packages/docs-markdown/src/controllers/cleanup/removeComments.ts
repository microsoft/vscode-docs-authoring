import { reporter } from '../../helper/telemetry';
import { readWriteFileWithProgress } from './utilities';
import markdown = require('remark-parse');
import unified = require('unified');

const telemetryCommand: string = 'applyCleanup';
export const hashtagRegex = new RegExp(/#.*/gm);

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
			data = removeMarkdownComments(data);
			return data;
		});
	} else if (file.endsWith('.yml')) {
		return readWriteFileWithProgress(progress, file, message, files, index, (data: string) => {
			data = removeYamlComments(data);
			return data;
		});
	} else {
		return Promise.resolve();
	}
}

export function removeMarkdownComments(data: string) {
	const processor: any = unified().use(markdown, { commonmark: true }).parse(data);
	if (processor.children) {
		processor.children.forEach((md: any) => {
			if (md.type === 'html') {
				data = data.replace(md.value, '');
			}
		});
		return data;
	}
}

export function removeYamlComments(data: string) {
	if (data.match(hashtagRegex)) {
		data = data.replace(hashtagRegex, '');
	}
	return data;
}
