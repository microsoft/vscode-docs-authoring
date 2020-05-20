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

	constructor(
		filePath: string,
		redirectUrl: string,
		redirectDocumentId: boolean,
		folder: WorkspaceFolder | undefined
	) {
		this.fileFullPath = filePath;
		this.sourcePath = this.getRelativePathToRoot(filePath, folder);
		this.redirectUrl = redirectUrl;
		this.redirectDocumentId = redirectDocumentId;
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
