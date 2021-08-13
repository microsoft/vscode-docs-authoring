/* eslint-disable import/no-unresolved */
import { Helpers } from './helpers';

export class Notebook {
	private _cells: NotebookCell[];
	public get cells(): NotebookCell[] {
		return this._cells;
	}
	public set value(v: NotebookCell[]) {
		this._cells = v;
	}

	constructor(json: any) {
		Object.assign(this, json);
	}
}

export class NotebookCell {
	private _cell_type: string;
	public get cell_type(): string {
		return this._cell_type;
	}
	public set cell_type(v: string) {
		this._cell_type = v;
	}

	private _metadata: string;
	public get metadata(): string {
		return this._metadata;
	}
	public set metadata(v: string) {
		this._metadata = v;
	}

	private _source: string;
	public get source(): string {
		return this._source;
	}
	public set source(v: string) {
		this._source = v;
	}

	public getName(): string {
		let name = '';
		if (!Helpers.strIsNullOrEmpty(this.metadata)) {
			const jObject = JSON.parse(this.metadata);
			if (jObject.has('name')) {
				name = jObject.get('name');
			}
		}

		return name;
	}
}

export class NotebookCellMetadata {
	private _name: string;
	public get name(): string {
		return this._name;
	}
	public set name(v: string) {
		this._name = v;
	}
}
