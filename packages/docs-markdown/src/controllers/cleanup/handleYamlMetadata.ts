import { postError } from '../../helper/common';
import { isSingleItemArray, singleValueMetadata } from './utilities';
import jsyaml = require('js-yaml');

/**
 * Takes in yaml data string and parses the file.
 * Then perform operations to handle single item arrays
 * and convert them to single item values then return the data.
 * @param data data as yaml string from file
 */
export function handleYamlMetadata(data: string) {
	try {
		const yamlContent = jsyaml.load(data);
		if (yamlContent.metadata) {
			if (isSingleItemArray(yamlContent.metadata.author)) {
				data = singleValueMetadata(data, 'author');
			}
			if (isSingleItemArray(yamlContent.metadata['ms.author'])) {
				data = singleValueMetadata(data, 'ms.author');
			}
			if (isSingleItemArray(yamlContent.metadata['ms.component'])) {
				data = singleValueMetadata(data, 'ms.component');
			}
			if (isSingleItemArray(yamlContent.metadata['ms.date'])) {
				data = singleValueMetadata(data, 'ms.date');
			}
			if (isSingleItemArray(yamlContent.metadata['ms.prod'])) {
				data = singleValueMetadata(data, 'ms.prod');
			}
			if (isSingleItemArray(yamlContent.metadata['ms.service'])) {
				data = singleValueMetadata(data, 'ms.service');
			}
			if (isSingleItemArray(yamlContent.metadata['ms.subservice'])) {
				data = singleValueMetadata(data, 'ms.subservice');
			}
			if (isSingleItemArray(yamlContent.metadata['ms.technology'])) {
				data = singleValueMetadata(data, 'ms.technology');
			}
			if (isSingleItemArray(yamlContent.metadata['ms.topic'])) {
				data = singleValueMetadata(data, 'ms.topic');
			}
			if (isSingleItemArray(yamlContent.metadata['ms.title'])) {
				data = singleValueMetadata(data, 'ms.title');
			}
		}
	} catch (error) {
		postError(error);
	}
	return data;
}
