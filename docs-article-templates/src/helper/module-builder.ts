import { window, workspace } from "vscode";
import * as path from "path";
import { existsSync, mkdirSync } from "fs";
import {createUnits} from "../helper/unit-builder";

export function formatModuleName(moduleName: string) {
    const module = moduleName.replace(/ /g, "-").toLowerCase();
    getProductName(module);
}

export function getProductName(module: string) {
    const getProductName = window.showInputBox({
        prompt: "Enter product name.",
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
    createUnits(modulePath, module);
}
