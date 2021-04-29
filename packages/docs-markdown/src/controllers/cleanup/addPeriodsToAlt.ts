import { escapeRegExp, splice, isNullOrWhiteSpace } from '../../helper/common';
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

export function addPeriodsForMd(data: string) {
	const regex = new RegExp(/\!\[(.*(?<!(\?|\!|\.)))\]\((.*)\)/g);
	const altTextRegex = new RegExp(/\!\[(.*?(?<!(\?|\!|\.)))\]/);
	data = insertPeriod(data, regex, altTextRegex);
	return data;
}

export function addPeriodsForTripleColonImage(data: string) {
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
			if (groups && groups.length > 0) {
				if (!isNullOrWhiteSpace(groups[1])) {
					let imageTagAltTextWithPuctuation;
					const altTextExtraCharacterRegex = /[a-zA-Z](\".*)\]/g;
					const altTextWhitespaceRegex = /(\.\s+)\]/g;
					if (match.match(altTextExtraCharacterRegex)) {
						imageTagAltTextWithPuctuation = match.replace(/(?<!\.)\"(.\W|\S|)\]/g, '."]');
					} else if (match.match(altTextWhitespaceRegex)) {
						imageTagAltTextWithPuctuation = match.replace(/\.\s+/g, '.');
					} else {
						const insertAtPosition = groups.index + groups[0].length - 1;
						imageTagAltTextWithPuctuation = splice(insertAtPosition, match, '.');
					}
					const imageTagRegex = new RegExp(escapeRegExp(match));
					data = data.replace(imageTagRegex, imageTagAltTextWithPuctuation);
				}
			}
		});
	}
	return data;
}
