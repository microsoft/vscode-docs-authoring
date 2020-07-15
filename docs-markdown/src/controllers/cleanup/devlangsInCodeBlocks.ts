import { reporter } from '../../helper/telemetry';
import { readWriteFileWithProgress } from './utilities';

const telemetryCommand: string = 'applyCleanup';
export const regex = new RegExp(/^```([A-Za-z#]+)/gm);

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

export function findCodeBlocks(data: string) {
	data = lowercaseDevlang(data, regex);
	return data;
}

export function lowercaseDevlang(data: string, regex: RegExp) {
	const matches = data.match(regex);
	if (matches) {
		matches.forEach(match => {
			// lowercase all devlangs
			data = data.replace(regex, function (match) {
				return match.toLowerCase();
			});
		});
		convertDevlang(data);
		return data;
	}
}

export function convertDevlang(data: string) {
	// convert non-supported values to supported ones
	const csharpRegex = new RegExp(/```(c#|cs)\s/gi);
	data = data.replace(csharpRegex, '```csharp');
	const markdownRegex = new RegExp(/```markdown\s/gi);
	data = data.replace(markdownRegex, '```md');
	// eslint-disable-next-line no-console
	console.log(data);
	return data;
}
