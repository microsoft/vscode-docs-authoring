'use strict';

import { existsSync, mkdirSync, readFile, rename } from 'graceful-fs';
import { homedir } from 'os';
import { basename, dirname, extname, join } from 'path';
import { ignoreFiles, postError, showStatusMessage } from '../../helper/common';
import { output } from '../../helper/output';
import { imageExtensions, markdownExtensionFilter } from '../media-controller';
import { showProgress } from './utilities';
import recursive = require('recursive-readdir');

export function getUnusedImagesAndIncludesCommand() {
	const command = [
		{ command: removeUnusedImagesAndIncludes.name, callback: removeUnusedImagesAndIncludes }
	];

	return command;
}
/**
 * Removes all unused images and includes.
 */
const INCLUDE_RE = /\[!include\s?\[.*\]\((.*)\)\]|<img[^>]+src="([^">]+)"|\((.*?.(?:png|jpg|jpeg|svg|tiff|gif))\s*(?:".*")*\)|source\s*=\s*"(.*?)"|lightbox\s*=\s*"(.*?)"|"\s*source_path\s*"\s*:\s*"(.*?)"|href\s*:\s*(.*)"/gim;
const message = 'Removing unused images and includes. This could take several minutes.';
export async function removeUnusedImagesAndIncludes(
	progress: any,
	workspacePath: string,
	resolve: any
): Promise<any> {
	let unusedFiles = await getImageAndIncludesFiles(workspacePath);
	const files = await recursive(workspacePath, ignoreFiles);
	const promises: Promise<{} | void>[] = [];
	files.map((file: string, index: number) => {
		if (
			file.endsWith('.md') ||
			file.endsWith('.openpublishing.redirection.json') ||
			file.endsWith('toc.yml')
		) {
			promises.push(
				new Promise<any>((res, reject) => {
					readFile(file, 'utf8', (err, data) => {
						// read through data and get images and includes,
						// cross them with our list of images and includes
						let match: any;
						// tslint:disable-next-line: no-conditional-assignment
						while ((match = INCLUDE_RE.exec(data))) {
							unusedFiles = unusedFiles.filter(ff => {
								const ffPath = decodeURI(
									(
										match[1] ||
										match[2] ||
										match[3] ||
										match[4] ||
										match[5] ||
										match[6] ||
										match[7]
									).toLowerCase()
								);
								return ffPath.indexOf(ff.label.toLowerCase()) === -1;
							});
						}
						showProgress(index, files, progress, message);
						res();
					});
				}).catch(error => {
					postError(error);
				})
			);
		}
	});

	Promise.all(promises)
		.then(() => {
			// now copy the unused files over :)
			const unusedImagesDirectory = join(homedir(), 'Docs Authoring', 'unusedImages');

			if (!existsSync(unusedImagesDirectory)) {
				mkdirSync(unusedImagesDirectory);
			}

			unusedFiles.forEach(async uf => {
				rename(join(uf.description, uf.label), join(unusedImagesDirectory, uf.label), err => {
					output.appendLine(`failed to move ${uf.label}`);
				});
			});

			progress.report({
				increment: 100,
				message: 'Cleanup: Removal of unused images and includes completed.'
			});
			showStatusMessage(`Cleanup: Removal of unused images and includes completed.`);
			setTimeout(() => {
				resolve();
			}, 2000);
		})
		.catch(error => {
			postError(error);
		});
}

export async function getImageAndIncludesFiles(
	workspacePath: string
): Promise<{ label: any; description: any }[]> {
	const items: { label: any; description: any }[] = [];

	// recursively get all the files from the root folder
	const fileFilter = imageExtensions.concat(markdownExtensionFilter);
	const files = await recursive(workspacePath, [
		'.git',
		'.github',
		'.vscode',
		'.vs',
		'node_module',
		'*.yml'
	]);
	files
		.filter((file: any) => fileFilter.indexOf(extname(file.toLowerCase())) !== -1)
		.forEach((file: any) => {
			if (!file.endsWith('.md') || file.indexOf('includes') !== -1) {
				items.push({ label: basename(file), description: dirname(file) });
			}
		});
	return items;
}
