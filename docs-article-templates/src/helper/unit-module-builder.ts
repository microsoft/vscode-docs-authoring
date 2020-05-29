import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync, lstatSync } from 'fs';
import { join, parse } from 'path';
import {
	MessageOptions,
	TextDocumentShowOptions,
	Uri,
	ViewColumn,
	window,
	workspace,
	QuickPickItem,
	QuickPickOptions
} from 'vscode';
import { formatLearnNames, showStatusMessage } from './common';
import { alias, gitHubID, learnRepoId } from './user-settings';
import {
	enterUnitName,
	validateUnitName,
	parentFolderPrompt,
	enterModuleName,
	validateModuleName
} from '../strings';

export const unitList = [];
export let formattedUnitName: string;
let includeFile: string;
let unitTitle: string;
export let formattedModuleName: string;
export let parentFolder: string;
export let modulePath: string;
export let repoName: string;
export let includesDirectory: string;
let moduleTitle;
let learnRepo: string = learnRepoId;
let repoRoot: string;
let author: string = gitHubID;
let msAuthor: string = alias;

// input box used to gather unit name.  input is validated and if no name is entered, exit the function.
export function getUnitName(existingModule?: boolean, existingModulePath?: string) {
	const getUnitNameInput = window.showInputBox({
		prompt: enterUnitName,
		validateInput: userInput => (userInput.length > 0 ? '' : validateUnitName)
	});
	getUnitNameInput.then(unitName => {
		if (!unitName) {
			return;
		}
		unitTitle = unitName;
		const { formattedName } = formatLearnNames(unitName);
		formattedUnitName = formattedName;
		if (existingModule) {
			addUnitToModule(existingModulePath);
		} else {
			createUnits();
		}
	});
}

// data used to create the unit(s) yml file.
export function createUnits() {
	const options: MessageOptions = { modal: true };
	window
		.showInformationMessage(`Create a new unit? Previous unit: ${unitTitle}`, options, 'Yes', 'No')
		.then(result => {
			if (result === 'Yes') {
				getUnitName();
			}
		});
	const unitPath = join(modulePath, `${formattedUnitName}.yml`);
	if (!learnRepoId) {
		learnRepo = repoName;
	}
	if (!gitHubID) {
		author = `...`;
	}
	if (!alias) {
		msAuthor = `...`;
	}

	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const yaml = require('js-yaml');

	const unitMetadata = {
		title: unitTitle,
		description: `...`,
		'ms.date': `...`,
		author,
		'ms.author': msAuthor,
		'ms.topic': `interactive-tutorial`,
		'ms.prod': `...`,
		ROBOTS: `NOINDEX`
	};
	const unitData = {
		header: `### YamlMime:ModuleUnit`,
		uid: `${learnRepo}.${formattedModuleName}.${formattedUnitName}`,
		metadata: unitMetadata,
		title: `${unitTitle}`,
		durationInMinutes: `1`,
		content: `\n[!include[](includes/${formattedUnitName}.md)]`
	};
	const unitContent = yaml.dump(unitData);
	writeFileSync(unitPath, unitContent);
	unitList.push(`${learnRepo}.${formattedModuleName}.${formattedUnitName}`);
	includeFile = join(includesDirectory, `${formattedUnitName}.md`);
	writeFileSync(includeFile, '');
	cleanupUnit(unitPath);
}

// cleanup unnecessary characters, replace values and open unit in new tab after it's written to disk.
export function cleanupUnit(generatedUnit: string, preserveValues?: boolean) {
	try {
		const moduleContent = readFileSync(generatedUnit, 'utf8');
		const updatedModule = moduleContent
			.replace('header: ', '')
			.replace(/'/g, '')
			.replace(`content: |-`, 'content: |')
			.replace(/^\s*[\r\n]/gm, '');
		writeFileSync(generatedUnit, updatedModule, 'utf8');
		const uri = Uri.file(generatedUnit);
		const options: TextDocumentShowOptions = {
			preserveFocus: false,
			preview: false,
			viewColumn: ViewColumn.One
		};
		window.showTextDocument(uri, options);
		if (preserveValues) {
			window.showInformationMessage(`${generatedUnit} created.  Please add unit to index file.`);
		} else {
			updateModule(unitList);
		}
	} catch (error) {
		showStatusMessage(error);
	}
}

// data used to create the unit(s) yml file.
export function addUnitToModule(existingModulePath: string) {
	unitList.push(`${learnRepo}.${formattedModuleName}.${formattedUnitName}`);
	const moduleDirectory = parse(existingModulePath).dir;
	const unitPath = join(moduleDirectory, `${formattedUnitName}.yml`);
	if (!gitHubID) {
		author = `...`;
	}
	if (!alias) {
		msAuthor = `...`;
	}

	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const yaml = require('js-yaml');
	const config = yaml.safeLoad(readFileSync(existingModulePath, 'utf8'));

	const unitMetadata = {
		title: unitTitle,
		description: `...`,
		'ms.date': `...`,
		author,
		'ms.author': msAuthor,
		'ms.topic': `interactive-tutorial`,
		'ms.prod': `...`,
		ROBOTS: `NOINDEX`
	};
	const unitData = {
		header: `### YamlMime:ModuleUnit`,
		uid: `${config.uid}.${formattedUnitName}`,
		metadata: unitMetadata,
		title: `${unitTitle}`,
		durationInMinutes: `1`,
		content: `\n[!include[](includes/${formattedUnitName}.md)]`
	};
	const unitContent = yaml.dump(unitData);
	writeFileSync(unitPath, unitContent);
	const includeDirectory = join(moduleDirectory, 'includes');
	includeFile = join(includeDirectory, `${formattedUnitName}.md`);
	writeFileSync(includeFile, '');
	cleanupUnit(unitPath, true);
}

export function createModuleDirectory() {
	const parentPath = join(repoRoot, parentFolder);
	if (!existsSync(parentPath)) {
		mkdirSync(parentPath);
	}

	modulePath = join(repoRoot, parentFolder, formattedModuleName);
	if (!existsSync(modulePath)) {
		mkdirSync(modulePath);
	}
	includesDirectory = join(modulePath, 'includes');
	mkdirSync(includesDirectory);
	mkdirSync(join(modulePath, 'media'));
	getUnitName();
}

export function formatModuleName(moduleName: string) {
	repoName = workspace.workspaceFolders[0].name;
	const { formattedName } = formatLearnNames(moduleName);
	formattedModuleName = formattedName;
	createModuleDirectory();
}

// function to display subdirectories (module parent) for user to select from.
export function showLearnFolderSelector() {
	if (unitList) {
		unitList.length = 0;
	}
	repoRoot = `${workspace.workspaceFolders[0].uri.fsPath}`;
	const parentFolders: QuickPickItem[] = [];
	const options: QuickPickOptions = { placeHolder: parentFolderPrompt };

	const subdirectories = ([] = readdirSync(repoRoot));
	subdirectories.forEach(element => {
		const elementFullPath = join(repoRoot, element);
		if (lstatSync(elementFullPath).isDirectory()) {
			parentFolders.push({ label: element, description: elementFullPath });
		}
	});
	window.showQuickPick(parentFolders, options).then(qpSelection => {
		if (!qpSelection) {
			return;
		}
		parentFolder = qpSelection.label;
		getModuleName();
	});
}

// input box used to gather module name.  input is validated and if no name is entered, exit the function.
export function getModuleName() {
	const getUserInput = window.showInputBox({
		prompt: enterModuleName,
		validateInput: userInput => (userInput.length > 0 ? '' : validateModuleName)
	});
	getUserInput.then(moduleName => {
		if (!moduleName) {
			return;
		}
		moduleTitle = moduleName;
		formatModuleName(moduleName);
	});
}

// data used to create the module yml file.
// check settings.json for repo value.  if there's no value, the root path directory will be considered the repo name.
export function updateModule(units) {
	if (!learnRepoId) {
		learnRepo = repoName;
	}
	if (!gitHubID) {
		author = `...`;
	}
	if (!alias) {
		msAuthor = `...`;
	}

	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const yaml = require('js-yaml');

	const moduleMetadata = {
		title: moduleTitle,
		description: `...`,
		'ms.date': `...`,
		author,
		'ms.author': msAuthor,
		'ms.topic': `...`,
		'ms.prod': `...`
	};
	const moduleData = {
		header: `### YamlMime:Module`,
		uid: `${learnRepo}.${formattedModuleName}`,
		metadata: moduleMetadata,
		title: moduleTitle,
		summary: `...`,
		abstract: `...`,
		prerequisites: `...`,
		iconUrl: `https://docs.microsoft.com/media/learn/module.svg`,
		levels: `...`,
		roles: `...`,
		products: `...`,
		// tslint:disable-next-line: object-literal-shorthand
		units,
		badge: [`{badge}`]
	};
	const moduleIndex = join(modulePath, 'index.yml');
	const moduleContent = yaml.dump(moduleData);
	writeFileSync(moduleIndex, moduleContent);
	cleanupModule(moduleIndex);
}

// cleanup unnecessary characters, replace values and open module in new tab after it's written to disk.
export function cleanupModule(generatedModule: string) {
	try {
		const moduleContent = readFileSync(generatedModule, 'utf8');
		const updatedModule = moduleContent
			.replace('header: ', '')
			.replace(`{badge}`, `uid: ${learnRepo}.${formattedModuleName}.badge`)
			.replace(/  -/g, '-')
			.replace(/'/g, '')
			.replace(`- uid: `, '  uid: ');
		writeFileSync(generatedModule, updatedModule, 'utf8');
		const uri = Uri.file(generatedModule);
		const options: TextDocumentShowOptions = {
			preserveFocus: false,
			preview: false,
			viewColumn: ViewColumn.One
		};
		window.showTextDocument(uri, options);
	} catch (error) {
		showStatusMessage(error);
	}
}
