/* eslint-disable @typescript-eslint/no-var-requires */
import Axios from 'axios';
import { readFileSync } from 'fs';
import { Base64 } from 'js-base64';
import { parse, resolve } from 'path';
import { workspace, commands } from 'vscode';
import { output as outputChannel } from '../helper/common';

// async fs does not have import module available
const fs = require('fs');
const util = require('util');
const readFile = util.promisify(fs.readFile);

export const CODE_RE = /\[!code-(.+?)\s*\[\s*.+?\s*]\(\s*(.+?)\s*\)\s*]/i;
const ROOTPATH_RE = /.*~/gim;
export function codeSnippets(md, options) {
	const replaceCodeSnippetWithContents = (src: string, rootdir: string) => {
		let captureGroup;
		while ((captureGroup = CODE_RE.exec(src))) {
			const repoRoot = workspace.workspaceFolders[0].uri.fsPath;
			let filePath = resolve(rootdir, captureGroup[2].trim());
			if (filePath.includes('~')) {
				filePath = filePath.replace(ROOTPATH_RE, repoRoot);
			}
			let mdSrc = readFileSync(filePath, 'utf8');
			mdSrc = `\`\`\`${captureGroup[1].trim()}\r\n${mdSrc}\r\n\`\`\``;
			src =
				src.slice(0, captureGroup.index) +
				mdSrc +
				src.slice(captureGroup.index + captureGroup[0].length, src.length);
		}
		return src;
	};

	const importCodeSnippet = state => {
		try {
			state.src = replaceCodeSnippetWithContents(state.src, options.root);
		} catch (error) {
			outputChannel.appendLine(error);
		}
	};
	md.core.ruler.before('normalize', 'codesnippet', importCodeSnippet);
}

let codeSnippetContent = '';
const fileMap = new Map();
const TRIPLE_COLON_CODE_RE = /:::(\s+)?code\s+(source|range|id|highlight|language|interactive)=".*?"(\s+)?((source|range|id|highlight|language|interactive)=".*?"(\s+))?((source|range|id|highlight|language|interactive)=".*?"\s+)?((source|range|id|highlight|language|interactive)=".*?"\s+)?((source|range|id|highlight|language|interactive)=".*?"(\s+)?)?:::/g;
const SOURCE_RE = /source="(.*?)"/i;
const LANGUAGE_RE = /language="(.*?)"/i;
const RANGE_RE = /range="(.*?)"/i;
const ID_RE = /id="(.*?)"/i;

export function tripleColonCodeSnippets(md, options) {
	const replaceTripleColonCodeSnippetWithContents = async (src: string, rootdir: string) => {
		const matches = src.match(TRIPLE_COLON_CODE_RE);
		if (matches) {
			for (const match of matches) {
				let file;
				let shouldUpdate = false;
				let output = '';
				const lineArr: string[] = [];
				const position = src.indexOf(match);
				const source = match.match(SOURCE_RE);
				const path = source[1].trim();
				if (path) {
					file = fileMap.get(path);
					if (!file) {
						shouldUpdate = true;
						const repoRoot = workspace.workspaceFolders[0].uri.fsPath;
						if (path.includes('~')) {
							// get openpublishing.json at root
							const openPublishingRepos = await getOpenPublishingFile(repoRoot);
							if (openPublishingRepos) {
								const apiUrl = buildRepoPath(openPublishingRepos, path);
								try {
									await Axios.get(apiUrl).then(response => {
										if (response) {
											if (response.status === 403) {
												outputChannel.appendLine(
													'Github Rate Limit has been reached. 60 calls per hour are allowed.'
												);
											} else if (response.status === 404) {
												outputChannel.appendLine('Resource not Found.');
											} else if (response.status === 200) {
												file = Base64.decode(response.data.content);
												fileMap.set(path, file);
											}
										}
									});
								} catch (error) {
									outputChannel.appendLine(error);
								}
							}
						} else {
							file = await readFile(resolve(rootdir, path), 'utf8');
							fileMap.set(path, file);
						}
					}
				}
				if (file) {
					const data = file.split('\n');
					const language = getLanguage(match, path);
					const range = match.match(RANGE_RE);
					const idMatch = match.match(ID_RE);
					if (idMatch) {
						output = idToOutput(idMatch, lineArr, data, language);
					} else if (range) {
						output = rangeToOutput(lineArr, data, range);
					} else {
						output = file;
					}
					output = `\`\`\`${language}\r\n${output}\r\n\`\`\``;
					src = src.slice(0, position) + output + src.slice(position + match.length, src.length);

					codeSnippetContent = src;

					if (shouldUpdate) {
						await commands.executeCommand('markdown.preview.refresh');
					}
				}
			}
		} else {
			codeSnippetContent = src;
		}
	};

	const importTripleColonCodeSnippets = state => {
		try {
			replaceTripleColonCodeSnippetWithContents(state.src, options.root);
			state.src = codeSnippetContent;
		} catch (error) {
			outputChannel.appendLine(error);
		}
	};
	md.core.ruler.before('normalize', 'codesnippet', importTripleColonCodeSnippets);
}

function getLanguage(match, path) {
	let language = checkLanguageMatch(match);
	if (!language) {
		language = inferLanguage(path);
	}
	return language;
}
function buildRepoPath(repos, path) {
	let position = 0;
	let repoPath = '';
	const parts = path.split('/');
	repos.map((repo: { path_to_root: string; url: string }) => {
		if (parts) {
			parts.map((part, index) => {
				if (repo.path_to_root === part) {
					position = index;
					repoPath = repo.url;
					return;
				}
			});
		}
	});
	const fullPath = [];
	repoPath = repoPath.replace('https://github.com/', 'https://api.github.com/repos/');
	fullPath.push(repoPath);
	fullPath.push('contents');
	for (let index = position + 1; index < parts.length; index++) {
		fullPath.push(parts[index]);
	}
	return encodeURI(fullPath.join('/'));
}

async function getOpenPublishingFile(repoRoot) {
	const openPublishingFilePath = resolve(repoRoot, '.openpublishing.publish.config.json');
	const openPublishingFile = await readFile(openPublishingFilePath, 'utf8');
	const openPublishingJson = JSON.parse(openPublishingFile);
	return openPublishingJson.dependent_repositories;
}

function checkLanguageMatch(match) {
	const languageMatch = LANGUAGE_RE.exec(match);
	let language = '';
	if (languageMatch) {
		language = languageMatch[1].trim();
	}
	return language;
}
function inferLanguage(filePath: string) {
	const dict = [
		{ actionscript: ['.as'] },
		{ arduino: ['.ino'] },
		{ assembly: ['nasm', '.asm'] },
		{ batchfile: ['.bat', '.cmd'] },
		{
			cpp: [
				'c',
				'c++',
				'objective-c',
				'obj-c',
				'objc',
				'objectivec',
				'.c',
				'.cpp',
				'.h',
				'.hpp',
				'.cc'
			]
		},
		{ csharp: ['cs', '.cs'] },
		{ cuda: ['.cu', '.cuh'] },
		{ d: ['dlang', '.d'] },
		{ erlang: ['.erl'] },
		{ fsharp: ['fs', '.fs', '.fsi', '.fsx'] },
		{ go: ['golang', '.go'] },
		{ haskell: ['.hs'] },
		{ html: ['.html', '.jsp', '.asp', '.aspx', '.ascx'] },
		{ cshtml: ['.cshtml', 'aspx-cs', 'aspx-csharp'] },
		{ vbhtml: ['.vbhtml', 'aspx-vb'] },
		{ java: ['.java'] },
		{ javascript: ['js', 'node', '.js'] },
		{ lisp: ['.lisp', '.lsp'] },
		{ lua: ['.lua'] },
		{ matlab: ['.matlab'] },
		{ pascal: ['.pas'] },
		{ perl: ['.pl'] },
		{ php: ['.php'] },
		{ powershell: ['posh', '.ps1'] },
		{ processing: ['.pde'] },
		{ python: ['.py'] },
		{ r: ['.r'] },
		{ ruby: ['ru', '.ru', '.ruby'] },
		{ rust: ['.rs'] },
		{ scala: ['.scala'] },
		{ shell: ['sh', 'bash', '.sh', '.bash'] },
		{ smalltalk: ['.st'] },
		{ sql: ['.sql'] },
		{ swift: ['.swift'] },
		{ typescript: ['ts', '.ts'] },
		{ xaml: ['.xaml'] },
		{
			xml: [
				'xsl',
				'xslt',
				'xsd',
				'wsdl',
				'.xml',
				'.csdl',
				'.edmx',
				'.xsl',
				'.xslt',
				'.xsd',
				'.wsdl'
			]
		},
		{ vb: ['vbnet', 'vbscript', '.vb', '.bas', '.vbs', '.vba'] }
	];
	const target = parse(filePath);
	const ext: string = target.ext;
	let language: string = '';
	language = parseLanguage(dict, ext, language);
	if (!language) {
		language = ext.substr(1);
	}
	return language;
}
function parseLanguage(dict: any, ext: string, language: string): string {
	dict.forEach((key: any) => {
		const element: any = key;
		element.forEach(extension => {
			const val: string[] = extension;
			val.forEach(x => {
				if (val[x] === ext) {
					language = extension;
					return language;
				}
			});
		});
	});
	return language;
}

function rangeToOutput(lineArr, data, range) {
	const rangeArr: number[] = [];
	const rangeList = range[1].split(',');
	rangeList.forEach(element => {
		if (element.indexOf('-') > 0) {
			const rangeThru = element.split('-');
			const startRange = parseInt(rangeThru[0], 10);
			const endRange = parseInt(rangeThru.pop(), 10);
			for (let index = startRange; index <= endRange; index++) {
				rangeArr.push(index);
			}
		} else {
			rangeArr.push(parseInt(element, 10));
		}
	});
	rangeArr.sort();
	data.map((line, index) => {
		rangeArr.filter(x => {
			if (x === index + 1) {
				lineArr.push(line);
			}
		});
	});
	lineArr = dedent(lineArr);
	return lineArr.join('\n');
}

function idToOutput(idMatch, lineArr, data, language) {
	const id = idMatch[1].trim();
	let startLine = 0;
	let endLine = 0;
	const START_RE = new RegExp(`((<|#region)\s*${id}(>|(\s*>)))`, 'i');
	const END_RE = new RegExp(`(</|#endregion)\s*${id}(\s*>)`, 'i');
	// logic for id.
	for (let index = 0; index < data.length; index++) {
		if (START_RE.exec(data[index])) {
			startLine = index;
		}
		if (END_RE.exec(data[index])) {
			endLine = index;
			break;
		}
		if (index + 1 === data.length) {
			endLine = data.length;
			break;
		}
	}
	data.map((x, index) => {
		if (index > startLine && index < endLine) {
			lineArr.push(x);
		}
	});
	lineArr = dedent(lineArr);
	return lineArr.join('\n');
}

function dedent(lineArr) {
	let indent = 0;
	let firstIteration = true;
	for (const key in lineArr) {
		if (lineArr.hasOwnProperty(key)) {
			let index = 0;
			const line = lineArr[key].split('');
			for (const val in line) {
				if (line.hasOwnProperty(val)) {
					const character = line[val];
					if (firstIteration) {
						if (!/\s/.test(character)) {
							lineArr[key] = lineArr[key].substring(indent);
							break;
						} else {
							indent++;
						}
					} else {
						// check if all spaces
						const allSpaces = lineArr[key].substring(0, indent);
						if (allSpaces.match(/^ *$/) !== null) {
							lineArr[key] = lineArr[key].substring(indent);
							break;
						} else {
							if (!/\s/.test(character)) {
								lineArr[key] = lineArr[key].substring(index);
								break;
							}
						}
					}
					index++;
				}
			}
			firstIteration = false;
		}
	}
	return lineArr;
}
