import { readdir, stat, unlinkSync } from 'fs';
import { join } from 'path';
import { showStatusMessage, templateDirectory, docsAuthoringDirectory } from './common';

// the download process is on a repo-level so this function will be used to delete any files pulled down by the download process.
export async function cleanupDownloadFiles(templates?: boolean) {
	let workingDirectory: string;

	if (templates) {
		workingDirectory = templateDirectory;
	} else {
		workingDirectory = docsAuthoringDirectory;
	}

	readdir(workingDirectory, (err, files) => {
		files.forEach(file => {
			const fullFilePath = join(workingDirectory, file);
			stat(join(fullFilePath), (error, stats) => {
				if (stats.isFile()) {
					unlinkSync(fullFilePath);
				}
				if (error) {
					showStatusMessage(`Error: ${error}`);
				}
			});
		});
	});
}
