"use-strict";

import {workspace} from "vscode";

export const gitHubID: string = workspace.getConfiguration("docs.templates").githubid;
export const alias: string  = workspace.getConfiguration("docs.templates").alias;
export const missingValue: string = "NO VALUE SET";
export const learnRepoId: string = workspace.getConfiguration("docs.templates").learnrepouid;
export const learnProduct: string = workspace.getConfiguration("docs.templates").learnproduct;
export const learnLevel: string = workspace.getConfiguration("docs.templates").learnlevel;
export const learnRole: string = workspace.getConfiguration("docs.templates").learnrole;
