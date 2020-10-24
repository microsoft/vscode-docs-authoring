'use strict';

import { appendFileSync, readFileSync, writeFileSync } from 'fs';
import { basename, join } from 'path';
import {
	commands,
	ExtensionContext,
	ViewColumn,
	WebviewPanel,
	window,
	workspace,
	Uri
} from 'vscode';
import {
	isMarkdownFile,
	isYamlFile,
	sendTelemetryData,
	output,
	inline_plugin
} from './helper/common';
import { Reporter } from './helper/telemetry';
import {
	codeSnippets,
	tripleColonCodeSnippets,
	refreshPreviewCache
} from './markdown-extensions/codesnippet';
import { column_end, columnEndOptions, columnOptions } from './markdown-extensions/column';
import { container_plugin } from './markdown-extensions/container';
import { div_plugin, divOptions } from './markdown-extensions/div';
import { image_end, imageOptions } from './markdown-extensions/image';
import { include } from './markdown-extensions/includes';
import { rowEndOptions, rowOptions } from './markdown-extensions/row';
import { videoOptions, legacyVideoOptions } from './markdown-extensions/video';
import { DocumentContentProvider } from './seo/seoPreview';
import { xref } from './markdown-extensions/xref';
import { rootDirectory } from './markdown-extensions/rootDirectory';
import { YamlContentProvider } from './yaml/yamlPreview';
import { nolocOptions } from './markdown-extensions/noloc';

export let extensionPath: string;
const telemetryCommand: string = 'preview';

const previewThemeSetting: string = 'preview.previewTheme';
const reloadMessage =
	'Your updated configuration has been recorded, but you must reload to see its effects.';

export async function activate(context: ExtensionContext) {
	let seoPanel: WebviewPanel;
	let yamlPanel: WebviewPanel;

	themeHandler(context);

	workspace.onDidChangeConfiguration((e: any) => promptForReload(e, reloadMessage));

	context.subscriptions.push(new Reporter(context));
	const disposableSidePreview = commands.registerCommand('docs.showPreviewToSide', uri => {
		commands.executeCommand('markdown.showPreviewToSide');
		const commandOption = 'show-preview-to-side';
		sendTelemetryData(telemetryCommand, commandOption);
	});
	const disposableStandalonePreview = commands.registerCommand('docs.showPreview', uri => {
		commands.executeCommand('markdown.showPreview');
		const commandOption = 'show-preview-tab';
		sendTelemetryData(telemetryCommand, commandOption);
	});
	const disposableRefreshPreview = commands.registerCommand('docs.refreshPreview', () => {
		refreshPreviewCache();
		const commandOption = 'refreshPreview';
		sendTelemetryData(telemetryCommand, commandOption);
	});

	const seoProvider = new DocumentContentProvider();
	context.subscriptions.push(
		workspace.onDidChangeTextDocument(async event => {
			if (isMarkdownFile(event.document) || isYamlFile(event.document)) {
				if (seoPanel) {
					seoPanel.webview.html = await seoProvider.provideTextDocumentContent();
				}
			}
		})
	);

	const yamlProvider = new YamlContentProvider();
	context.subscriptions.push(
		workspace.onDidChangeTextDocument(async event => {
			if (isYamlFile(event.document)) {
				if (yamlPanel) {
					let html = await getYamlHtml(event.document.uri);
					if (html.length > 0) yamlPanel.webview.html = await applyYamlStyle(html);
				}
			}
		})
	);

	context.subscriptions.push(
		window.onDidChangeActiveTextEditor(async event => {
			if (isYamlFile(event.document)) {
				if (yamlPanel) {
					let html = await getYamlHtml(event.document.uri);
					if (html.length > 0) {
						yamlPanel.title = `Preview ${basename(event.document.fileName)}`;
						yamlPanel.webview.html = await applyYamlStyle(html);
					}
				}
			}
		})
	);

	const disposableSEOPreview = commands.registerCommand(
		'docs.seoPreview',
		seoPreview(ViewColumn.Two)
	);
	const disposableYamlPreview = commands.registerCommand(
		'docs.yamlPreview',
		yamlPreview(ViewColumn.Two)
	);
	context.subscriptions.push(
		disposableSidePreview,
		disposableStandalonePreview,
		disposableSEOPreview,
		disposableRefreshPreview,
		disposableYamlPreview
	);

	let filePath = '';
	const editor = window.activeTextEditor;
	if (editor) {
		filePath = editor.document.fileName;
	}
	filePath = await getRecentlyOpenDocument(filePath, context);
	const workingPath = filePath.replace(basename(filePath), '');

	return {
		extendMarkdownIt(md) {
			return md
				.use(include, { root: workingPath })
				.use(codeSnippets, { root: workingPath })
				.use(tripleColonCodeSnippets, { root: workingPath })
				.use(xref)
				.use(column_end)
				.use(container_plugin, 'row', rowOptions)
				.use(container_plugin, 'row-end', rowEndOptions)
				.use(container_plugin, 'column', columnOptions)
				.use(container_plugin, 'column-end', columnEndOptions)
				.use(div_plugin, 'div', divOptions)
				.use(inline_plugin, 'image', imageOptions)
				.use(image_end)
				.use(inline_plugin, 'no-loc', nolocOptions)
				.use(container_plugin, 'video', videoOptions)
				.use(container_plugin, 'legacyVideo', legacyVideoOptions)

				.use(rootDirectory);
		}
	};

	function seoPreview(column): (...args: any[]) => any {
		return async () => {
			// Create and show a new webview
			seoPanel = window.createWebviewPanel(
				'seoPreview',
				'Search Results Preview',
				{ preserveFocus: true, viewColumn: column },
				{}
			);
			seoPanel.webview.html = await seoProvider.provideTextDocumentContent();
		};
	}

	function yamlPreview(column): (...args: any[]) => any {
		return async () => {
			let editor = window.activeTextEditor;
			let html = await getYamlHtml(editor.document.uri);
			if (html.length > 0) {
				if (yamlPanel) {
					yamlPanel.reveal(column, true);
				} else {
					yamlPanel = window.createWebviewPanel(
						'yamlPreview',
						`Preview ${basename(window.activeTextEditor.document.fileName)}`,
						{ preserveFocus: true, viewColumn: column },
						{
							enableScripts: true,
							localResourceRoots: [Uri.file(join(context.extensionPath, 'media'))]
						}
					);
				}
				yamlPanel.webview.html = await applyYamlStyle(html);

				yamlPanel.onDidDispose(
					() => {
						yamlPanel = undefined;
					},
					null,
					context.subscriptions
				);
			}
		};
	}

	async function getYamlHtml(uri: Uri) {
		return await yamlProvider.provideTextDocumentContent(uri);
	}
	async function applyYamlStyle(html: string) {
		const stylePath = Uri.file(join(context.extensionPath, 'media', 'yaml-site-ltr.css'));
		const stylePath2 = Uri.file(join(context.extensionPath, 'media', 'normalize.css'));
		const stylePath3 = Uri.file(join(context.extensionPath, 'media', 'minireset.css'));
		const styleSrc = yamlPanel.webview.asWebviewUri(stylePath);
		const styleSrc2 = yamlPanel.webview.asWebviewUri(stylePath2);
		const styleSrc3 = yamlPanel.webview.asWebviewUri(stylePath3);
		html = html.replace(
			new RegExp('<link rel="stylesheet" type="text/css" href=(.*)">', 'i'),
			`<link rel="stylesheet" type="text/css" href="${styleSrc2}">
		<link rel="stylesheet" type="text/css" href="${styleSrc3}"> <link rel="stylesheet" type="text/css" href="${styleSrc}">`
		);
		return html;
	}
}

function themeHandler(context: ExtensionContext) {
	let bodyAttribute: string = '';
	extensionPath = context.extensionPath;
	const wrapperPath = join(extensionPath, 'media', 'wrapper.js');
	const wrapperJsData = readFileSync(wrapperPath, 'utf8');
	const selectedPreviewTheme = workspace.getConfiguration().get(previewThemeSetting);
	switch (selectedPreviewTheme) {
		case 'Light':
			if (wrapperJsData.includes('theme-light')) {
				output.appendLine(`Current theme: Light.`);
			} else {
				const updatedWrapperJsData = wrapperJsData.replace(/body.setAttribute.*;/gm, '');
				writeFileSync(wrapperPath, updatedWrapperJsData, 'utf8');
				bodyAttribute = `body.setAttribute("class", "theme-light");`;
			}
			break;
		case 'Dark':
			if (wrapperJsData.includes('theme-dark')) {
				output.appendLine(`Current theme: Dark.`);
			} else {
				const updatedWrapperJsData = wrapperJsData.replace(/body.setAttribute.*;/gm, '');
				writeFileSync(wrapperPath, updatedWrapperJsData, 'utf8');
				bodyAttribute = `body.setAttribute("class", "theme-dark");`;
			}
			break;
		case 'High Contrast':
			if (wrapperJsData.includes('theme-high-contrast')) {
				output.appendLine(`Current theme: High Contrast.`);
			} else {
				const updatedWrapperJsData = wrapperJsData.replace(/body.setAttribute.*;/gm, '');
				writeFileSync(wrapperPath, updatedWrapperJsData, 'utf8');
				bodyAttribute = `body.setAttribute("class", "theme-high-contrast");`;
			}
			break;
	}
	appendFileSync(wrapperPath, bodyAttribute, 'utf8');
}

// this method is called when your extension is deactivated
export function deactivate() {
	output.appendLine('Deactivating extension.');
}

function promptForReload(e, message: string) {
	if (e.affectsConfiguration(previewThemeSetting)) {
		window.showInformationMessage(message, 'Reload').then(res => {
			if (res === 'Reload') {
				commands.executeCommand('workbench.action.reloadWindow');
			}
		});
	}
}

async function getRecentlyOpenDocument(filePath: string, context: ExtensionContext) {
	if (!filePath) {
		filePath = context.globalState.get('openDocument');
	} else if (filePath === 'extension-output-#1' || filePath === 'tasks') {
		filePath = context.globalState.get('openDocument');
	} else {
		await context.globalState.update('openDocument', filePath);
	}
	return filePath;
}
