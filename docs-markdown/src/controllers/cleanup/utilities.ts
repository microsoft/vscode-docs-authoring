import { readFile, writeFile } from 'graceful-fs';
import { QuickPickItem, QuickPickOptions } from 'vscode';
import { ignoreFiles, postError } from '../../helper/common';
import jsdiff = require('diff');
import recursive = require('recursive-readdir');

let percentComplete = 1;
/**
 * Checks if array has only one item. if so, then return that item.
 * @param content takes in string data as content and returns
 * first item in array if the array only has one item in array.
 */
export function isSingleItemArray(content: string | undefined) {
	if (content && content.length === 1) {
		if (content[0] === '') {
			return true;
		} else {
			return content[0];
		}
	}
}

/**
 * Takes in data, metadata key, and value to replace,
 * does a find and replace of the matching metadata tag
 * @param data string data from parsed file
 * @param value value to replace regex match of metadata
 * @param variable metadata key as variable
 */
export function singleValueMetadata(data: any, variable: string) {
	const dashRegex = new RegExp(`${variable}:\\s+-\\s(["'\\sA-Za-z0-9\\-\\_]+)$`, 'm');
	const bracketRegex = new RegExp(`${variable}:\\s+\\[(["'\\sA-Za-z0-9\\-\\_]+)\\]$`, 'm');
	const dashMatches = dashRegex.exec(data);
	const bracketMatch = bracketRegex.exec(data);
	if (dashMatches) {
		return data.replace(dashRegex, `${variable}: ${dashMatches[1]}`);
	} else if (bracketMatch) {
		return data.replace(bracketRegex, `${variable}: ${bracketMatch[1]}`);
	} else {
		return data;
	}
}

/**
 * check if the data origin is the same as updated data
 * Write file if change occured. Calculate the percent complete
 * If the percentage complete has changed, report the value
 * And output percentage complete to output console.
 * @param index index of current loop used to get completed percentage
 * @param files list of files
 * @param percentComplete percentage complete for program
 */
export function showProgress(
	index: number | null,
	files: string[] | null,
	progress: any,
	message: string
) {
	if (!files || !index) {
		return 100;
	}
	const currentCompletedPercent = Math.round((index / files.length) * 100);
	if (percentComplete < currentCompletedPercent) {
		percentComplete = currentCompletedPercent;
	}
	progress.report({ increment: percentComplete, message: `${message} ${percentComplete}%` });
	return percentComplete;
}

export function readWriteFileWithProgress(
	progress: any,
	file: string,
	message: string,
	files: string[] | null,
	index: number | null,
	callback: (data: string) => string
) {
	return new Promise((resolve, reject) => {
		readFile(file, 'utf8', (err, data) => {
			if (err) {
				postError(`Error: ${err}`);
				reject();
			}
			const origin = data;
			data = callback(data);
			resolve({ origin, data });
		});
	}).then((result: any) => {
		const diff = jsdiff
			.diffChars(result.origin, result.data)
			.some((part: { added: any; removed: any }) => {
				return part.added || part.removed;
			});
		return new Promise((resolve, reject) => {
			if (diff) {
				writeFile(file, result.data, error => {
					if (error) {
						postError(`Error: ${error}`);
						reject();
					}
					if (files && index) {
						showProgress(index, files, progress, message);
					}
					resolve();
				});
			} else {
				resolve();
			}
		});
	});
}

export function recurseCallback(
	workspacePath: string,
	progress: any,
	callback: (progress: any, file: string, files: string[], index: number) => Promise<any>
): Promise<any> {
	return new Promise((chainResolve, chainReject) =>
		recursive(workspacePath, ignoreFiles, (err: any, files: string[]) => {
			if (err) {
				postError(err);
				chainReject();
			}
			const filePromises: Promise<any>[] = [];
			files.map((file, index) => {
				filePromises.push(callback(progress, file, files, index));
			});
			Promise.all(filePromises).then(() => {
				chainResolve();
			});
		})
	);
}

export function getCleanUpQuickPick() {
	const opts: QuickPickOptions = { placeHolder: 'Cleanup...' };
	const items: QuickPickItem[] = [];
	items.push({
		description: '',
		label: 'Single-valued metadata'
	});
	items.push({
		description: '',
		label: 'Microsoft links'
	});
	items.push({
		description: '',
		label: 'Capitalization of metadata values'
	});
	items.push({
		description: '',
		label: 'Clean up devlang for code blocks'
	});
	items.push({
		description: '',
		label: 'Empty metadata'
	});
	return { items, opts };
}
