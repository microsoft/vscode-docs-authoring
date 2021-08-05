import { AxiosResponse } from 'axios';
import { TextEditor, window, workspace } from 'vscode';
import {
	insertContentToEditor,
	noActiveEditorMessage,
	postWarning,
	setCursorPosition,
	tryFindFile
} from '../../helper/common';
import { sendTelemetryData } from '../../helper/telemetry';
import { externalLinkBuilder } from '../../helper/utility';
import { URL, URLSearchParams } from 'url';
import { join } from 'path';
import { tryGetRelativePath } from '../../helper/tryGetRelativePath';
import { tryGetHeader } from '../../helper/getHeader';
import { getAsync } from '../../helper/http-helper';
import { existsSync, readFileSync } from 'fs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const HTMLParser = require('node-html-parser');

const telemetryCommandLink: string = 'insertLink';
let commandOption: string;
const allowedHosts = ['https://visualstudio.com'];
const regex = /^https:\/\/docs\.microsoft\.com/; /* lgtm[js/regex/missing-regexp-anchor] */
export async function linkToDocsPageByUrl(urlValue?: string) {
	commandOption = 'linkToDocsPageByUrl';
	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}
	let inputValue = '';
	if (!urlValue) {
		inputValue = await window.showInputBox({
			placeHolder: 'Paste a docs.microsoft.com URL',
			validateInput: (text: string) =>
				text !== ''
					? !regex.test(text)
						? 'Invalid link. Only use this command for pages on docs.microsoft.com.'
						: ''
					: 'URL input must not be empty'
		});
	} else {
		inputValue = urlValue;
	}
	// If the user adds a link that doesn't include the http(s) protocol, show a warning and don't add the link.
	if (!inputValue) {
		postWarning('Incorrect link syntax. Abandoning command.');
		return;
	}
	const selection = editor.selection;
	const selectedText = editor.document.getText(selection);
	let repoLink = '';
	//file in current repo with bookmark link to markdown document.
	const resource = editor.document.uri;
	const folder = workspace.getWorkspaceFolder(resource);
	if (folder) {
		const { confirmation, link } = await getLocalRepoFileLink(
			inputValue,
			folder.uri.fsPath,
			editor,
			selectedText
		);
		repoLink = link;
		if (confirmation === 'Cancel') {
			return;
		}
	}
	if (!repoLink) {
		///relative path to docs site /path/to/url
		const url = new URL(inputValue);
		const docsRegexLang = new RegExp(/^(\/[A-Za-z]{2}-[A-Za-z]{2})?\//);
		const urlWithoutLocal = url.pathname.replace(docsRegexLang, '/');
		const urlWithParams = `${urlWithoutLocal}${url.search}`;
		let altText = selectedText;
		if (selection.isEmpty) {
			altText = await window.showInputBox({
				placeHolder: 'Enter link text. If no text is entered, URL will be used.'
			});
		}
		repoLink = externalLinkBuilder(urlWithParams, altText ? altText : url.href);
	}
	insertContentToEditor(editor, repoLink, true);
	setCursorPosition(editor, selection.start.line, selection.start.character + repoLink.length);
	sendTelemetryData(telemetryCommandLink, commandOption);
}

async function getLocalRepoFileLink(
	url: string,
	folderPath: string,
	editor: TextEditor,
	altText: string
) {
	const { data, response } = (await getAsync(url)) as AxiosResponse | any;
	if (response && response.status === 404) {
		const confirmation = await window.showInformationMessage(
			'This URL link retuns a 404 not found. Would you like to continue using this URL?',
			'Cancel',
			'Continue'
		);
		return { confirmation, link: '' };
	} else if (data) {
		const htmlDocument = HTMLParser.parse(data);
		const metadataTags = htmlDocument.querySelectorAll('[name="original_content_git_url"]');
		if (metadataTags.length > 0) {
			const metadata = metadataTags[0].getAttribute('content');
			const repoName = folderPath.split('\\').pop();
			if (checkIfUrlRepoIsInCurrentRepo(metadata, repoName)) {
				const content = getDocfxContent(editor);
				if (
					content &&
					content.build &&
					content.build.content &&
					content.build.content.some(file => file.src)
				)
					if (!UrlInCurrentContentSet(content, metadata, editor)) {
						return { confirmation: '', link: '' };
					}
				return buildRelativePathBasedOnMetadata(metadata, folderPath, editor, altText);
			}
		}
	}
	return { confirmation: '', link: '' };
}

function UrlInCurrentContentSet(content: DocFxContent, metadata, editor) {
	if (content.build && content.build.content) {
		const currentFilePath = editor.document.uri.fsPath;
		const currentPathFolders = currentFilePath.replace(/\\/g, '/').split('/');
		const contentArr = content.build.content;
		const linkPathFolders = metadata.split('/');
		let bothMatch = false;
		let match = '';
		for (const file of contentArr) {
			if (file.src) {
				for (const linkPathFolder of linkPathFolders) {
					if (file.src === linkPathFolder) {
						match = file.src;
						break;
					}
				}
				for (const currentPathFolder of currentPathFolders) {
					if (file.src === currentPathFolder && match === currentPathFolder) {
						bothMatch = true;
						break;
					}
				}
				if (bothMatch) {
					break;
				}
			}
		}

		return bothMatch;
	}
	return true;
}

async function buildRelativePathBasedOnMetadata(metadata, folderPath, editor, altText) {
	const absoluteFilePath = parseMetadata(metadata);
	const currentFilePath = editor.document.uri.fsPath;
	const lastIndex = currentFilePath.lastIndexOf('\\');
	const currentFilePathDirectory = currentFilePath.substring(0, lastIndex);
	if (absoluteFilePath) {
		const pathToLinkFile = join(folderPath, absoluteFilePath);
		const relativePath = tryGetRelativePath(currentFilePathDirectory, pathToLinkFile);
		if (relativePath) {
			if (!altText) {
				altText = await tryGetHeader(pathToLinkFile);
			}
			return { confirmation: '', link: externalLinkBuilder(relativePath, altText) };
		}
	}
	return { confirmation: '', link: '' };
}

export function checkIfUrlRepoIsInCurrentRepo(repoUrl: string, repoName: string) {
	const url = new URL(repoUrl);
	if (url.origin === 'https://github.com') {
		const repo = getRepoName(url);
		return repo === repoName;
	} else if (allowedHosts.includes(url.origin)) {
		const repo = url.pathname.split('/').pop();
		return repo === repoName;
	} else {
		return '';
	}
}

function getRepoName(url: URL) {
	const fullPath = url.pathname.substring(1);
	const startIndex = fullPath.indexOf('/') + 1;
	const repoWithFilePath = fullPath.substring(startIndex);
	return repoWithFilePath.substring(0, repoWithFilePath.indexOf('/'));
}

function parseMetadata(metadata: string) {
	const url = new URL(metadata);
	if (url.origin === 'https://github.com') {
		//https://github.com/MicrosoftDocs/azure-docs-pr/blob/master/articles/app-service/overview.md
		const indexStart = 'blob/';
		const href = url.href;
		const index = url.href.indexOf(indexStart);
		if (index !== -1) {
			const pathWithBranchName = href.substring(index + indexStart.length);
			const branchIndex = pathWithBranchName.indexOf('/');
			if (branchIndex !== -1) {
				return pathWithBranchName.substring(branchIndex + 1);
			}
		}
	} else if (allowedHosts.includes(url.origin)) {
		const params = new URLSearchParams(url.search);
		return params.get('path');
	}
	return '';
}

function getDocfxContent(editor) {
	const folder = workspace.getWorkspaceFolder(editor.document.uri);
	if (folder) {
		// Read the DocFX.json file, search for metadata defaults.
		const docFxJson = tryFindFile(folder.uri.fsPath, 'docfx.json');
		if (!!docFxJson && existsSync(docFxJson)) {
			const jsonBuffer = readFileSync(docFxJson);
			const content = JSON.parse(jsonBuffer.toString()) as DocFxContent;
			return content;
		}
	}
	return '';
}

interface DocFxContent {
	build: {
		content?: Content[];
	};
}

interface Content {
	files: string[];
	src: string;
	group: string;
	dest: string;
}
