/* eslint-disable dot-notation */
import { reporter } from '../../helper/telemetry';
import { readWriteFileWithProgress } from './utilities';

import markdown = require('remark-parse');
import unified = require('unified');
import { Position, Range, TextEdit, TextEditorEdit, window } from 'vscode';
let range;

const telemetryCommand: string = 'applyCleanup';
export const htmlRegex = new RegExp(/<!--([^]+?)-->/gm);
export const hashtagRegex = new RegExp(/#.*/gm);
export const codeBlockRegex = new RegExp(/`{3}([^]+?)`{3}/gm);

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
			// data = removeMarkdownComments(data);
			data = findCodeBlocks(data);
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

export function findCodeBlocks(data: string) {
	const processor: any = unified().use(markdown, { commonmark: true }).parse(data);
	// eslint-disable-next-line no-console
	// console.log(processor);
	if (processor.children) {
		processor.children.forEach(async (md: any, index: number) => {
			try {
				// eslint-disable-next-line no-console
				//console.log(md['type']);
				/* if (md['type'] === 'html') {
					// eslint-disable-next-line no-console
					//console.log(md['value']);
					return;
				} */
			} catch (error) {
				// eslint-disable-next-line no-console
				console.log(error);
			}
		});
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
