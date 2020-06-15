import { postError } from '../../helper/common';
import { isSingleItemArray, singleValueMetadata } from './utilities';
import jsyaml = require('js-yaml');

/**
 * Takes in markdown data string and parses the file.
 * Then perform operations to handle single item arrays
 * and convert them to single item values then return the data.
 * @param data data as yaml string from file
 */
export function handleMarkdownMetadata(data: string, metadata: string) {
	try {
		const yamlContent = jsyaml.load(metadata);
		if (yamlContent) {
			if (isSingleItemArray(yamlContent.author)) {
				data = singleValueMetadata(data, 'author');
			}
			if (isSingleItemArray(yamlContent['ms.author'])) {
				data = singleValueMetadata(data, 'ms.author');
			}
			if (isSingleItemArray(yamlContent['ms.component'])) {
				data = singleValueMetadata(data, 'ms.component');
			}
			if (isSingleItemArray(yamlContent['ms.date'])) {
				data = singleValueMetadata(data, 'ms.date');
			}
			if (isSingleItemArray(yamlContent['ms.prod'])) {
				data = singleValueMetadata(data, 'ms.prod');
			}
			if (isSingleItemArray(yamlContent['ms.service'])) {
				data = singleValueMetadata(data, 'ms.service');
			}
			if (isSingleItemArray(yamlContent['ms.subservice'])) {
				data = singleValueMetadata(data, 'ms.subservice');
			}
			if (isSingleItemArray(yamlContent['ms.technology'])) {
				data = singleValueMetadata(data, 'ms.technology');
			}
			if (isSingleItemArray(yamlContent['ms.topic'])) {
				data = singleValueMetadata(data, 'ms.topic');
			}
			if (isSingleItemArray(yamlContent['ms.title'])) {
				data = singleValueMetadata(data, 'ms.title');
			}
			if (isSingleItemArray(yamlContent['ms.custom'])) {
				data = singleValueMetadata(data, 'ms.custom');
			}
		}
	} catch (error) {
		postError(error);
	}
	return data;
}
