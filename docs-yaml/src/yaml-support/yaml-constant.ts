import * as path from 'path';
import * as vscode from 'vscode'

export const SCHEMA_CONFIG_FILE = path.join(__dirname, `../../../config/schema_config.json`);

export const VSCODE_YAML_EXTENSION_ID = 'redhat.vscode-yaml';

export const SNIPPETS_ROOT_PATH = path.join(__dirname, '../../../snippets');

export const YAML_SCHEMA_CONFIG_NAME_OF_VSCODE_YAML_EXTENSION = "yaml.schemas";

export const TOC_SCHEMA_FILENAME = "toc.schema.json";

export const TOC_SCHEMA_FILE = vscode.Uri.file(path.join(__dirname, `../../../schemas/${TOC_SCHEMA_FILENAME}`)).toString();

export const TOC_FILE_GLOBAL_PATTERN = "/toc\\.yml/i";
