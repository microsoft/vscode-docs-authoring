import { MetadataSource } from './metadata-source';
import { MetadataKey } from './metadata-key';
import { MetadataCategory } from './metadata-category';

export class MetadataEntry {
	constructor(
		public readonly source: MetadataSource,
		public readonly key: MetadataKey,
		public readonly value: string,
		public readonly category: MetadataCategory
	) {
		this.source = source;
		this.key = key;
		this.value = value;
		this.category = category;
	}
}
