import { relative } from "path";
import { WorkspaceFolder } from "vscode";
import { IMasterRedirection } from "./utilities";

export class RedirectionFile implements IMasterRedirection {
    public fileFullPath: string;
    public isAlreadyInMasterRedirectionFile: boolean = false;
    public resource: any;

    // Members mapping to JSON elements in master redirection file
    public source_path: string;
    public redirect_url: string;
    public redirect_document_id: boolean = false;

    constructor(filePath: string, redirectUrl: string, redirectDocumentId: boolean, folder: WorkspaceFolder | undefined) {
        this.fileFullPath = filePath;
        this.source_path = this.getRelativePathToRoot(filePath, folder);
        this.redirect_url = redirectUrl;
        this.redirect_document_id = redirectDocumentId;
    }

    public getRelativePathToRoot(filePath: any, folder: WorkspaceFolder | undefined): string {
        if (folder) {
            return relative(folder.uri.fsPath, filePath).replace(/\\/g, "/");
        } else {
            throw new Error("Failed to resolve relative path to repo root folder for file " + filePath + ". Original error: " + Error.toString());
        }
    }
}
