import { MetadataSource } from './metadata-source';
import { MetadataType } from './metadata-type';

export interface MetadataTreeNode {
	source: MetadataSource;
	key: MetadataType;
	value: string;
}
