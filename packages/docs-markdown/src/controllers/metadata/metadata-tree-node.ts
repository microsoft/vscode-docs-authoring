import { MarkdownString, ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { MetadataSource } from './metadata-source';
import { isRequired, MetadataKey } from './metadata-key';
import { MetadataCategory } from './metadata-category';

export class MetadataTreeNode extends TreeItem {
	readonly category: MetadataCategory;
	readonly source?: MetadataSource | null;
	readonly value?: string | string[] | null;
	readonly key?: MetadataKey | null;

	constructor({ category, source = null, key = null, value = null }: NamedParameters) {
		super(
			key != null && value != null ? toLabel(key, value) : category.toString(),
			key == null ? TreeItemCollapsibleState.Expanded : TreeItemCollapsibleState.None
		);

		this.category = category;
		this.source = source;
		this.key = key;
		this.value = value;

		if (key != null && value != null) {
			this.description = toDescription(source);
			this.tooltip = toTooltip(this);
			this.iconPath = toSourceIcon(source);
		} else {
			if (category === MetadataCategory.Optional) {
				this.iconPath = new ThemeIcon('unverified');
				this.tooltip = new MarkdownString(
					'$(unverified) Metadata that is optional, see https://aka.ms/docs/required-metadata#optional-metadata.',
					true
				);
			} else {
				this.iconPath = new ThemeIcon('verified');
				this.tooltip = new MarkdownString(
					'$(verified) Metadata that is required, see https://aka.ms/docs/required-metadata.',
					true
				);
			}
		}
	}
}

interface NamedParameters {
	category: MetadataCategory;
	source?: MetadataSource;
	key?: MetadataKey;
	value?: string | string[];
}

export const toDescription = (source: MetadataSource): string | null => {
	switch (source) {
		case MetadataSource.FileMetadata:
			return '(docfx fileMetadata)';
		case MetadataSource.FrontMatter:
			return '(YAML front matter)';
		case MetadataSource.GlobalMetadata:
			return '(docfx globalMetadata)';

		default:
			return null;
	}
};

export const toSourceIcon = (source: MetadataSource): ThemeIcon | null => {
	switch (source) {
		case MetadataSource.FileMetadata:
			return new ThemeIcon('json');
		case MetadataSource.FrontMatter:
			return new ThemeIcon('markdown');
		case MetadataSource.GlobalMetadata:
			return new ThemeIcon('globe');

		default:
			return null;
	}
};

export const toSourceIconString = (source: MetadataSource): string | null => {
	switch (source) {
		case MetadataSource.FileMetadata:
			return '$(json)';
		case MetadataSource.FrontMatter:
			return '$(markdown)';
		case MetadataSource.GlobalMetadata:
			return '$(globe)';

		default:
			return null;
	}
};

export const toSourceString = (source: MetadataSource): string | null => {
	switch (source) {
		case MetadataSource.FileMetadata:
			return "_docfx.json_ file's `fileMetadata` section.";
		case MetadataSource.FrontMatter:
			return 'the YAML front matter of the file.';
		case MetadataSource.GlobalMetadata:
			return "_docfx.json_ file's `globalMetadata` section.";

		default:
			return null;
	}
};

export const toLabel = (key: MetadataKey, value: string | string[]): string => {
	// Empty strings are valid (e.g. titleSuffix).
	if (!value) {
		return `${key}: ""`;
	}

	const valueString = Array.isArray(value) ? 'hover to see values...' : value;
	return `${key}: ${valueString}`;
};

export const toTooltip = (element: MetadataTreeNode): MarkdownString | null => {
	if (!element) {
		return null;
	}

	const required = isRequired(element.key);
	const icon = toSourceIconString(element.source);
	const source = toSourceString(element.source);
	const builder = new MarkdownString(`${icon} This key value pair:\n\n`, true);

	if (Array.isArray(element.value)) {
		const values = `${element.key}:\n${element.value.map(v => `  - "${v}"`).join('\n')}`;
		builder.appendCodeblock(values, 'yaml');
	} else {
		builder.appendCodeblock(`${element.key}: ${element.value}`, 'yaml');
	}
	builder.appendText(
		`\n\n is considered ${
			required ? 'required' : 'optional'
		} metadata. It was sourced from ${source}`
	);

	return builder;
};
