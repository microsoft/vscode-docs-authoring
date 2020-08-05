import fetch from 'axios';
import {
	insertContentToEditor,
	findLineNumberOfPattern,
	noActiveEditorMessage,
	getOSPlatform
} from '../helper/common';
import { resolve } from 'path';
import { Selection, window, TextEditor } from 'vscode';
import { spawn, execSync } from 'child_process';
import { URL } from 'url';
import { Command } from '../Command';
import { output } from '../helper/output';

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

function getConvertPromise(json: string) {
	return new Promise<ConversionResult>((resolve, reject) => {
		convertToMarkdown(json, (result: ConversionResult | null, errorOrNull: Error | null) => {
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

	try {
		const result = await getConvertPromise(ipynbJson);
		if (result !== null) {
			return wrapMarkdownInTemplate(result.markdown, rawUrl);
		}

		return null;
	} catch (error) {
		output.appendLine(error);
	}
}

async function getRawNotebookJson(url: string): Promise<string> {
	const response = await fetch(url);
	const data = await response.data;

	return JSON.stringify(data);
}

function wrapMarkdownInTemplate(content: string, url: string) {
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
	ipynbJson: string,
	callback: (result: ConversionResult | null, errorOrNull: Error | null) => void
) {
	let result: ConversionResult | null = null;
	const plat = getOSPlatform();
	const stdout = execSync(`${plat === 'win32' ? 'where' : 'which'} jupyter`).toString();
	const jupyterPath = stdout.split('\r\n')[0].substr(0, stdout.length - 1);
	const path = resolve(jupyterPath);

	output.appendLine(`[Platform=${plat}]: Found Jupyter=${path}`);
	const args: string[] = ['nbconvert', '--to', 'markdown', '--stdin', '--stdout'];

	const nbConvert = spawn(path, args, { windowsVerbatimArguments: true });
	ipynbJson.split('\n').forEach(line => nbConvert.stdin.write(line));
	nbConvert.stdin.end();

	nbConvert.stdout.on('data', data => {
		result = { markdown: data + '' };
		output.appendLine(data.toString());
	});

	nbConvert.on('error', err => {
		callback(null, err);
	});

	nbConvert.on('exit', (code, _) => {
		if (code !== 0) {
			callback(null, {
				name: 'FileSystemError',
				message: `Unable to convert to markdown - error code: ${code}`
			});
		} else {
			callback(result, null);
		}
	});
}
