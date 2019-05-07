'use strict';
import { ConfigurationTarget, ExtensionContext, languages, window, workspace } from 'vscode';
import * as WebRequest from 'web-request';
import { Reporter } from "./helper/telemetry";
import { SCHEMA_CONFIG_FILE, TOC_FILE_GLOBAL_PATTERN, TOC_SCHEMA_FILE, YAML_SCHEMA_CONFIG_NAME_OF_VSCODE_YAML_EXTENSION } from "./yaml-support/yaml-constant";
import { registerYamlSchemaSupport } from './yaml-support/yaml-schema';
import { DocsYamlCompletionProvider } from "./yaml-support/yaml-snippet";

export const output = window.createOutputChannel("docs-yaml");
export let mappingData: string;
export let extensionPath: string;
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: ExtensionContext) {
    extensionPath = context.extensionPath;
    context.subscriptions.push(new Reporter(context));
    const subscriptions = [
        // Completion providers
        languages.registerCompletionItemProvider('yaml', new DocsYamlCompletionProvider()),
    ];
    await loadSchemaConfig();
    await addTocSchemaToConfig();
    await registerYamlSchemaSupport();
    subscriptions.forEach((element) => {
        context.subscriptions.push(element);
    }, this);
}

async function addTocSchemaToConfig() {
    const config = workspace.getConfiguration().inspect(YAML_SCHEMA_CONFIG_NAME_OF_VSCODE_YAML_EXTENSION);
    await addTocSchemaToConfigAtScope(TOC_SCHEMA_FILE, TOC_FILE_GLOBAL_PATTERN, ConfigurationTarget.Global, config.globalValue);

    // this code should be mantian for two verison
    await removeTocSchemaFromConfigAtScope(TOC_FILE_GLOBAL_PATTERN, ConfigurationTarget.Workspace, config.workspaceValue)
}

async function addTocSchemaToConfigAtScope(key: string, value: string, scope: ConfigurationTarget, valueAtScope: any) {
    let newValue: any = {};
    if (valueAtScope) {
        newValue = Object.assign({}, valueAtScope);
    }
    Object.keys(newValue).forEach(configKey => {
        var configValue = newValue[configKey];
        if (value === configValue) {
            delete newValue[configKey];
        }
    })
    newValue[key] = value;
    await workspace.getConfiguration().update(YAML_SCHEMA_CONFIG_NAME_OF_VSCODE_YAML_EXTENSION, newValue, scope);
}

async function removeTocSchemaFromConfigAtScope(value: string, scope: ConfigurationTarget, valueAtScope: any) {
    if (!valueAtScope) {
        return;
    }
    let newValue: any = {};
    if (valueAtScope) {
        newValue = Object.assign({}, valueAtScope);
    }
    Object.keys(newValue).forEach(configKey => {
        var configValue = newValue[configKey];
        if (value === configValue) {
            delete newValue[configKey];
        }
    })
    await workspace.getConfiguration().update(YAML_SCHEMA_CONFIG_NAME_OF_VSCODE_YAML_EXTENSION, newValue, scope);
}

// retrieve mapping file data and store the data in variable
export async function loadSchemaConfig() {
    const getResult = await WebRequest.get(SCHEMA_CONFIG_FILE);
    mappingData = getResult.content;
}

// this method is called when your extension is deactivated
export function deactivate() {
}