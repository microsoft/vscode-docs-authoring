import { join, dirname } from 'path';
import { loadJson } from './yaml-util';
import { Uri } from 'vscode';

export class DocsSchemaHolder {
	// The schemas definitions for Docs
	private definitions: { [yamlMime: string]: string } = {};

	private configFilePath: string;

	// Load Docs schema config
	public loadSchema(schemaConfigFile: string): void {
		const schemaConfig = loadJson(schemaConfigFile);
		this.configFilePath = schemaConfigFile;
		const rawDefinitions = schemaConfig.definitions;
		for (const yamlMime of Object.keys(rawDefinitions)) {
			this.saveSchemaConfigWithYamlMimeKeys(yamlMime, rawDefinitions[yamlMime]);
		}
	}

	// Get Docs schema by the yamlMime
	// Case-sensitive
	public lookup(yamlMime: string): string {
		return yamlMime ? this.definitions[yamlMime] : undefined;
	}

	// Save schema definition in schema config json to schema map
	private saveSchemaConfigWithYamlMimeKeys(yamlMime: string, schemaUri: string): void {
		if (yamlMime && schemaUri) {
			if (schemaUri.startsWith('http://') || schemaUri.startsWith('https://')) {
				this.definitions[yamlMime] = schemaUri;
			} else {
				this.definitions[yamlMime] = this.convertSchemaFilePath(schemaUri);
			}
		}
	}

	private convertSchemaFilePath(schemaFilePath: string): string {
		return Uri.file(join(dirname(this.configFilePath), schemaFilePath)).toString();
	}
}
