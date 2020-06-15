import { readWriteFileWithProgress } from './utilities';
import jsyaml = require('js-yaml');

/**
 * Cleanup empty, na and commented out metadata attributes found in .md files
 */
export function removeEmptyMetadata(
	progress: any,
	file: string,
	files: string[] | null,
	index: number | null,
	cleanupType: string
) {
	const message = 'Removal of metadata values';
	if (file.endsWith('.md')) {
		return readWriteFileWithProgress(progress, file, message, files, index, (data: string) => {
			if (data.startsWith('---')) {
				const regex = new RegExp(`^(---)([^]+?)(---)$`, 'm');
				const metadataMatch = data.match(regex);
				if (cleanupType === 'empty') {
					data = deleteEmptyMetadata(data, metadataMatch[2]);
				}
				if (cleanupType === 'na') {
					data = deleteNaMetadata(data, metadataMatch[2]);
				}
				if (cleanupType === 'commented') {
					data = deleteCommentedMetadata(data, metadataMatch[2]);
				}
				if (cleanupType === 'all') {
					data = deleteEmptyMetadata(data, metadataMatch[2]);
					data = deleteNaMetadata(data, metadataMatch[2]);
					data = deleteCommentedMetadata(data, metadataMatch[2]);
				}
			}
			return data;
		});
	} else {
		return Promise.resolve();
	}
}

export function deleteEmptyMetadata(data: any, metadata: string) {
	const yamlContent = jsyaml.load(metadata);
	if (yamlContent) {
		const metadataListRegex: any = new RegExp(
			/^(\s+\-)(\s*|\s""|\s'')[\n|\r](?=(.|\n|\r)*---\s$)/gim
		);
		data = data.replace(metadataListRegex, '');
		const metadataRegex: any = new RegExp(
			/^(\w+\.*\w+?:)(\s*|\s""|\s'')(?!\n*\s+\-\ (\s*|\s""|\s''))[\n|\r](?=(.|\n|\r)*---\s$)/gim
		);
		data = data.replace(metadataRegex, '');
		return data;
	}
}

export function deleteNaMetadata(data: any, metadata: string) {
	const yamlContent = jsyaml.load(metadata);
	if (yamlContent) {
		const metadataRegex: any = new RegExp(
			/^(\w+\.*\w+?:\s(na|n\/a))[\n|\r](?=(.|\n|\r)*---\s$)/gim
		);
		data = data.replace(metadataRegex, '');
		return data;
	}
}

export function deleteCommentedMetadata(data: any, metadata: string) {
	const yamlContent = jsyaml.load(metadata);
	if (yamlContent) {
		const metadataRegex: any = new RegExp(/^(#\s?\w+\.*.*\w+?:).*[\n|\r](?=(.|\n|\r)*---\s$)/gim);
		data = data.replace(metadataRegex, '');
		return data;
	}
}
