"use-strict";

import {workspace} from "vscode";

export const gitHubID: string = workspace.getConfiguration("docs.templates").githubid;
export const alias: string  = workspace.getConfiguration("docs.templates").alias;
export const missingValue: string = "NO VALUE SET";
export const learnRepoIid: string = workspace.getConfiguration("docs.templates").learnrepouid;
export const learnProducts: string = workspace.getConfiguration("docs.templates").learnproducts;
export const learnLevels: string = workspace.getConfiguration("docs.templates").learnlevels;
export const learnRoles: string = workspace.getConfiguration("docs.templates").learnroles;
