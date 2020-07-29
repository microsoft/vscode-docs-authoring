import * as os from 'os';
import fetch from 'axios';
import {
	insertContentToEditor,
	findLineNumberOfPattern,
	noActiveEditorMessage
} from '../helper/common';
import { resolve, join } from 'path';
import { Selection, window, TextEditor } from 'vscode';
import { spawn, execSync } from 'child_process';
import { unlinkSync, writeFileSync } from 'fs';
import { URL } from 'url';
import { Command } from '../Command';

export const notebookControllerCommands: Command[] = [
	{ command: insertNotebook.name, callback: insertNotebook },
	{ command: updateNotebook.name, callback: updateNotebook }
];

export async function insertNotebook() {
	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	} else {
		const url = await window.showInputBox({
			prompt: 'Provide the GitHub URL of the *.ipynb notebook file'
		});

		if (!url) {
			window.showInformationMessage('No URL to take action on.');
			return;
		}

		const content = await getNotebookAsMarkdown(url);
		if (content !== null) {
			insertContentToEditor(editor, content, true);
		}
	}
}

export async function updateNotebook() {
	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	} else {
		const start = findLineNumberOfPattern(editor, '<!-- nbstart');
		const end = findLineNumberOfPattern(editor, '<!-- nbend');

		if (start > -1 && end > -1 && start < end) {
			editor.selection = new Selection(start, 0, end, 14);
			const url = getUrl(editor, start);
			const content = await getNotebookAsMarkdown(url);
			if (content) {
				insertContentToEditor(editor, content, true);
			}
		} else {
			window.showInformationMessage("There isn't a notebook to update in this document");
		}
	}
}

function getUrl(editor: TextEditor, start: number) {
	const article = editor.document;
	const text = article.lineAt(start).text;
	const url = text.replace('<!-- nbstart ', '').replace(' -->', '');

	return url;
}

function getConvertPromise(filePath: string) {
	return new Promise<ConversionResult>((resolve, reject) => {
		convertToMarkdown(filePath, (result: ConversionResult | null, errorOrNull: Error | null) => {
			if (errorOrNull || result === null) {
				reject(errorOrNull);
			} else {
				resolve(result);
			}
		});
	});
}

async function getNotebookAsMarkdown(url: string) {
	const rawUrl = toRaw(url);
	const ipynbJson = await getRawNotebookJson(rawUrl);
	const filePath = 'temp.ipynb';
	writeFileSync(filePath, ipynbJson);
	const fullPath = resolve(filePath);
	try {
		const result = await getConvertPromise(fullPath);
		if (result !== null) {
			return wrapMarkdownInTemplate(result.markdown, rawUrl);
		}

		return null;
	} finally {
		unlinkSync(fullPath);
	}
}

async function getRawNotebookJson(url: string): Promise<string> {
	const response = await fetch(url);
	const data = await response.data;

	return JSON.stringify(data);
}

function wrapMarkdownInTemplate(content: string, url: string) {
	// Advance all the headings by one, avoid multiple H1s
	content = content.replace(/(^|\r|\n|\r\n)#/g, '\n##');

	const path = toUrl(url);
	const split = url.split('/');
	const fileName = split[split.length - 1];

	return (
		`<!-- nbstart ${url} -->\n\n` +
		`> [!TIP]\n` +
		`> Contents of _${fileName}_. **[Open in GitHub](${path})**.\n\n` +
		`${content}\n` +
		`<!-- nbend -->\n`
	);
}

enum GitHubUrlType {
	Base,
	Raw
}

const blobSegment = 'blob';
const baseUrl = 'github.com';
const rawBaseUrl = 'raw.githubusercontent.com';

export const toRaw = (url: string): string => convertUrlTo(url, GitHubUrlType.Raw);
export const toUrl = (raw: string): string => convertUrlTo(raw, GitHubUrlType.Base);

function convertUrlTo(originalUrl: string, urlType: GitHubUrlType): string {
	const url = new URL(originalUrl);
	switch (urlType) {
		case GitHubUrlType.Base:
			if (url.hostname === rawBaseUrl) {
				url.hostname = baseUrl;
				const segments = url.pathname.split('/');
				segments.splice(3, 0, blobSegment);
				url.pathname = segments.join('/');
			}
			break;
		case GitHubUrlType.Raw:
			if (url.hostname === baseUrl) {
				url.hostname = rawBaseUrl;
				const segments = url.pathname.split('/');
				segments.splice(segments.indexOf(blobSegment), 1);
				url.pathname = segments.join('/');
			}
			break;
	}

	return url.toString();
}

interface ConversionResult {
	markdown: string;
}

function convertToMarkdown(
	ipynbPath: string,
	callback: (result: ConversionResult | null, errorOrNull: Error | null) => void
) {
	const args: string[] = [
		'nbconvert',
		'--to',
		'markdown',
		`"${ipynbPath}"`, // This needs to be wrapped in double quotes
		'--stdout'
	];

	let result: ConversionResult | null = null;
	const plat = os.platform();
	const stdout = execSync(`${plat === 'win32' ? 'where' : 'which'} python`).toString();

	let pythonPath = stdout.split('\r\n')[0].substr(0, stdout.length - 1);
	pythonPath = pythonPath.replace('python.exe', '');

	const jupyterPath = join(pythonPath, 'Scripts/jupyter');
	const path = resolve(jupyterPath);
	const nbConvert = spawn(path, args, { windowsVerbatimArguments: true });

	nbConvert.stdout.on('data', data => {
		result = { markdown: data + '' };
	});

	nbConvert.on('error', err => {
		callback(null, err);
	});

	nbConvert.on('exit', (code, _) => {
		if (code !== 0) {
			callback(null, {
				name: 'FileSystemError',
				message: `Unable to convert '${ipynbPath}' to markdown - error code: ${code}`
			});
		} else {
			callback(result, null);
		}
	});
}
