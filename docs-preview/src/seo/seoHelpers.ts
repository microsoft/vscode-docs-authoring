import { existsSync, readFileSync } from 'fs';
import * as jsyaml from 'js-yaml';
import { join } from 'path';
import { postWarning } from '../helper/common';
import {
	getDocfxMetadata,
	tryGetFileMetadataTitleSuffix,
	tryGetGlobalMetadataTitleSuffix
} from './docFxHelpers';
import { repoMapping } from './repoMapping';

export function getFirstParagraph(markdown) {
	const metadataRegex = new RegExp(`^(---)([^]+?)(---)$`, 'm');
	markdown = markdown.replace(metadataRegex, '');
	const frstParagraphRegex = new RegExp(`^(?!#).+`, 'm');
	const firstParagraphMatch = markdown.match(frstParagraphRegex);
	if (firstParagraphMatch) {
		return shortenWithElipsesAtWordEnd(firstParagraphMatch[0], 305);
	}
	return markdown;
}

export async function parseMarkdownMetadata(metadata, markdown, basePath, filePath) {
	const details = { title: '', description: '', date: '' };
	try {
		const yamlContent = jsyaml.load(metadata);
		if (yamlContent) {
			details.title = await getTitle(yamlContent, details.title, basePath, filePath);
			details.title = checkIfContainsMicrosoftDocs(details.title);
			details.title = shortenWithElipsesAtWordEnd(details.title, 63);
			details.description = getMarkdownDescription(details, yamlContent, markdown);
			details.date = yamlContent['ms.date'];
		}
	} catch (error) {
		postWarning(
			`Unable to parse yaml header. There is a problem with your yaml front matter. ${error}`
		);
	}
	return details;
}

function checkIfContainsMicrosoftDocs(title) {
	if (title.includes('| Microsoft Docs')) {
		return title;
	} else {
		return `${title} | Microsoft Docs`;
	}
}

function getMarkdownDescription(
	details: { title: string; description: string; date: string },
	yamlContent: any,
	markdown: any
) {
	details.description = yamlContent.description;
	if (!details.description) {
		details.description = getFirstParagraph(markdown);
	}
	return shortenWithElipsesAtWordEnd(details.description, 305);
}

async function getTitle(yamlContent: any, title: string, basePath: any, filePath: any) {
	if (yamlContent.titleSuffix) {
		title = `${yamlContent.title} - ${yamlContent.titleSuffix}`;
	} else {
		const docfxMetadata = getDocfxMetadata(basePath);
		let titleSuffix = await tryGetFileMetadataTitleSuffix(docfxMetadata, basePath, filePath);
		if (titleSuffix) {
			title = `${yamlContent.title} - ${titleSuffix}`;
		} else {
			titleSuffix = tryGetGlobalMetadataTitleSuffix(docfxMetadata);
			if (titleSuffix) {
				title = `${yamlContent.title} - ${titleSuffix}`;
			} else {
				title = `${yamlContent.title}`;
			}
		}
	}
	return title;
}

export async function parseYamlMetadata(metadata, breadCrumb, basePath, filePath) {
	const details = { title: '', description: '' };
	try {
		const yamlContent = jsyaml.load(metadata);
		if (yamlContent && yamlContent.metadata) {
			details.title = getMainContentIfExists(yamlContent.metadata.title, yamlContent.title);
			details.description = getMainContentIfExists(
				yamlContent.metadata.description,
				yamlContent.summary
			);
			if (breadCrumb.includes('› Docs › Learn › Browse')) {
				details.title = `${details.title} - Learn`;
				details.description = getYamlDescription(yamlContent);
			} else {
				details.title = await getTitle(yamlContent, details.title, basePath, filePath);
			}
			details.title = checkIfContainsMicrosoftDocs(details.title);
			details.title = shortenWithElipsesAtWordEnd(details.title, 63);
			details.description = shortenWithElipsesAtWordEnd(details.description, 305);
		}
	} catch (error) {
		postWarning(`Unable to parse yaml file. There is a problem your yaml file. ${error}`);
	}
	return details;
}

function getYamlDescription(yamlContent) {
	let description = '';
	if (yamlContent.title) {
		description = yamlContent.title;
		description = endWithPeriod(yamlContent.title);
	}
	if (yamlContent.summary) {
		description += ` ${yamlContent.summary}`;
		description = endWithPeriod(description);
	}
	if (yamlContent.abstract) {
		description += buildParagraphFromAbstract(yamlContent.abstract);
	}
	return description;
}

function buildParagraphFromAbstract(abstract) {
	abstract = abstract.replace(/\n/g, '');
	abstract = abstract.replace(/-\s+/gm, '. ');
	abstract = abstract.replace(/:./g, ':');
	abstract = endWithPeriod(abstract);
	return abstract;
}

function endWithPeriod(content: string) {
	if (!content.endsWith('.')) {
		content += '.';
	}
	return content;
}

function getMainContentIfExists(main: string, alt: string) {
	if (main) {
		return main;
	} else {
		return alt;
	}
}

export function getBreadCrumbPath(basePath: string, filePath: string) {
	let breadCrumb = 'docs.microsoft.com';
	let breadCrumbs = [];

	breadCrumbs = getBreadCrumbs(basePath, filePath);
	if (breadCrumbs.length !== 0) {
		breadCrumbs = [...breadCrumbs, ...getExtendedBreadCrumbs(basePath, filePath)];
	}
	if (breadCrumbs.length === 0) {
		breadCrumbs = getRootBreadCrumbs(basePath, filePath);
	}
	if (breadCrumbs.length !== 0) {
		if (breadCrumbs.length > 2) {
			breadCrumb += ` › ... `;
			breadCrumbs.splice(breadCrumbs.length - 1, breadCrumbs.length).forEach(dir => {
				breadCrumb += ` › ${dir} `;
			});
		} else {
			breadCrumbs.forEach(dir => {
				breadCrumb += ` › ${dir} `;
			});
		}
	} else {
		const directory = getDirectoryName(basePath.split('/'));
		if (directory) {
			if (directory.name === 'Learn') {
				breadCrumb += ` › Docs › ${directory.name} › Browse`;
			} else {
				breadCrumb += ` › en-us › ${directory.name} `;
			}
		}
		let repoArr = filePath.split('/');
		if (filePath.startsWith('docs')) {
			repoArr = repoArr.slice(0, -1);
		} else {
			repoArr = repoArr.slice(1, -1);
		}
		repoArr.forEach(dir => {
			breadCrumb += ` › ${dir} `;
		});
	}

	if (breadCrumb === 'docs.microsoft.com') {
		breadCrumb += ' › en-us';
	}

	return shortenWithElipses(breadCrumb, 70);
}

function getRootBreadCrumbs(basePath, filePath) {
	let breadCrumb: string[] = [];
	let matchPath = '';
	const docFxMetadata = getDocfxMetadata(basePath);
	let breadCrumbPath = docFxMetadata.build.globalMetadata.breadcrumb_path;
	if (breadCrumbPath.startsWith('~')) {
		breadCrumbPath = breadCrumbPath.replace('~', '');
	}
	if (breadCrumbPath.startsWith('/azure')) {
		breadCrumbPath = breadCrumbPath.replace('/azure', '').replace('.json', '.yml');
	}
	breadCrumbPath = join(basePath, breadCrumbPath);
	if (existsSync(breadCrumbPath)) {
		const pathParts = filePath.split('/');
		if (pathParts.length > 1) {
			matchPath = pathParts.slice(1, -1).join('/');
		}
		const yamlTOC = readFileSync(breadCrumbPath, 'utf8');
		const TOC = jsyaml.load(yamlTOC);
		let breadCrumbs: { breadCrumb: string[]; found: boolean }[] = [{ breadCrumb, found: false }];
		TOC.forEach(node => {
			if (node.items && node.items.length > 0) {
				node.items.forEach((item, index) => {
					if (!breadCrumbs[index]) {
						breadCrumbs.push({ breadCrumb: [], found: false });
					}
					breadCrumbs[index].breadCrumb.push(node.name);
					if (item.tocHref.includes(filePath)) {
						breadCrumbs[index].breadCrumb.push(node.name);
						breadCrumbs[index].found = true;
						return;
					}
					breadCrumbs = getRootNodes(item, matchPath, breadCrumbs, index);
				});
			}
		});
		breadCrumb = findBreadCrumb(breadCrumbs, breadCrumb);
	}
	return breadCrumb;
}

function getRootNodes(
	node: any,
	filePath: string,
	breadCrumbs: { breadCrumb: string[]; found: boolean }[],
	index: number
) {
	if (node.tocHref.endsWith(filePath) || node.tocHref.endsWith(`${filePath}/`)) {
		breadCrumbs[index].breadCrumb.push(node.name);
		breadCrumbs[index].found = true;
		return breadCrumbs;
	}
	if (node.items && node.items.length > 0) {
		breadCrumbs[index].breadCrumb.push(node.name);
		node.items.forEach(item => {
			if (breadCrumbs[index].found) {
				return breadCrumbs;
			}
			return getRootNodes(item, filePath, breadCrumbs, index);
		});
	}
	return breadCrumbs;
}

function getBreadCrumbs(basePath, filePath) {
	let tocPath = '';
	let pathWithoutFileName = '';
	let breadCrumbs: string[] = [];
	const pathParts = filePath.split('/');
	if (pathParts.length > 1) {
		pathWithoutFileName = pathParts.slice(0, -1).join('/');
		tocPath = join(pathWithoutFileName, '../', 'breadcrumb', 'toc.yml');
	}
	tocPath = join(basePath, tocPath);
	if (existsSync(tocPath)) {
		const yamlTOC = readFileSync(tocPath, 'utf8');
		const TOC = jsyaml.load(yamlTOC);
		TOC.forEach(node => {
			breadCrumbs = getParentNodes(node, pathWithoutFileName, breadCrumbs);
		});
	}
	return breadCrumbs;
}

function getExtendedBreadCrumbs(basePath, filePath) {
	let breadCrumb: string[] = [];
	const pathParts = filePath.split('/');
	const tocPath = getTocPath(pathParts, basePath);
	if (existsSync(tocPath)) {
		const yamlTOC = readFileSync(tocPath, 'utf8');
		const TOC = jsyaml.load(yamlTOC);
		let breadCrumbs: { breadCrumb: string[]; found: boolean }[] = [{ breadCrumb, found: false }];
		const fileName = pathParts.pop();
		TOC.forEach((node, index) => {
			breadCrumbs = getChildNodes(node, fileName, breadCrumbs, index);
		});
		breadCrumb = findBreadCrumb(breadCrumbs, breadCrumb);
	}
	return breadCrumb;
}

function findBreadCrumb(
	breadCrumbs: { breadCrumb: string[]; found: boolean }[],
	breadCrumb: string[]
) {
	breadCrumbs.forEach(item => {
		if (item.found) {
			breadCrumb = item.breadCrumb;
			return;
		}
	});
	return breadCrumb;
}

function getTocPath(pathParts: string[], basePath: string) {
	let tocPath = '';
	if (pathParts.length > 1) {
		const pathWithoutFileName = pathParts.slice(0, -1).join('/');
		tocPath = join(pathWithoutFileName, 'toc.yml');
	}
	tocPath = join(basePath, tocPath);
	return tocPath;
}

function getChildNodes(
	node: any,
	filePath: string,
	breadCrumbs: { breadCrumb: string[]; found: boolean }[],
	index: number
) {
	if (!breadCrumbs[index]) {
		breadCrumbs.push({ breadCrumb: [], found: false });
	}
	if (node.items && node.items.length > 0) {
		if (breadCrumbs[index].found) {
			return breadCrumbs;
		}
		breadCrumbs[index].breadCrumb.push(node.name);
		node.items.forEach(item => {
			return getChildNodes(item, filePath, breadCrumbs, index);
		});
	}
	if (node.href === filePath) {
		breadCrumbs[index].breadCrumb.push(node.name);
		breadCrumbs[index].found = true;
		return breadCrumbs;
	}

	return breadCrumbs;
}

function getParentNodes(node: any, filePath: string, breadCrumbs: string[]) {
	breadCrumbs.push(node.name);
	if (node.items) {
		if (node.items.length > 1) {
			node.items.forEach(item => {
				if (item.tocHref.endsWith(filePath) || item.tocHref.endsWith(`${filePath}/`)) {
					breadCrumbs.push(item.name);
					return breadCrumbs;
				}
			});
		} else {
			node.items.forEach(item => {
				breadCrumbs = getParentNodes(item, filePath, breadCrumbs);
			});
		}
	}

	return breadCrumbs;
}

function getDirectoryName(repoArr: string[]) {
	let repoName = repoArr.pop();
	if (repoName) {
		repoName = repoName.toLowerCase();
		const directory = repoMapping.find(repo => {
			return repoName.startsWith(repo.repoName);
		});
		if (directory) {
			return directory;
		} else {
			return getDirectoryName(repoArr);
		}
	}
}

export function shortenWithElipses(content, size) {
	if (!content) {
		return '';
	}
	if (content.length > size) {
		return content.substring(0, size) + '...';
	}
	return content;
}

export function shortenWithElipsesAtWordEnd(content, size) {
	if (!content) {
		return '';
	}
	if (content.length > size) {
		return content.substring(0, content.lastIndexOf(' ', size)) + '...';
	}
	return content;
}
