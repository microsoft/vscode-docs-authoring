"use-strict";

import { Uri, window, workspace } from "vscode";
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

export function sendTelemetryData(telemetryCommand: string, commandOption: string) {
    const editor = window.activeTextEditor;
    const workspaceUri = editor.document.uri;
    const activeRepo = getRepoName(workspaceUri);
    const telemetryProperties = activeRepo ? { command_option: commandOption, repo_name: activeRepo } : { command_option: commandOption, repo_name: "" };
    reporter.sendTelemetryEvent(telemetryCommand, telemetryProperties);
}

export function matchAll(
    pattern: RegExp,
    text: string,
): RegExpMatchArray[] {
    const out: RegExpMatchArray[] = [];
    pattern.lastIndex = 0;
    let match: RegExpMatchArray | null = pattern.exec(text);
    while (match) {
        if (match) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (match.index === pattern.lastIndex) {
                pattern.lastIndex++;
            }

            out.push(match);
        }

        match = pattern.exec(text);
    }
    return out;
}
