/* eslint-disable @typescript-eslint/prefer-for-of */
'use strict';

import jsyaml = require('js-yaml');
import minimatch = require('minimatch');
import { dirname, sep } from 'path';
import { commands, TextEditor, Uri, window, workspace } from 'vscode';
import {
	isMarkdownFileCheck,
	isMarkdownYamlFileCheckWithoutNotification,
	matchAll,
	noActiveEditorMessage,
	toShortDate
} from '../../helper/common';
import { sendTelemetryData } from '../../helper/telemetry';
import { applyReplacements, findReplacement, Replacements } from '../../helper/utility';
import { DocFxFileInfo, readDocFxJson } from './docfx-file-parser';
import { MetadataCategory } from './metadata-category';
import { MetadataEntry } from './metadata-entry';
import { metadataExpressions, metadataFrontMatterRegex, msDateRegex } from './metadata-expressions';
import { allMetadataKeys, isRequired, MetadataKey, requiredMetadataKeys } from './metadata-key';
import { MetadataSource } from './metadata-source';

export function insertMetadataCommands() {
	return [{ command: updateMetadataDate.name, callback: updateMetadataDate }];
}

// class ReplacementFormat {
// 	constructor(readonly type: MetadataKey, private readonly value: string) {}

// 	public toReplacementString() {
// 		return `${this.type}: ${this.value}`;
// 	}
// }

// async function getMetadataReplacements(editor: TextEditor): Promise<ReplacementFormat[]> {
// 	const folder = workspace.getWorkspaceFolder(editor.document.uri);
// 	if (folder) {
// 		// Read the DocFX.json file, search for metadata defaults.
// 		const { fullPath, contents } = readDocFxJson(folder.uri.fsPath);
// 		if (contents && contents.build && contents.build.fileMetadata) {
// 			const replacements: ReplacementFormat[] = [];
// 			const docFxDirectory = dirname(fullPath);
// 			const path = editor.document.uri.fsPath.replace(docFxDirectory, '');
// 			const fsPath = path.startsWith(sep) ? path.substr(1) : path;
// 			const fileMetadata = contents.build.fileMetadata;
// 			const tryAssignReplacement = (
// 				filePath: string,
// 				type: MetadataKey,
// 				globs?: { [glob: string]: boolean | string | string[] }
// 			) => {
// 				if (globs) {
// 					const { value } = getReplacementValue(globs, filePath);
// 					if (value && typeof value === 'string') {
// 						replacements.push(new ReplacementFormat(type, value));
// 						return true;
// 					}
// 				}
// 				return false;
// 			};

// 			// Fall back to templates config, if unable to find author and ms.author
// 			if (!tryAssignReplacement(fsPath, 'author', fileMetadata.author)) {
// 				const gitHubId = workspace.getConfiguration('docs.templates').githubid;
// 				if (gitHubId) {
// 					replacements.push(new ReplacementFormat('author', gitHubId));
// 				}
// 			}
// 			if (!tryAssignReplacement(fsPath, 'ms.author', fileMetadata['ms.author'])) {
// 				const alias = workspace.getConfiguration('docs.templates').alias;
// 				if (alias) {
// 					replacements.push(new ReplacementFormat('ms.author', alias));
// 				}
// 			}

// 			tryAssignReplacement(fsPath, 'manager', fileMetadata.manager);
// 			tryAssignReplacement(fsPath, 'titleSuffix', fileMetadata.titleSuffix);
// 			tryAssignReplacement(fsPath, 'ms.service', fileMetadata['ms.service']);
// 			tryAssignReplacement(fsPath, 'ms.subservice', fileMetadata['ms.subservice']);

// 			replacements.push(new ReplacementFormat('ms.date', toShortDate(new Date())));

// 			return replacements;
// 		}
// 	}

// 	return [];
// }

export function getAllEffectiveMetadata(docFxFileInfo: DocFxFileInfo): MetadataEntry[] {
	const editor = window.activeTextEditor;
	if (!editor || !['markdown', 'yaml'].includes(editor.document?.languageId)) {
		return [];
	}

	const metadataEntries: MetadataEntry[] = [];

	// Parse front-matter metadata from the file.
	const content = editor.document.getText();
	const results = matchAll(metadataFrontMatterRegex, content);
	if (results && results.length) {
		const result = results.find(r => !!r.groups && r.groups.metadata);
		if (result) {
			try {
				const metadataJson = jsyaml.load(result.groups.metadata);
				if (metadataJson) {
					const lines = result.groups.metadata.split(/\r\n|\n\r|\n|\r/);
					for (const [key, value] of Object.entries(metadataJson)) {
						const typedValue: boolean | string | string[] = Array.isArray(value)
							? (value as string[])
							: typeof value === 'boolean'
							? (value as boolean)
							: (value as string);

						const lineNumber = tryFindYamlFrontMatterLineNumber(key, lines);
						const resourceUri = editor.document.uri;

						metadataEntries.push({
							category: isRequired(key as MetadataKey)
								? MetadataCategory.Required
								: MetadataCategory.Optional,
							source: MetadataSource.FrontMatter,
							key: key as MetadataKey,
							value: typedValue,
							resourceUri,
							lineNumber
						});
					}
				}
			} catch (e) {
				window.showErrorMessage(e.message);
			}
		}
	}

	const { fullPath, contents, lines } = docFxFileInfo;
	if (contents && contents.build) {
		const docFxDirectory = dirname(fullPath);
		const path = editor.document.uri.fsPath.replace(docFxDirectory, '');
		const fsPath = path.startsWith(sep) ? path.substr(1) : path;
		const fileMetadata = contents.build.fileMetadata;
		const globalMetadata = contents.build.globalMetadata;
		const metadataKeys = allMetadataKeys;
		for (let i = 0; i < metadataKeys.length; i++) {
			const key = metadataKeys[i];
			if (fileMetadata && fileMetadata[key]) {
				const fileMetadataGlobs: { [glob: string]: string | boolean | string[] } =
					fileMetadata[key];
				const { value, resourceUri, lineNumber } = {
					value: tryFindFileMetadataGlobValue(fileMetadataGlobs, fsPath),
					resourceUri: Uri.file(fullPath),
					lineNumber: tryFindFileMetadataLineNumber(key, lines, fileMetadataGlobs)
				};
				if (value) {
					metadataEntries.push({
						category: isRequired(key as MetadataKey)
							? MetadataCategory.Required
							: MetadataCategory.Optional,
						source: MetadataSource.FileMetadata,
						key,
						value,
						resourceUri,
						lineNumber
					});
				}
			}

			if (globalMetadata && globalMetadata[key]) {
				const globalMetadataValue: string | boolean | string[] = globalMetadata[key];
				const { value, resourceUri, lineNumber } = {
					value: globalMetadataValue as boolean | string | string[],
					resourceUri: Uri.file(fullPath),
					lineNumber: tryFindGlobalMetadataLineNumber(key, lines)
				};
				if (value) {
					metadataEntries.push({
						category: isRequired(key as MetadataKey)
							? MetadataCategory.Required
							: MetadataCategory.Optional,
						source: MetadataSource.GlobalMetadata,
						key,
						value,
						resourceUri,
						lineNumber
					});
				}
			}
		}
	}

	const grouping = groupByMetadataKey(metadataEntries);
	interleavePlaceholdersForMissingRequiredMetadata(grouping);
	return applyRulesOfPrecedence(grouping);
}

function groupByMetadataKey(metadataEntries: MetadataEntry[]) {
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

	return grouping;
}

function interleavePlaceholdersForMissingRequiredMetadata(
	grouping: Map<MetadataKey, MetadataEntry[]>
) {
	// Interleave placeholders where required metadata was unresolved.
	for (let i = 0; i < requiredMetadataKeys.length; ++i) {
		const requiredKey = requiredMetadataKeys[i];
		if (requiredKey === 'ms.prod' || requiredKey === 'ms.service') {
			if (!grouping.has('ms.prod') && !grouping.has('ms.service')) {
				grouping.set(requiredKey, [
					{
						key: requiredKey,
						category: MetadataCategory.Required,
						source: MetadataSource.Missing
					}
				]);
			}

			continue;
		}

		if (!grouping.has(requiredKey)) {
			grouping.set(requiredKey, [
				{
					key: requiredKey,
					category: MetadataCategory.Required,
					source: MetadataSource.Missing
				}
			]);
		}
	}
}

function applyRulesOfPrecedence(grouping: Map<MetadataKey, MetadataEntry[]>) {
	const resultingNodes: MetadataEntry[] = [];
	for (const [_, nodes] of grouping) {
		// Filters the most relevant result based on their Source
		nodes.sort((a, b) => a.source - b.source);
		resultingNodes.push(nodes[0]);
	}

	return resultingNodes;
}

function tryFindFileMetadataGlobValue(
	globNode: { [glob: string]: boolean | string | string[] },
	fsPath: string
): boolean | string | string[] | undefined {
	if (globNode && fsPath) {
		const globKeys = Object.keys(globNode);

		// Loop through backward, as last entry takes precedence.
		for (let i = globKeys.length - 1; i >= 0; i--) {
			const globKey = globKeys[i];
			if (minimatch(fsPath, globKey, { nocase: true })) {
				return globNode[globKey];
			}
		}
	}

	return undefined;
}

function tryFindYamlFrontMatterLineNumber(key: string, lines: string[]) {
	if (key && lines && lines.length) {
		for (let i = 0; i < lines.length; ++i) {
			const line = lines[i].trim();
			if (line.startsWith(key)) {
				return i;
			}
		}
	}

	return -1;
}

function tryFindGlobalMetadataLineNumber(key: MetadataKey, lines: string[]) {
	if (key && lines && lines.length) {
		let { inGlobalMetadataSection, startSearch } = {
			inGlobalMetadataSection: false,
			startSearch: false
		};
		for (let i = 0; i < lines.length; ++i) {
			const line = lines[i].trim();
			if (!inGlobalMetadataSection && line && line.indexOf('globalMetadata') > -1) {
				inGlobalMetadataSection = true;
			}

			if (inGlobalMetadataSection && line && line.indexOf(key) > -1) {
				return i;
			}

			if (startSearch) {
				if (line && line.indexOf('}') > -1) {
					break;
				}
			}
		}
	}

	return -1;
}

function tryFindFileMetadataLineNumber(
	key: MetadataKey,
	lines: string[],
	globNode: { [glob: string]: boolean | string | string[] }
) {
	if (key && lines && lines.length) {
		let { inFileMetadataSection, fileMetadataIndex, length, startSearch, globNodeIndex } = {
			inFileMetadataSection: false,
			fileMetadataIndex: -1,
			length: 0,
			startSearch: false,
			globNodeIndex: -1
		};
		for (let i = 0; i < lines.length; ++i) {
			const line = lines[i].trim();
			if (!inFileMetadataSection && line && line.indexOf('fileMetadata') > -1) {
				inFileMetadataSection = true;
				fileMetadataIndex = i;
				continue;
			}

			if (inFileMetadataSection && line && line.indexOf(key) > -1) {
				startSearch = true;
				globNodeIndex = i;
				continue;
			}

			if (startSearch) {
				if (line && line.indexOf('}') > -1) {
					(inFileMetadataSection = false), (startSearch = false);
					break;
				} else {
					length++;
				}
			}
		}

		const globKeys = Object.keys(globNode);

		// Loop through backward, as last entry takes precedence.
		for (let i = globKeys.length - 1; i >= 0; i--) {
			const globKey = globKeys[i];
			for (let j = length + globNodeIndex; j >= fileMetadataIndex; --j) {
				const line = lines[j].trim();
				if (line && line.indexOf(globKey) > -1) {
					return j;
				}
			}
		}
	}

	return -1;
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
