import { output } from '../helper/common';

/**
 * Load json data from a json file.
 * @param {string} file
 * @returns the parsed data if no error occurs, otherwise undefined is returned
 */
export function loadJson(mappingFile: string): any {
	try {
		return JSON.parse(mappingFile);
	} catch (error) {
		output.appendLine(error);
	}
	return undefined;
}

/**
 * Get YamlMime of a yaml document
 * @param document
 * @returns the yamlMime if no error occurs, otherwise undefined is returned
 */
export function getYamlMime(yamlDocument: string): string {
	const regex = /^### YamlMime:([A-Z]\w+)/g;
	const m = regex.exec(yamlDocument);
	if (m !== null) {
		return m[1];
	}
	return undefined;
}
