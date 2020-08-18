import {
	Extension,
	extensions,
	TextDocument,
	window,
	workspace,
	ConfigurationTarget
} from 'vscode';
import { sendTelemetryData } from '../helper/common';
import {
	VSCODE_YAML_EXTENSION_ID,
	YAML_SCHEMA_CONFIG_NAME_OF_VSCODE_YAML_EXTENSION,
	TOC_SCHEMA_FILE,
	TOC_FILE_GLOBAL_PATTERN,
	SCHEMA_CONFIG_FILE
} from './yaml-constant';
import { DocsSchemaHolder } from './yaml-schem-Holder';
import { getYamlMime } from './yaml-util';
import * as WebRequest from 'web-request';
export let mappingData: string;
// The function signature exposed by vscode-yaml:
// 1. the requestSchema api will be called by vscode-yaml extension to decide whether the schema can be handled by this
// contributor, if it returns undefined, means it doesn't support this yaml file, vscode-yaml will ask other contributors
// 2. the requestSchemaContent api  will give the parameter uri returned by the first api, and ask for the json content(after stringify) of
// the schema
declare type YamlSchemaContributor = (
	schema: string,
	requestSchema: (resource: string) => string,
	requestSchemaContent: (uri: string) => string
) => void;

const docsSchemaHolder = new DocsSchemaHolder();

export async function registerYamlSchemaSupport(): Promise<void> {
	docsSchemaHolder.loadSchema(mappingData);
	const yamlPlugin: any = await activateYamlExtension();
	if (!yamlPlugin || !yamlPlugin.registerContributor) {
		// activateYamlExtension has already alerted to users for errors.
		return;
	}
	// register for kubernetes schema provider
	yamlPlugin.registerContributor('docs-yaml', requestYamlSchemaUriCallback, null);
	mimeTelemetry();
}

// See docs from YamlSchemaContributor
function requestYamlSchemaUriCallback(resource: string): string {
	const textEditor = window.visibleTextEditors.find(
		editor => editor.document.uri.toString() === resource
	);
	if (textEditor) {
		return getSchemaUri(textEditor.document);
	}
}

// Get schema uri of this textDocument
function getSchemaUri(textDocument: TextDocument) {
	const yamlMime = getYamlMime(textDocument.getText());
	return docsSchemaHolder.lookup(yamlMime);
}

// Find redhat.vscode-yaml extension and try to activate it to get the yaml contributor
async function activateYamlExtension(): Promise<{ registerContributor: YamlSchemaContributor }> {
	const ext: Extension<any> = extensions.getExtension(VSCODE_YAML_EXTENSION_ID);
	if (!ext) {
		const commandOption = 'missing-dependecy';
		sendTelemetryData('yamlError', commandOption);
		window.showWarningMessage("Please install 'YAML Support by Red Hat' via the Extensions pane.");
		return;
	}
	const yamlPlugin = await ext.activate();

	if (!yamlPlugin || !yamlPlugin.registerContributor) {
		window.showWarningMessage(
			"The installed Red Hat YAML extension doesn't support Kubernetes Intellisense. Please upgrade 'YAML Support by Red Hat' via the Extensions pane."
		);
		return;
	}
	return yamlPlugin;
}

function mimeTelemetry() {
	const activeTextDocument = window.activeTextEditor.document.getText();
	const yamlMime = getYamlMime(activeTextDocument);
	const commandOption = yamlMime;
	sendTelemetryData('mimeType', commandOption);
}

export async function addTocSchemaToConfig() {
	const config = workspace
		.getConfiguration()
		.inspect(YAML_SCHEMA_CONFIG_NAME_OF_VSCODE_YAML_EXTENSION);
	await addTocSchemaToConfigAtScope(
		TOC_SCHEMA_FILE,
		TOC_FILE_GLOBAL_PATTERN,
		ConfigurationTarget.Global,
		config.globalValue
	);

	// this code should be mantian for two verison
	await removeTocSchemaFromConfigAtScope(
		TOC_FILE_GLOBAL_PATTERN,
		ConfigurationTarget.Workspace,
		config.workspaceValue
	);
}

async function addTocSchemaToConfigAtScope(
	key: string,
	value: string,
	scope: ConfigurationTarget,
	valueAtScope: any
) {
	let newValue: any = {};
	if (valueAtScope) {
		newValue = Object.assign({}, valueAtScope);
	}
	Object.keys(newValue).forEach(configKey => {
		const configValue = newValue[configKey];
		if (value === configValue) {
			delete newValue[configKey];
		}
	});
	newValue[key] = value;
	await workspace
		.getConfiguration()
		.update(YAML_SCHEMA_CONFIG_NAME_OF_VSCODE_YAML_EXTENSION, newValue, scope);
}

async function removeTocSchemaFromConfigAtScope(
	value: string,
	scope: ConfigurationTarget,
	valueAtScope: any
) {
	if (!valueAtScope) {
		return;
	}
	let newValue: any = {};
	if (valueAtScope) {
		newValue = Object.assign({}, valueAtScope);
	}
	Object.keys(newValue).forEach(configKey => {
		const configValue = newValue[configKey];
		if (value === configValue) {
			delete newValue[configKey];
		}
	});
	await workspace
		.getConfiguration()
		.update(YAML_SCHEMA_CONFIG_NAME_OF_VSCODE_YAML_EXTENSION, newValue, scope);
}

// retrieve mapping file data and store the data in variable
export async function loadSchemaConfig() {
	const getResult = await WebRequest.get(SCHEMA_CONFIG_FILE);
	mappingData = getResult.content;
}
