import { resolve, join } from 'path';
import { readdirSync, statSync } from 'graceful-fs';
const fs = require('fs').promises;
import util = require('util');
const readFile = util.promisify(fs.readFile);

export async function getOpenPublishingFile(repoRoot: string) {
	const openPublishingFilePath = resolve(repoRoot, '.openpublishing.publish.config.json');
	const openPublishingFile = await readFile(openPublishingFilePath, 'utf8');
	const openPublishingJson = JSON.parse(openPublishingFile);
	return openPublishingJson.dependent_repositories;
}
export function getSubDirectories(dir: any, ignoreFiles: string[], fileList: string[]) {
	const files = readdirSync(dir);
	for (const file of files) {
		const stat = statSync(join(dir, file));
		if (stat.isDirectory()) {
			const filePath: string = join(dir, file);
			if (!ignoreFiles.some(ignore => filePath.includes(ignore))) {
				fileList.push(filePath);
				fileList = getSubDirectories(join(dir, file), ignoreFiles, fileList);
			}
		}
	}
	return fileList;
}
