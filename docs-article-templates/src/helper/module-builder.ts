import { existsSync, mkdirSync } from "fs";
import * as path from "path";
import { window, workspace } from "vscode";
import { formatLearnNames } from "../helper/common";
import { getUnitName } from "../helper/unit-builder";
import { enterParentFolderName } from "../strings";

export let formattedModuleName: string;
export let parentFolder: string;
export let modulePath: string;
let repoRoot: string;

export function formatModuleName(moduleName: string) {
    repoRoot = `${workspace.workspaceFolders[0].uri.fsPath}\\`;
    const {formattedName} = formatLearnNames(moduleName);
    formattedModuleName = formattedName
    getParentFolderName();
}

export function getParentFolderName() {
    const getProductName = window.showInputBox({
        prompt: enterParentFolderName,
    });
    getProductName.then((parent) => {
        if (!parent) {
            parent = repoRoot;
            // return;
        }
        parentFolder = parent;
        createModuleDirectory()
    });
}

export function createModuleDirectory() {
    const parentPath = path.join(repoRoot, parentFolder);
    if (!existsSync(parentPath)) {
        mkdirSync(parentPath);
    }

    modulePath = path.join(repoRoot, parentFolder, formattedModuleName);
    if (!existsSync(modulePath)) {
        mkdirSync(modulePath);
    }

    mkdirSync(path.join(modulePath, "includes"));
    mkdirSync(path.join(modulePath, "media"));
    getUnitName();
}
