import { MarkdownString, ThemeColor, ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { MetadataSource } from './metadata-source';
import { MetadataKey } from './metadata-key';
import { MetadataCategory } from './metadata-category';

export class MetadataTreeNode extends TreeItem {
	readonly category: MetadataCategory;
	readonly source?: MetadataSource | null;
	readonly value?: boolean | string | string[] | null;
	readonly key?: MetadataKey | null;

	constructor({ category, source = null, key = null, value = null }: NamedParameters) {
		super(
			key !== null ? `${key}:` /* child nodes */ : category.toString() /* parent nodes */,
			key !== null
				? TreeItemCollapsibleState.None /* child nodes */
				: category === MetadataCategory.Required
				? TreeItemCollapsibleState.Expanded
				: TreeItemCollapsibleState.Collapsed
		);

		this.category = category;
		this.source = source;
		this.key = key;
		this.value = value;

		if (key !== null && value !== null) {
			this.description = toDescription(value);
			this.tooltip = toTooltip(this);
			this.iconPath = toSourceIcon(source);
		} else {
			if (category === MetadataCategory.Optional) {
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

interface NamedParameters {
	category: MetadataCategory;
	source?: MetadataSource;
	key?: MetadataKey;
	value?: boolean | string | string[];
}

export const toSourceIcon = (source: MetadataSource): ThemeIcon | null => {
	switch (source) {
		case MetadataSource.FileMetadata:
			return new ThemeIcon('json', new ThemeColor('terminal.ansiBrightYellow'));
		case MetadataSource.FrontMatter:
			return new ThemeIcon('markdown', new ThemeColor('terminal.ansiCyan'));
		case MetadataSource.GlobalMetadata:
			return new ThemeIcon('globe', new ThemeColor('terminal.ansiGreen'));

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
			return "_docfx.json_ file's `build/fileMetadata` section.";
		case MetadataSource.FrontMatter:
			return 'the YAML front matter of this Markdown file.';
		case MetadataSource.GlobalMetadata:
			return "_docfx.json_ file's `build/globalMetadata` section.";

		default:
			return null;
	}
};

export const toDescription = (value: boolean | string | string[]): string | null => {
	if (Array.isArray(value) && value.length > 1) return `(hover to see values)`;

	// Empty strings are valid (e.g. titleSuffix).
	if (!value) return `""`;

	return `${value}`;
};

export const toTooltip = (element: MetadataTreeNode): MarkdownString | null => {
	if (!element) {
		return null;
	}

	const icon = toSourceIconString(element.source);
	const builder = new MarkdownString(`${icon} ${element.category} metadata.\n\n`, true);

	if (Array.isArray(element.value)) {
		const values = `${element.key}:\n${element.value.map(v => `  - "${v}"`).join('\n')}`;
		builder.appendCodeblock(values, 'yaml');
	} else {
		builder.appendCodeblock(`${element.key}: ${element.value}`, 'yaml');
	}

	const source = toSourceString(element.source);
	builder.appendMarkdown(`\n\nSourced from ${source}`);

	return builder;
};
