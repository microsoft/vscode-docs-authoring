import { existsSync, mkdirSync } from "fs";
import { readFileSync, writeFileSync } from "fs";
import * as path from "path";
import { window, workspace } from "vscode";
import { moduleTitle } from "../controllers/quick-pick-controller";
import { extensionPath } from "../extension";
import { formatLearnNames } from "../helper/common";
import { formattedUnitName, getUnitName } from "../helper/unit-builder";
import { learnLevel, learnProduct, learnRepoId, learnRole } from "../helper/user-settings";
import { enterParentFolderName, validateParentName } from "../strings";

export let formattedModuleName: string;
export let parentFolder: string;
export let modulePath: string;
export let repoName: string;
let learnRepo: string;
let repoRoot: string;
let templateSource: string;

export function formatModuleName(moduleName: string) {
    repoRoot = `${workspace.workspaceFolders[0].uri.fsPath}\\`;
    repoName = workspace.workspaceFolders[0].name;
    const {formattedName} = formatLearnNames(moduleName);
    formattedModuleName = formattedName;
    getParentFolderName();
}

export function getParentFolderName() {
    templateSource = path.join(extensionPath, "learn-templates");
    const getProductName = window.showInputBox({
        prompt: enterParentFolderName,
        validateInput: (userInput) => userInput.length > 0 ? "" : validateParentName,
    });
    getProductName.then((parent) => {
        if (!parent) {
            return;
        }
        parentFolder = parent;
        createModuleDirectory();
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

export function updateModule() {
    const moduleTemplate = path.join(templateSource, "index.yml");
    const moduleLocation = path.join(modulePath, "index.yml");
    const indexContent = readFileSync(moduleTemplate, "utf8");
    if (learnRepoId) {
        learnRepo = learnRepoId;
    } else {
        learnRepo = repoName;
    }
    const updatedModule = indexContent.replace(/{module}/g, formattedModuleName)
    .replace(/{repo}/g, learnRepo)
    .replace(/{unit}/g, formattedUnitName)
    .replace(/{level}/g, learnLevel)
    .replace(/{role}/g, learnRole)
    .replace(/{product}/g, learnProduct)
    .replace(/{unformattedModuleTitle}/g, moduleTitle);
    writeFileSync(moduleLocation, updatedModule, "utf8");
}
