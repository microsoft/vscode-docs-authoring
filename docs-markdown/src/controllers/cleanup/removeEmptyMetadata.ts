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
				let frontMatter = '';
				if (cleanupType === 'empty') {
					frontMatter = deleteEmptyMetadata(metadataMatch[2]);
				}
				if (cleanupType === 'na') {
					frontMatter = deleteNaMetadata(metadataMatch[2]);
				}
				if (cleanupType === 'commented') {
					frontMatter = deleteCommentedMetadata(metadataMatch[2]);
				}
				if (cleanupType === 'all') {
					frontMatter = deleteEmptyMetadata(metadataMatch[2]);
					frontMatter = deleteNaMetadata(metadataMatch[2]);
					frontMatter = deleteCommentedMetadata(metadataMatch[2]);
				}
				data = data.replace(regex, `---${frontMatter}---`);
			}
			return data;
		});
	} else {
		return Promise.resolve();
	}
}

export function deleteEmptyMetadata(frontMatter: string) {
	const metadataListRegex: any = new RegExp(
		/^(\s+\-)(\s*|\s""|\s'')[\n|\r](?=(.|\n|\r)*---\s$)/gim
	);

	frontMatter = frontMatter.replace(metadataListRegex, '');
	const metadataRegex: any = new RegExp(
		/^(\w+\.*\w+?:)(\s*|\s""|\s'')(?!\n*\s+\-\ (\s*|\s""|\s''))[\n|\r](?=(.|\n|\r)*---\s$)/gim
	);
	frontMatter = frontMatter.replace(metadataRegex, '');
	return frontMatter;
}

export function deleteNaMetadata(frontMatter: string) {
	const metadataRegex: any = new RegExp(/^(\w+\.*\w+?:\s(na|n\/a))[\n|\r](?=(.|\n|\r)*---\s$)/gim);
	frontMatter = frontMatter.replace(metadataRegex, '');
	return frontMatter;
}

export function deleteCommentedMetadata(frontMatter: string) {
	const metadataRegex: any = new RegExp(/^(#\s?\w+\.*.*\w+?:).*[\n|\r](?=(.|\n|\r)*---\s$)/gim);
	frontMatter = frontMatter.replace(metadataRegex, '');
	return frontMatter;
}
