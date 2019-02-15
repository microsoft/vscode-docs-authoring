import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { QuickPickItem, QuickPickOptions, window, workspace } from "vscode";
import { extensionPath } from "../extension";
import { formatLearnNames } from "../helper/common";
import { formattedUnitName, getUnitName } from "../helper/unit-builder";
import { learnLevel, learnProduct, learnRepoId, learnRole } from "../helper/user-settings";
import { enterModuleName, parentFolderPrompt, validateModuleName } from "../strings";

export let formattedModuleName: string;
export let parentFolder: string;
export let modulePath: string;
export let repoName: string;
export let moduleTitle;
let learnRepo: string;
let repoRoot: string;
let templateSource: string;

export function showLearnFolderSelector() {
    templateSource = join(extensionPath, "learn-templates");
    repoRoot = `${workspace.workspaceFolders[0].uri.fsPath}\\`;
    const parentFolders: QuickPickItem[] = [];
    const options: QuickPickOptions = { placeHolder: parentFolderPrompt };

    const subdirectories = [] = readdirSync(repoRoot);
    subdirectories.forEach((element) => {
        const elementFullPath = join(repoRoot, element);
        if (lstatSync(elementFullPath).isDirectory()) {
            parentFolders.push({ label: element, description: elementFullPath });
        }
    });
    window.showQuickPick(parentFolders, options).then((qpSelection) => {
        if (!qpSelection) {
            return;
        }
        parentFolder = qpSelection.label;
        getModuleName();
    });
}

export function getModuleName() {
    const getUserInput = window.showInputBox({
        prompt: enterModuleName,
        validateInput: (userInput) => userInput.length > 0 ? "" : validateModuleName,
    });
    getUserInput.then((moduleName) => {
        if (!moduleName) {
            return;
        }
        moduleTitle = moduleName;
        formatModuleName(moduleName);
    });
}

export function formatModuleName(moduleName: string) {
    repoName = workspace.workspaceFolders[0].name;
    const { formattedName } = formatLearnNames(moduleName);
    formattedModuleName = formattedName;
    createModuleDirectory();
}

export function createModuleDirectory() {
    const parentPath = join(repoRoot, parentFolder);
    if (!existsSync(parentPath)) {
        mkdirSync(parentPath);
    }

    modulePath = join(repoRoot, parentFolder, formattedModuleName);
    if (!existsSync(modulePath)) {
        mkdirSync(modulePath);
    }

    mkdirSync(join(modulePath, "includes"));
    mkdirSync(join(modulePath, "media"));
    getUnitName();
}

export function updateModule() {
    const moduleTemplate = join(templateSource, "index.yml");
    const moduleLocation = join(modulePath, "index.yml");
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
