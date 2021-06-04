import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { MetadataSource } from './metadata-source';
import { MetadataType } from './metadata-type';

export class MetadataTreeNode extends TreeItem {
	constructor(
		public readonly source: MetadataSource,
		public readonly key: MetadataType,
		public readonly value: string
	) {
		super(toLabel(key, value), TreeItemCollapsibleState.None);

		this.description = toDescription(source);
		this.tooltip = toTooltip(this);
		this.iconPath = toSourceIcon(source);
	}
}

const toDescription = (source: MetadataSource): string | null => {
	switch (source) {
		case MetadataSource.FileMetadata:
			return 'fileMetadata';
		case MetadataSource.FrontMatter:
			return 'frontMatter';
		case MetadataSource.GlobalMetadata:
			return 'globalMetadata';

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

const toSourceString = (source: MetadataSource): string => {
	switch (source) {
		case MetadataSource.FileMetadata:
			return "_docfx.json_ file's `fileMetadata` $(json) section";
		case MetadataSource.FrontMatter:
			return 'the front matter of the $(markdown) file itself';
		case MetadataSource.GlobalMetadata:
			return "_docfx.json_ file's `globalMetadata` $(globe) section";

		default:
			return '';
	}
};

const toLabel = (key: MetadataType, value: string): string | null => {
	if (!value) {
		return null;
	}

	return `${key}: ${value}`;
};

const toTooltip = (element: MetadataTreeNode): string | null => {
	if (!element) {
		return null;
	}

	const source = toSourceString(element.source);
	return `The \`${element.key}: ${element.value}\` metadata comes from ${source}`;
};
