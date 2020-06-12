/* eslint-disable import/no-cycle */
import { relative } from 'path';
import { WorkspaceFolder } from 'vscode';
import { MasterRedirection } from './utilities';

export class RedirectionFile implements MasterRedirection {
	public fileFullPath: string;
	public isAlreadyInMasterRedirectionFile: boolean = false;
	public resource: any;
	// Members mapping to JSON elements in master redirection file
	public sourcePath: string;
	public redirectUrl: string;
	public redirectDocumentId: boolean = false;
	public redirections: any;

	// Members mapping to JSON elements in master redirection file
	// tslint:disable: variable-name
	public source_path: string;
	public redirect_url: string;
	public redirect_document_id: boolean = false;

	constructor(
		filePath: string,
		redirectUrl: string,
		redirectDocumentId: boolean,
		folder: WorkspaceFolder | undefined
	) {
		this.fileFullPath = filePath;
		this.source_path = this.getRelativePathToRoot(filePath, folder);
		this.redirect_url = redirectUrl;
		this.redirect_document_id = redirectDocumentId;
	}

	public getRelativePathToRoot(filePath: any, folder: WorkspaceFolder | undefined): string {
		if (folder) {
			return relative(folder.uri.fsPath, filePath).replace(/\\/g, '/');
		} else {
			throw new Error(
				'Failed to resolve relative path to repo root folder for file ' +
					filePath +
					'. Original error: ' +
					Error.toString()
			);
		}
	}
}
