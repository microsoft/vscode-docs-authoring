'use strict';
import {languages, workspace, ConfigurationTarget, ExtensionContext} from 'vscode';

import { DocsYamlCompletionProvider } from "./yaml-support/yaml-snippet";
import { registerYamlSchemaSupport } from './yaml-support/yaml-schema';
import { YAML_SCHEMA_CONFIG_NAME_OF_VSCODE_YAML_EXTENSION, TOC_SCHEMA_FILE, TOC_FILE_GLOBAL_PATTERN } from "./yaml-support/yaml-constant";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: ExtensionContext) {
    const subscriptions = [
        // Completion providers
        languages.registerCompletionItemProvider('yaml', new DocsYamlCompletionProvider()),
    ];

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

// this method is called when your extension is deactivated
export function deactivate() {
}