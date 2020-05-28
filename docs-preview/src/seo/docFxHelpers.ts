/* eslint-disable @typescript-eslint/no-var-requires */
import { existsSync, readFileSync } from 'fs';
import { tryFindFile } from '../helper/common';
import { DocFxMetadata } from './docFxTypes';
const util = require('util');
const glob = util.promisify(require('glob'));

export function getDocfxMetadata(basePath) {
	const docFxJson = tryFindFile(basePath, 'docfx.json');
	if (!!docFxJson && existsSync(docFxJson)) {
		const jsonBuffer = readFileSync(docFxJson);
		const metadata = JSON.parse(jsonBuffer.toString()) as DocFxMetadata;
		if (metadata && metadata.build && metadata.build.fileMetadata) {
			return metadata;
		}
	}
}

export async function tryGetFileMetadataTitleSuffix(
	docfxMetadata: DocFxMetadata,
	basePath,
	filePath
) {
	if (docfxMetadata.build.fileMetadata && docfxMetadata.build.fileMetadata.titleSuffix) {
		const value = await getReplacementValue(
			docfxMetadata.build.fileMetadata.titleSuffix,
			basePath,
			filePath
		);
		if (value) {
			return value;
		}
	}
	return '';
}

export function tryGetGlobalMetadataTitleSuffix(docfxMetadata: DocFxMetadata) {
	if (docfxMetadata.build.globalMetadata && docfxMetadata.build.globalMetadata.titleSuffix) {
		return docfxMetadata.build.globalMetadata.titleSuffix;
	}
	return '';
}

async function getReplacementValue(
	globs: { [glob: string]: string },
	basePath: string,
	fsPath: string
): Promise<string | undefined> {
	let titleSuffix = '';
	if (globs) {
		const globKeys = Object.keys(globs).map(key => ({ key, segments: key.split('/') }));
		for (let i = 0; i < globKeys.length; ++i) {
			const globKey = globKeys[i];
			const files = await glob(globKey.key, { cwd: basePath });
			// eslint-disable-next-line @typescript-eslint/prefer-for-of
			for (let index = 0; index < files.length; index++) {
				if (files[index] === fsPath) {
					titleSuffix = globs[globKey.key];
					i = globKeys.length;
					break;
				}
			}
		}
	}

	return titleSuffix;
}
