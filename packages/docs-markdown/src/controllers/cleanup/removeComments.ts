import { reporter } from '../../helper/telemetry';
import { readWriteFileWithProgress } from './utilities';

const telemetryCommand: string = 'applyCleanup';
export const htmlRegex = new RegExp(/<!--([^]+?)-->/gm);
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
		return readWriteFileWithProgress(progress, file, message, files, index, (data: string) => {
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
	if (data.match(htmlRegex)) {
		data = data.replace(htmlRegex, '');
	}
	return data;
}

export function removeYamlComments(data: string) {
	if (data.match(hashtagRegex)) {
		data = data.replace(hashtagRegex, '');
	}
	return data;
}
