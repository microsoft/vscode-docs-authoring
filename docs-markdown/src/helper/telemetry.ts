"use strict";

import { readFileSync } from "fs";
import { Disposable, ExtensionContext, Uri, window, workspace } from "vscode";
import TelemetryReporter from "vscode-extension-telemetry";

export let reporter: TelemetryReporter;

export class Reporter extends Disposable {
    constructor(context: ExtensionContext) {
        super(() => reporter.dispose());
        const packageInfo = getPackageInfo(context);
        reporter = packageInfo && new TelemetryReporter(packageInfo.name, packageInfo.version, packageInfo.aiKey);
    }
}

interface IPackageInfo {
    name: string;
    version: string;
    aiKey: string;
}

function readJson(path: string) {
    const json = readFileSync(path, "utf8");
    return JSON.parse(json);
}

function getPackageInfo(context: ExtensionContext): IPackageInfo {
    const extensionPackage = readJson(context.asAbsolutePath("./package.json"));
    return { name: extensionPackage.name, version: extensionPackage.version, aiKey: extensionPackage.aiKey };
}

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
    if (editor) {
        const workspaceUri = editor.document.uri;
        const activeRepo = getRepoName(workspaceUri);
        const telemetryProperties = activeRepo ? { command_option: commandOption, repo_name: activeRepo } : { command_option: commandOption, repo_name: "" };
        reporter.sendTelemetryEvent(telemetryCommand, telemetryProperties);
    }
}
