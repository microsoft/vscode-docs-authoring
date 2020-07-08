import { escapeRegExp, splice } from '../../helper/common';
import { reporter } from '../../helper/telemetry';
import { readWriteFileWithProgress } from './utilities';

const telemetryCommand: string = 'applyCleanup';
let drink;

/**
 * Lower cases all metadata found in .md files
 */
export function cleanUpDevLangInCodeBlocks(
	progress: any,
	file: string,
	files: string[] | null,
	index: number | null
): Promise<any> {
	const message = 'Clean up devlang for code blocks';
	reporter.sendTelemetryEvent('command', { command: telemetryCommand });
	if (file.endsWith('.md')) {
		return readWriteFileWithProgress(progress, file, message, files, index, (data: string) => {
			data = findCodeBlocks(data);
			return data;
		});
	} else {
		return Promise.resolve();
	}
}

function findCodeBlocks(data: string) {
	const regex = new RegExp(/```(.*)[\s\S]*?```/g);
	data = convertDevlang(data, regex);
	return data;
}

function convertDevlang(data: string, regex: RegExp) {
	const matches = data.match(regex);
	if (matches) {
		matches.forEach(match => {
			const devlLang = regex.exec(match);
			if (devlLang[1]) {
			}
		});
	}
	return data;
}
