/* eslint-disable import/no-cycle */
import * as fs from 'fs';
import {
	commands,
	Position,
	Selection,
	TextEditor,
	window,
	workspace,
	WorkspaceConfiguration,
	WorkspaceFolder
} from 'vscode';
import { generateTimestamp, postWarning, tryFindFile } from '../../helper/common';
import { output } from '../../helper/output';
import {
	Markdown,
	MarkdownExtensionSettingsPath,
	OpenSettingsCommand,
	RedirectDocumentId,
	RedirectFileName
} from './constants';
import { RedirectionFile } from './redirection';

export interface MasterRedirections {
	redirections: MasterRedirection[];
}

export interface MasterRedirection {
	source_path: string;
	redirect_url: string;
	redirect_document_id?: boolean;
}

export class MasterRedirection implements MasterRedirections {
	public redirections: RedirectionFile[];

	constructor(redirectionFiles: RedirectionFile[]) {
		this.redirections = redirectionFiles;
	}
}

export interface MarkdownConfig {
	docsetName: string;
	docsetRootFolderName: string;
	omitDefaultJsonProperties?: boolean;
}

export async function getMarkdownOptions(): Promise<{
	config: WorkspaceConfiguration;
	options: MarkdownConfig | null;
}> {
	const config = workspace.getConfiguration(Markdown);
	const options = {
		docsetName: config.docsetName,
		docsetRootFolderName: config.docsetRootFolderName,
		omitDefaultJsonProperties: config.omitDefaultJsonProperties
	};

	if (options.docsetName === '' || options.docsetRootFolderName === '') {
		// Open the settings, and prompt the user to enter values.
		await commands.executeCommand(OpenSettingsCommand, MarkdownExtensionSettingsPath);
		postWarning(
			'Please set the Docset Name and Docset Root Folder Name before using this command.'
		);
		return { config, options: null };
	}

	return { config, options };
}

export async function updateRedirects(
	editor: TextEditor,
	redirects: MasterRedirections | null,
	config: WorkspaceConfiguration
) {
	const lineCount = editor.document.lineCount - 1;
	const lastLine = editor.document.lineAt(lineCount);
	const entireDocSelection = new Selection(
		new Position(0, 0),
		new Position(lineCount, lastLine.range.end.character)
	);

	await editor.edit(builder => {
		builder.replace(entireDocSelection, redirectsToJson(redirects, config));
	});

	await editor.document.save();
}

export function redirectsToJson(
	redirects: MasterRedirections | null,
	config: WorkspaceConfiguration
) {
	const omitDefaultJsonProperties = config.omitDefaultJsonProperties;
	const replacer = (key: string, value: string) => {
		return omitDefaultJsonProperties && key === RedirectDocumentId
			? !!value
				? true
				: undefined
			: value;
	};

	const space = workspace.getConfiguration('editor').insertSpaces
		? (workspace.getConfiguration('editor').tabSize as number) || 2
		: 2;

	return JSON.stringify(redirects, replacer, space);
}

export function showStatusMessage(message: string) {
	const { msTimeValue } = generateTimestamp();
	output.appendLine(`[${msTimeValue}] - ` + message);
	output.show();
}

export interface RedirectsAndConfigOptions {
	readonly config: WorkspaceConfiguration;
	readonly editor: TextEditor;
	readonly folder: WorkspaceFolder;
	readonly options: MarkdownConfig;
	readonly redirects: MasterRedirections;
}

export type RedirectInitiation = Promise<{
	isEnvironmentReady: boolean;
	redirectsAndConfigOptions?: RedirectsAndConfigOptions | null;
}>;

export async function initiateRedirectCommand(): RedirectInitiation {
	const editor = window.activeTextEditor;
	if (!editor) {
		postWarning('Editor not active. Abandoning command.');
		return { isEnvironmentReady: false, redirectsAndConfigOptions: null };
	}

	let redirects: MasterRedirections | null = null;
	const folder = workspace.getWorkspaceFolder(editor.document.uri);
	if (!folder) {
		return { isEnvironmentReady: false, redirectsAndConfigOptions: null };
	}

	const file = tryFindFile(folder.uri.fsPath, RedirectFileName);
	if (!!file && fs.existsSync(file)) {
		if (!editor.document.uri.fsPath.endsWith(RedirectFileName)) {
			const openFile = await window.showErrorMessage(
				`Unable to update the master redirects, please open the "${RedirectFileName}" file then try again!`,
				'Open File'
			);
			if (!!openFile) {
				const document = await workspace.openTextDocument(file);
				await window.showTextDocument(document);
			}
			return { isEnvironmentReady: false, redirectsAndConfigOptions: null };
		}

		const jsonBuffer = fs.readFileSync(file);
		redirects = JSON.parse(jsonBuffer.toString()) as MasterRedirections;
	}

	if (!redirects || !redirects.redirections) {
		return { isEnvironmentReady: false, redirectsAndConfigOptions: null };
	}

	const { config, options } = await getMarkdownOptions();
	if (!options) {
		return { isEnvironmentReady: false, redirectsAndConfigOptions: null };
	}

	return {
		isEnvironmentReady: true,
		redirectsAndConfigOptions: {
			config,
			editor,
			folder,
			options,
			redirects
		}
	};
}
