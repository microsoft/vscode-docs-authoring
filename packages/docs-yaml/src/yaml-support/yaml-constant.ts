import { join } from 'path';
import { Uri } from 'vscode';

export const SCHEMA_CONFIG_FILE = 'https://static.docs.com/ui/latest/schemas/schema_config.json';

export const VSCODE_YAML_EXTENSION_ID = 'redhat.vscode-yaml';

export const SNIPPETS_ROOT_PATH = join(__dirname, '../../../snippets');

export const YAML_SCHEMA_CONFIG_NAME_OF_VSCODE_YAML_EXTENSION = 'yaml.schemas';

export const TOC_SCHEMA_FILENAME = 'toc.schema.json';

export const TOC_SCHEMA_FILE = Uri.file(join(__dirname, TOC_SCHEMA_FILENAME)).toString();

export const TOC_FILE_GLOBAL_PATTERN = '/toc\\.yml/i';
