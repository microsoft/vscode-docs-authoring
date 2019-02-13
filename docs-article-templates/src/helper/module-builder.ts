import { existsSync, mkdirSync } from "fs";
import * as path from "path";
import { window, workspace } from "vscode";
import { formatLearnNames } from "../helper/common";
import { getUnitName } from "../helper/unit-builder";
import { enterParentFolderName } from "../strings";

export function formatModuleName(moduleName: string) {
    const {formattedName} = formatLearnNames(moduleName);
    getParentFolderName(formattedName);
}

export function getParentFolderName(module: string) {
    const getProductName = window.showInputBox({
        prompt: enterParentFolderName,
    });
    getProductName.then((productName) => {
        if (!productName) {
            return;
        }
        createModuleDirectory(module, productName)
    });
}

export function createModuleDirectory(module: string, product: string) {
    const repoRoot = `${workspace.workspaceFolders[0].uri.fsPath}\\`;

    const productPath = path.join(repoRoot, product);
    if (!existsSync(productPath)) {
        mkdirSync(productPath);
    }

    const modulePath = path.join(repoRoot, product, module);
    if (!existsSync(modulePath)) {
        mkdirSync(modulePath);
    }

    mkdirSync(path.join(repoRoot, product, module, "includes"));
    mkdirSync(path.join(repoRoot, product, module, "media"));
    getUnitName(modulePath, module);
}
