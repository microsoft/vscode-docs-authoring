/* eslint-disable @typescript-eslint/prefer-for-of */
'use strict';

import * as path from 'path';
import jsyaml = require('js-yaml');

import { commands, TextEditor, window, workspace } from 'vscode';
import {
	isMarkdownFileCheck,
	noActiveEditorMessage,
	toShortDate,
	isMarkdownYamlFileCheckWithoutNotification,
	matchAll
} from '../../helper/common';
import { sendTelemetryData } from '../../helper/telemetry';
import { applyReplacements, findReplacement, Replacements } from '../../helper/utility';
import { MetadataSource } from './metadata-source';
import { MetadataTreeNode } from './metadata-tree-node';
import { MetadataKey } from './metadata-type';
import { MetadataEntry } from './metadata-entry';
import { metadataExpressions, metadataFrontMatterRegex, msDateRegex } from './metadata-expressions';
import { readDocFxJson } from './docfx-file-parser';
import { MetadataCategory } from './metadata-category';

export function insertMetadataCommands() {
	return [
		{ command: updateMetadataDate.name, callback: updateMetadataDate },
		{ command: updateImplicitMetadataValues.name, callback: updateImplicitMetadataValues }
	];
}

class ReplacementFormat {
	constructor(readonly type: MetadataKey, private readonly value: string) {}

	public toReplacementString() {
		return `${this.type}: ${this.value}`;
	}
}

export async function updateImplicitMetadataValues() {
	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}

	if (!isMarkdownFileCheck(editor, false)) {
		return;
	}

	const content = editor.document.getText();
	if (content) {
		const replacementFormats = await getMetadataReplacements(editor);
		if (replacementFormats) {
			const replacements: Replacements = [];
			for (let i = 0; i < replacementFormats.length; ++i) {
				const replacementFormat = replacementFormats[i];
				if (replacementFormat) {
					const expression = metadataExpressions.get(replacementFormat.type);
					const replacement = findReplacement(
						editor.document,
						content,
						replacementFormat.toReplacementString(),
						expression
					);
					if (replacement) {
						replacements.push(replacement);
					}
				}
			}

			await applyReplacements(replacements, editor);
			await saveAndSendTelemetry();
		}
	}
}

async function getMetadataReplacements(editor: TextEditor): Promise<ReplacementFormat[]> {
	const folder = workspace.getWorkspaceFolder(editor.document.uri);
	if (folder) {
		// Read the DocFX.json file, search for metadata defaults.
		const metadata = readDocFxJson(folder.uri.fsPath);
		if (metadata && metadata.build && metadata.build.fileMetadata) {
			const replacements: ReplacementFormat[] = [];
			const fsPath = editor.document.uri.fsPath;
			const fileMetadata = metadata.build.fileMetadata;
			const tryAssignReplacement = (
				filePath: string,
				type: MetadataKey,
				globs?: { [glob: string]: string }
			) => {
				if (globs) {
					const value = getReplacementValue(globs, filePath);
					if (value) {
						replacements.push(new ReplacementFormat(type, value));
						return true;
					}
				}
				return false;
			};

			// Fall back to templates config, if unable to find author and ms.author
			if (!tryAssignReplacement(fsPath, 'author', fileMetadata.author)) {
				const gitHubId = workspace.getConfiguration('docs.templates').githubid;
				if (gitHubId) {
					replacements.push(new ReplacementFormat('author', gitHubId));
				}
			}
			if (!tryAssignReplacement(fsPath, 'ms.author', fileMetadata['ms.author'])) {
				const alias = workspace.getConfiguration('docs.templates').alias;
				if (alias) {
					replacements.push(new ReplacementFormat('ms.author', alias));
				}
			}

			tryAssignReplacement(fsPath, 'manager', fileMetadata.manager);
			tryAssignReplacement(fsPath, 'titleSuffix', fileMetadata.titleSuffix);
			tryAssignReplacement(fsPath, 'ms.service', fileMetadata['ms.service']);
			tryAssignReplacement(fsPath, 'ms.subservice', fileMetadata['ms.subservice']);

			replacements.push(new ReplacementFormat('ms.date', toShortDate(new Date())));

			return replacements;
		}
	}

	return [];
}

export function getAllEffectiveMetadata(): MetadataEntry[] {
	const editor = window.activeTextEditor;
	if (!editor) {
		return [];
	}

	if (!['markdown', 'yaml'].includes(editor.document.languageId)) {
		return;
	}

	const requiredMetadata: string[] = [
		'author',
		'description',
		'ms.author',
		'ms.date',
		'ms.service',
		'ms.prod',
		'ms.topic',
		'title'
	];

	const metadataEntries: MetadataEntry[] = [];

	// Parse frontMatter metadata from the file.
	const content = editor.document.getText();
	const results = matchAll(metadataFrontMatterRegex, content);
	if (results && results.length) {
		const result = results.find(r => !!r.groups && r.groups.metadata);
		if (result) {
			const metadataJson = jsyaml.load(result.groups.metadata);
			if (metadataJson) {
				for (const [key, value] of Object.entries(metadataJson)) {
					metadataEntries.push(
						new MetadataEntry(
							MetadataSource.FrontMatter,
							key as MetadataKey,
							value as string,
							requiredMetadata.includes(key) ? MetadataCategory.Required : MetadataCategory.Optional
						)
					);
				}
			}
		}
	}

	const folder = workspace.getWorkspaceFolder(editor.document.uri);
	if (folder) {
		// Read the DocFX.json file, search for metadata defaults.
		const metadata = readDocFxJson(folder.uri.fsPath);
		if (metadata && metadata.build) {
			const fsPath = editor.document.uri.fsPath;
			const fileMetadata = metadata.build.fileMetadata;
			const globalMetadata = metadata.build.globalMetadata;

			const tryFindMetadata = (
				filePath: string,
				key: MetadataKey,
				source: MetadataSource,
				globs?: { [glob: string]: string }
			) => {
				if (globs) {
					const value = getReplacementValue(globs, filePath);
					if (value) {
						metadataEntries.push(
							new MetadataEntry(
								source,
								key,
								value,
								requiredMetadata.includes(key)
									? MetadataCategory.Required
									: MetadataCategory.Optional
							)
						);
						return true;
					}
				}
				return false;
			};

			const metadataTypes: MetadataKey[] = [
				'author',
				'contributors_to_exclude',
				'dev_langs',
				'manager',
				'ms.author',
				'ms.collection',
				'ms.custom',
				'ms.date',
				'ms.devlang',
				'ms.prod',
				'ms.reviewer',
				'ms.service',
				'ms.subservice',
				'ms.technology',
				'ms.topic',
				'no_loc',
				'product',
				'ROBOTS',
				'titleSuffix'
			];

			for (let i = 0; i < metadataTypes.length; i++) {
				const metadata = metadataTypes[i];

				let appliedFileMetadata = false;
				if (fileMetadata && fileMetadata[metadata]) {
					const fileMetadataGlobs = fileMetadata[metadata];
					appliedFileMetadata = tryFindMetadata(
						fsPath,
						metadata,
						MetadataSource.FileMetadata,
						fileMetadataGlobs
					);
				}

				if (!appliedFileMetadata) {
					if (globalMetadata && globalMetadata[metadata]) {
						const globalMetadataGlobs = globalMetadata[metadata];
						appliedFileMetadata = tryFindMetadata(
							fsPath,
							metadata,
							MetadataSource.GlobalMetadata,
							globalMetadataGlobs
						);
					}
				}
			}
		}
	}

	// Group by key/MetadataType
	// Sort the listing of values from frontMatter > fileMetadata > globalMetadata
	const grouping: Map<MetadataKey, MetadataEntry[]> = new Map();
	for (let i = 0; i < metadataEntries.length; ++i) {
		const node = metadataEntries[i];
		if (grouping.has(node.key)) {
			grouping.get(node.key).push(node);
		} else {
			grouping.set(node.key, [node]);
		}
	}

	const resultingNodes: MetadataEntry[] = [];
	for (const [key, nodes] of grouping) {
		nodes.sort((a, b) => a.source - b.source);
		resultingNodes.push(nodes[0]);
	}

	return resultingNodes;
}

function getReplacementValue(
	globs: { [glob: string]: string },
	fsPath: string
): string | undefined {
	if (globs && fsPath) {
		let segments = fsPath.split(path.sep);
		const globKeys = Object.keys(globs).map(key => ({ key, segments: key.split('/') }));
		const firstSegment = globKeys[0].segments[0];
		segments = segments.slice(segments.indexOf(firstSegment));
		const length = segments.length;

		// Loop through backward, as last entry takes precedence.
		for (let i = globKeys.length - 1; i >= 0; i--) {
			const globKey = globKeys[i];
			if (length <= globKey.segments.length) {
				let equals = false;
				for (let f = 0; f < segments.length - 1; ++f) {
					const left = segments[f];
					const right = globKey.segments[f];
					if (right.startsWith('*')) {
						break;
					}
					equals = left.toLowerCase() === right.toLowerCase();
				}

				if (equals) {
					return globs[globKey.key];
				}
			}
		}
	}

	return undefined;
}

export async function updateMetadataDate() {
	const editor = window.activeTextEditor;
	if (!editor) {
		noActiveEditorMessage();
		return;
	}

	if (!isMarkdownYamlFileCheckWithoutNotification(editor)) {
		return;
	}

	const content = editor.document.getText();
	if (content) {
		const replacement = findReplacement(
			editor.document,
			content,
			`ms.date: ${toShortDate(new Date())}`,
			msDateRegex
		);
		if (replacement) {
			await applyReplacements([replacement], editor);
			await saveAndSendTelemetry();
		}
	}
}

async function saveAndSendTelemetry() {
	await commands.executeCommand('workbench.action.files.save');

	const telemetryCommand = 'updateMetadata';
	sendTelemetryData(telemetryCommand, updateMetadataDate.name);
}
