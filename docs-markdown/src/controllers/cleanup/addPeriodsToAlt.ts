import { escapeRegExp, splice } from '../../helper/common';
import { reporter } from '../../helper/telemetry';
import { readWriteFileWithProgress } from './utilities';

const telemetryCommand: string = 'applyCleanup';
/**
 * Lower cases all metadata found in .md files
 */
export function addPeriodsToAlt(
	progress: any,
	file: string,
	files: string[] | null,
	index: number | null
): Promise<any> {
	const message = 'Add periods to alt text';
	reporter.sendTelemetryEvent('command', { command: telemetryCommand });
	if (file.endsWith('.md')) {
		return readWriteFileWithProgress(progress, file, message, files, index, (data: string) => {
			data = addPeriodsForMd(data);
			data = addPeriodsForTripleColonImage(data);
			return data;
		});
	} else {
		return Promise.resolve();
	}
}

function addPeriodsForMd(data: string) {
	const regex = new RegExp(/\!\[(.*(?<!(\?|\!|\.)))\]\((.*)\)/g);
	const altTextRegex = new RegExp(/\!\[(.*?(?<!(\?|\!|\.)))\]/);
	data = insertPeriod(data, regex, altTextRegex);
	return data;
}

function addPeriodsForTripleColonImage(data: string) {
	const regex = new RegExp(
		/image\s+(((source|type|alt-text|lightbox|border|loc-scope)="([a-zA-Z0-9_.\/ -]+))"\s*)+:::/g
	);
	const altTextRegex = new RegExp(/alt-text="(.*?(?<!(\?|\!|\.)))"/);
	data = insertPeriod(data, regex, altTextRegex);
	return data;
}

function insertPeriod(data: string, regex: RegExp, altTextRegex: RegExp) {
	const matches = data.match(regex);
	if (matches) {
		matches.forEach(match => {
			const groups = altTextRegex.exec(match);
			if (groups) {
				const insertAtPosition = groups.index + groups[0].length - 1;
				const imageTagAltTextWithPuctuation = splice(insertAtPosition, match, '.');
				const imageTagRegex = new RegExp(escapeRegExp(match));
				data = data.replace(imageTagRegex, imageTagAltTextWithPuctuation);
			}
		});
	}
	return data;
}
