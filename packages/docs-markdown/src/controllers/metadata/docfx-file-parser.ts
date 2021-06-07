import { existsSync, readFileSync, watch } from 'fs';
import { tryFindFile } from '../../helper/common';
import { DocFxMetadata } from './docfx-metadata';

let cachedDocFxJsonFile: DocFxMetadata | null = null;

export function readDocFxJson(filePath: string): DocFxMetadata | null {
	if (cachedDocFxJsonFile !== null) {
		return cachedDocFxJsonFile;
	}

	// Read the DocFX.json file, search for metadata defaults.
	const docFxJson = fileFile(filePath);
	if (!!docFxJson && existsSync(docFxJson)) {
		const jsonBuffer = readFileSync(docFxJson);
		cachedDocFxJsonFile = JSON.parse(jsonBuffer.toString()) as DocFxMetadata;

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

function fileFile(filePath: string): string {
	return tryFindFile(filePath, 'docfx.json');
}
