"use-strict";

import * as vscode from "vscode";

export const gitHubID = vscode.workspace.getConfiguration("docs.templates").githubid;
export const alias = vscode.workspace.getConfiguration("docs.templates").alias;
export const missingValue: string = "NO VALUE SET";
