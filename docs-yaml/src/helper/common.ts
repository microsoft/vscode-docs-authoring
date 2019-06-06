"use-strict";

import { Uri, workspace } from "vscode";
import { reporter } from "../helper/telemetry";

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

export function sendTelemetryData(commandName: string, commandOption?: string, workspaceUri?: Uri, ) {
    try {
        const activeRepo = getRepoName(workspaceUri);
        if (commandOption) {
            const telemetryProperties = activeRepo ? { command_option: commandOption, repo_name: activeRepo } : { command_option: commandOption, repo_name: "" };
        } else {
            const telemetryProperties = activeRepo ? { repo_name: activeRepo } : { repo_name: "" };
        }
        const telemetryProperties = activeRepo ? { command_option: commandOption, repo_name: activeRepo } : { command_option: commandOption, repo_name: "" };
        reporter.sendTelemetryEvent(commandName, telemetryProperties);
    } catch (error) {
        console.log(error);
    }
}