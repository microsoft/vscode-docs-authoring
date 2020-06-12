'use-strict';

import { LineObjectModel } from './line-object-model';

export class ListObjectModel {
	public previousOuter: LineObjectModel | null = null;
	public previousNested: LineObjectModel | null = null;
	public nextOuter: LineObjectModel | null = null;
	public nextNested: LineObjectModel | null = null;
}
