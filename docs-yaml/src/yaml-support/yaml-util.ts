import {readFileSync, existsSync} from 'fs';

/**
 * Load json data from a json file.
 * @param {string} file
 * @returns the parsed data if no error occurs, otherwise undefined is returned
 */
export function loadJson(file: string): any {
    if (existsSync(file)) {
        try {
            return JSON.parse(readFileSync(file, 'utf-8'));
        } catch (err) {
            // ignore
        }
    }
    return undefined;
}

/**
 * Get YamlMime of a yaml document
 * @param document
 * @returns the yamlMime if no error occurs, otherwise undefined is returned
 */
export function getYamlMime(yamlDocument: string): string {
    var regex = /^### YamlMime:([A-Z]\w+)/g;
    var m = regex.exec(yamlDocument);
    if (m !== null) {
        return m[1];
    }
    return undefined;
}
