import { postError } from '../../helper/common';
import { isSingleItemArray, singleValueMetadata } from './utilities';
import jsyaml = require('js-yaml');

/**
 * Takes in markdown data string and parses the file.
 * Then perform operations to handle single item arrays
 * and convert them to single item values then return the data.
 * @param data data as yaml string from file
 */
export function handleMarkdownMetadata(metadata: string) {
	try {
		const yamlContent = jsyaml.load(metadata);
		if (yamlContent) {
			if (isSingleItemArray(yamlContent.author)) {
				metadata = singleValueMetadata(metadata, 'author');
			}
			if (isSingleItemArray(yamlContent['ms.author'])) {
				metadata = singleValueMetadata(metadata, 'ms.author');
			}
			if (isSingleItemArray(yamlContent['ms.component'])) {
				metadata = singleValueMetadata(metadata, 'ms.component');
			}
			if (isSingleItemArray(yamlContent['ms.date'])) {
				metadata = singleValueMetadata(metadata, 'ms.date');
			}
			if (isSingleItemArray(yamlContent['ms.prod'])) {
				metadata = singleValueMetadata(metadata, 'ms.prod');
			}
			if (isSingleItemArray(yamlContent['ms.service'])) {
				metadata = singleValueMetadata(metadata, 'ms.service');
			}
			if (isSingleItemArray(yamlContent['ms.subservice'])) {
				metadata = singleValueMetadata(metadata, 'ms.subservice');
			}
			if (isSingleItemArray(yamlContent['ms.technology'])) {
				metadata = singleValueMetadata(metadata, 'ms.technology');
			}
			if (isSingleItemArray(yamlContent['ms.topic'])) {
				metadata = singleValueMetadata(metadata, 'ms.topic');
			}
			if (isSingleItemArray(yamlContent['ms.title'])) {
				metadata = singleValueMetadata(metadata, 'ms.title');
			}
			if (isSingleItemArray(yamlContent['ms.custom'])) {
				metadata = singleValueMetadata(metadata, 'ms.custom');
			}
		}
	} catch (error) {
		postError(error);
	}
	return metadata;
}
