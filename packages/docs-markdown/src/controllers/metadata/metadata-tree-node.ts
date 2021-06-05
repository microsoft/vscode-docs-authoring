import { MarkdownString, ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { MetadataSource } from './metadata-source';
import { MetadataKey } from './metadata-key';
import { MetadataCategory } from './metadata-category';

export class MetadataTreeNode extends TreeItem {
	category: MetadataCategory;
	source: MetadataSource;
	value: any;
	key: MetadataKey;

	// constructor(
	// 	public readonly source: MetadataSource,
	// 	public readonly key: MetadataKey,
	// 	public readonly value: string
	// ) {
	// 	super(toLabel(key, value), TreeItemCollapsibleState.None);

	// 	this.description = toDescription(source);
	// 	this.tooltip = toTooltip(this);
	// 	this.iconPath = toSourceIcon(source);
	// }

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
			this.iconPath =
				category === MetadataCategory.Optional
					? new ThemeIcon('unverified')
					: new ThemeIcon('verified');
		}
	}
}

interface NamedParameters {
	category: MetadataCategory;
	source?: MetadataSource;
	key?: MetadataKey;
	value?: string;
}

const toDescription = (source: MetadataSource): string | null => {
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

const toSourceIcon = (source: MetadataSource): ThemeIcon | null => {
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

const toSourceIconString = (source: MetadataSource): string | null => {
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

const toSourceString = (source: MetadataSource): string => {
	switch (source) {
		case MetadataSource.FileMetadata:
			return "_docfx.json_ file's `fileMetadata` section.";
		case MetadataSource.FrontMatter:
			return 'the YAML front matter of the file.';
		case MetadataSource.GlobalMetadata:
			return "_docfx.json_ file's `globalMetadata` section.";

		default:
			return '';
	}
};

const toLabel = (key: MetadataKey, value: string): string | null => {
	// Empty strings are valid (e.g. titleSuffix).
	if (!value) {
		return `${key}: ""`;
	}

	return `${key}: ${value}`;
};

const toTooltip = (element: MetadataTreeNode): MarkdownString | null => {
	if (!element) {
		return null;
	}

	const icon = toSourceIconString(element.source);
	const source = toSourceString(element.source);
	return new MarkdownString(
		`${icon} The \`${element.key}: ${element.value}\` metadata comes from ${source}`,
		true
	);
};
