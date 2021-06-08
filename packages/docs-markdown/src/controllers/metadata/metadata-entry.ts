import { MetadataSource } from './metadata-source';
import { MetadataKey } from './metadata-key';
import { MetadataCategory } from './metadata-category';

export interface MetadataEntry {
	readonly category: MetadataCategory;
	readonly source?: MetadataSource;
	readonly key?: MetadataKey;
	readonly value?: boolean | string | string[];
}
