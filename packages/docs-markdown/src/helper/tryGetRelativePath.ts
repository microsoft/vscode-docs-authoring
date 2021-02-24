import { relative } from 'path';
import { postWarning } from './common';

export function tryGetRelativePath(directory: string, absolutePath: string): string {
	try {
		const relativePath = relative(directory, absolutePath);
		return !!relativePath ? relativePath.replace(/\\/g, '/') : null;
	} catch (error) {
		postWarning(error);
		return null;
	}
}
