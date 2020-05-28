'use-strict';

import { ListType } from '../constants/list-type';

export class LineObjectModel {
	public line: number;
	public indent: string;
	public listType: ListType;
	public listNumber: number;
	public listText: string;
	constructor(
		line: number,
		indent: string,
		listType: ListType,
		listNumber: number,
		listText: string
	) {
		this.line = line;
		this.indent = indent;
		this.listType = listType;
		this.listNumber = listNumber;
		this.listText = listText;
	}
}
