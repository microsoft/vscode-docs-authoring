import {workspace, Uri} from "vscode";

/**
 * Return repo name
 * @param Uri
 */
export function getRepoName(workspacePath: Uri) {
    // let repoName;
    const repo = workspace.getWorkspaceFolder(workspacePath);
    if (repo) {
        const repoName = repo.name;
        return repoName;
    }
}