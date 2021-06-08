import { MarkdownString, ThemeColor, ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { MetadataSource } from './metadata-source';
import { MetadataKey } from './metadata-key';
import { MetadataCategory } from './metadata-category';
import { MetadataEntry } from './metadata-entry';

export class MetadataTreeNode extends TreeItem {
	readonly category: MetadataCategory;
	readonly source?: MetadataSource | null;
	readonly value?: boolean | string | string[] | null;
	readonly key?: MetadataKey | null;

	constructor(entry: MetadataEntry) {
		super(
			entry.key
				? `${entry.key}:` // child nodes
				: entry.category.toString(), // parent nodes
			entry.key
				? TreeItemCollapsibleState.None // child nodes
				: entry.category === MetadataCategory.Required
				? TreeItemCollapsibleState.Expanded
				: TreeItemCollapsibleState.Collapsed
		);

		this.category = entry.category;
		this.key = entry.key;
		this.source = entry.source;
		this.value = entry.value;

		if (this.key) {
			this.description = toDescription(this);
			this.tooltip = toTooltip(this);
			this.iconPath = toSourceIcon(this.source);
		} else {
			if (entry.category === MetadataCategory.Optional) {
				this.tooltip = new MarkdownString(
					"$(unverified) Metadata that's optional. [See optional metadata keys.](https://aka.ms/docs/optional-metadata)",
					true
				);
			} else {
				this.tooltip = new MarkdownString(
					"$(verified) Metadata that's required. [See required metadata keys.](https://aka.ms/docs/required-metadata)",
					true
				);
			}
		}
	}
}

export const toSourceIcon = (source: MetadataSource): ThemeIcon | null => {
	switch (source) {
		case MetadataSource.FileMetadata:
			return new ThemeIcon('json', new ThemeColor('terminal.ansiBrightYellow'));
		case MetadataSource.FrontMatter:
			return new ThemeIcon('markdown', new ThemeColor('terminal.ansiCyan'));
		case MetadataSource.GlobalMetadata:
			return new ThemeIcon('globe', new ThemeColor('terminal.ansiGreen'));
		case MetadataSource.Missing:
			return new ThemeIcon('warning', new ThemeColor('terminal.ansiBrightRed'));

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
		case MetadataSource.Missing:
			return '$(warning)';

		default:
			return null;
	}
};

export const toSourceString = (source: MetadataSource): string | null => {
	switch (source) {
		case MetadataSource.FileMetadata:
			return "_docfx.json_ file's `build/fileMetadata` section.";
		case MetadataSource.FrontMatter:
			return 'the YAML front matter of this Markdown file.';
		case MetadataSource.GlobalMetadata:
			return "_docfx.json_ file's `build/globalMetadata` section.";

		default:
			return null;
	}
};

export const toDescription = (element: MetadataTreeNode): string | null => {
	if (element.source === MetadataSource.Missing) return '?';

	if (Array.isArray(element.value) && element.value.length > 1) return `(hover to see values)`;

	// Empty strings are valid (e.g. titleSuffix).
	if (!element.value) return `""`;

	return `${element.value}`;
};

export const toTooltip = (element: MetadataTreeNode): MarkdownString | null => {
	if (!element) {
		return null;
	}

	const icon = toSourceIconString(element.source);
	const builder = new MarkdownString(`${icon} ${element.category} metadata\n\n`, true);

	if (element.category === MetadataCategory.Required && element.source === MetadataSource.Missing) {
		builder.appendMarkdown(`Unable to find **required** \`${element.key}\` metadata!`);
	} else {
		if (Array.isArray(element.value)) {
			const values = `${element.key}:\n${element.value.map(v => `  - "${v}"`).join('\n')}`;
			builder.appendCodeblock(values, 'yaml');
		} else {
			if (!element.value) {
				builder.appendCodeblock(`${element.key}: ""`, 'yaml');
			} else builder.appendCodeblock(`${element.key}: ${element.value}`, 'yaml');
		}

		const source = toSourceString(element.source);
		builder.appendMarkdown(`\n\nSourced from ${source}`);
	}

	return builder;
};
