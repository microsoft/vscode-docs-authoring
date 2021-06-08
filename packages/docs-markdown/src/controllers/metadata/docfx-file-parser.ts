import { existsSync, readFileSync, watch } from 'fs';
import { tryFindFile } from '../../helper/common';
import { DocFxMetadata } from './docfx-metadata';

let cachedDocFxJsonFile: DocFxFileInfo | null = null;

export type DocFxFileInfo = {
	readonly fullPath?: string | undefined;
	readonly contents?: DocFxMetadata | undefined;
};

export function readDocFxJson(workspaceRootDirectory: string): DocFxFileInfo | null {
	if (cachedDocFxJsonFile !== null) {
		return cachedDocFxJsonFile;
	}

	// Read the DocFX.json file, search for metadata defaults.
	const docFxJson = tryFindFile(workspaceRootDirectory, 'docfx.json', true);
	if (!!docFxJson && existsSync(docFxJson)) {
		const jsonBuffer = readFileSync(docFxJson);
		cachedDocFxJsonFile = {
			fullPath: docFxJson,
			contents: JSON.parse(jsonBuffer.toString()) as DocFxMetadata
		};

		watch(docFxJson, (event, fileName) => {
			if (fileName && event === 'change') {
				// If the file changes, clear out our cache - and reload it next time it's needed.
				cachedDocFxJsonFile = null;
			}
		});

		return cachedDocFxJsonFile;
	}

	return null;
}
