"use-strict";

import * as vscode from "vscode";

export const gitHubID: string = vscode.workspace.getConfiguration("docs.templates").githubid;
export const alias:string  = vscode.workspace.getConfiguration("docs.templates").alias;
export const missingValue: string = "NO VALUE SET";
export const learnRepoIid: string = vscode.workspace.getConfiguration("docs.templates").learnrepouid;
export const learnProducts: string = vscode.workspace.getConfiguration("docs.templates").learnproducts;
export const learnLevels: string = vscode.workspace.getConfiguration("docs.templates").learnlevels;
export const learnRoles: string = vscode.workspace.getConfiguration("docs.templates").learnroles;