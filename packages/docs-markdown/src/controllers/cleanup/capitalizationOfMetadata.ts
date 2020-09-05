import { postError } from '../../helper/common';
import { readWriteFileWithProgress } from './utilities';

/**
 * Lower cases all metadata found in .md files
 */
export function capitalizationOfMetadata(
	progress: any,
	file: string,
	files: string[] | null,
	index: number | null
) {
	const message = 'Capitalization of metadata values';
	if (file.endsWith('.md')) {
		return readWriteFileWithProgress(progress, file, message, files, index, data => {
			if (data.startsWith('---')) {
				const regex = new RegExp(`^(---)([^]+?)(---)$`, 'm');
				const metadataMatch = data.match(regex);
				let frontMatter = '';
				if (metadataMatch) {
					frontMatter = lowerCaseData(metadataMatch[2], 'ms.author');
					frontMatter = lowerCaseData(metadataMatch[2], 'author');
					frontMatter = lowerCaseData(metadataMatch[2], 'ms.prod');
					frontMatter = lowerCaseData(metadataMatch[2], 'ms.service');
					frontMatter = lowerCaseData(metadataMatch[2], 'ms.subservice');
					frontMatter = lowerCaseData(metadataMatch[2], 'ms.technology');
					frontMatter = lowerCaseData(metadataMatch[2], 'ms.topic');
					data = data.replace(regex, `---${frontMatter}---`);
				}
			}
			return data;
		});
	} else {
		return Promise.resolve();
	}
}
/**
 * takes data as input, and passes variable into regex
 * to be used to find metadata key and replace value with lowercase data.
 * @param data takes string data from file
 * @param variable metadata key to use in regex to replace
 */
export function lowerCaseData(data: any, variable: string) {
	const regex = new RegExp(`^(${variable}:)(.*(\\S\\s)?)`, 'm');
	const captureParts = regex.exec(data);
	let value = '';
	if (captureParts && captureParts.length > 2) {
		value = captureParts[2].toLowerCase();
		if (value.match(/^\s*$/) !== null) {
			return data;
		}
		try {
			return data.replace(regex, `${variable}:${value}`);
		} catch (error) {
			postError(`Error occurred: ${error}`);
		}
	}

	return data;
}
