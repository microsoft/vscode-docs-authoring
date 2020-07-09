import { reporter } from '../../helper/telemetry';
import { readWriteFileWithProgress } from './utilities';

const telemetryCommand: string = 'applyCleanup';
export const regex = new RegExp(/^```([A-Za-z#]+)/gm);
export const devLangRegex = new RegExp(/```[A-Za-z#]+/i);

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
	data = convertDevlang(data, regex);
	return data;
}

export function convertDevlang(data: string, regex: RegExp) {
	const matches = data.match(regex);
	if (matches) {
		// make all devlangs lowercase
		data = data.replace(devLangRegex, function (match) {
			return match.toLowerCase();
		});
		// convert non-supported values to supported ones
		const csharpRegex = new RegExp(/```(c#|cs)\s/gi);
		data = data.replace(csharpRegex, '```csharp');
		const markdownRegex = new RegExp(/```markdown\s/gi);
		data = data.replace(markdownRegex, '```md');
		return data;
	}
}
