import { MetadataSource } from './metadata-source';
import { MetadataKey } from './metadata-key';
import { MetadataCategory } from './metadata-category';
import { Uri } from 'vscode';

export interface MetadataEntry {
	readonly category: MetadataCategory;
	readonly source?: MetadataSource;
	readonly key?: MetadataKey;
	readonly value?: boolean | string | string[];
	readonly resourceUri?: Uri | undefined;
	readonly lineNumber?: number | undefined;
}
