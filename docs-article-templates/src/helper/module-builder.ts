import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { QuickPickItem, QuickPickOptions, window, workspace } from "vscode";
import { output } from "../extension";
import { formatLearnNames } from "../helper/common";
import { getUnitName, unitList } from "../helper/unit-builder";
import { learnLevel, learnProduct, learnRepoId, learnRole } from "../helper/user-settings";
import { enterModuleName, parentFolderPrompt, validateModuleName } from "../strings";

export let formattedModuleName: string;
export let parentFolder: string;
export let modulePath: string;
export let repoName: string;
export let includesDirectory: string;
let moduleTitle;
let learnRepo: string;
let repoRoot: string;

export function showLearnFolderSelector() {
    if (unitList) {
        unitList.length = 0;
    }
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
    includesDirectory = join(modulePath, "includes");
    mkdirSync(includesDirectory);
    mkdirSync(join(modulePath, "media"));
    getUnitName();
}

export function updateModule(units) {
    if (learnRepoId) {
        learnRepo = learnRepoId;
    } else {
        learnRepo = repoName;
    }

    /* tslint:disable:object-literal-sort-keys */
    const yaml = require("write-yaml");
    const moduleContent = {
        header: `### YamlMime:Module`,
        uid: `${learnRepo}.${formattedModuleName}`,
        title: moduleTitle,
        summary: `...`,
        abstract: `...`,
        iconUrl: `/media/learn/module.svg`,
        levels: [learnLevel],
        roles: [learnRole],
        products: [learnProduct],
        units: units,
        badge: [`{badge}`],
    };
    const moduleIndex = join(modulePath, "index.yml");
    yaml.sync(moduleIndex, moduleContent);
    cleanupModule(moduleIndex);
}

export function cleanupModule(generatedModule: string) {
    try {
        const moduleContent = readFileSync(generatedModule, "utf8");
        const updatedModule = moduleContent.replace("header: ", "")
            .replace(`{badge}`, `uid: ${learnRepo}.${formattedModuleName}.badge`)
            .replace(/  -/g, "-")
            .replace(/'/g, "")
            .replace(`- uid: `, "  ");
        writeFileSync(generatedModule, updatedModule, "utf8");
    } catch (error) {
        output.appendLine(error);
    }
}
