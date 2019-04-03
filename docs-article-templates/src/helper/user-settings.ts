"use-strict";

import { workspace } from "vscode";

// settings.json values
export const gitHubID: string = workspace.getConfiguration("docs.templates").githubid;
export const alias: string  = workspace.getConfiguration("docs.templates").alias;
export const missingValue: string = "NO VALUE SET";
export const learnRepoId: string = workspace.getConfiguration("docs.templates").learn_repo_id;
