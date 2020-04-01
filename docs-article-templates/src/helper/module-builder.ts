import { existsSync, lstatSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { QuickPickItem, QuickPickOptions, TextDocumentShowOptions, Uri, ViewColumn, window, workspace } from "vscode";
import { formatLearnNames, showStatusMessage } from "../helper/common";
import { getUnitName, unitList } from "../helper/unit-builder";
import { alias, gitHubID, learnRepoId } from "../helper/user-settings";
import { enterModuleName, parentFolderPrompt, validateModuleName } from "../strings";

export let formattedModuleName: string;
export let parentFolder: string;
export let modulePath: string;
export let repoName: string;
export let includesDirectory: string;
let moduleTitle;
let learnRepo: string = learnRepoId;
let repoRoot: string;
let author: string = gitHubID;
let msAuthor: string = alias;

// function to display subdirectories (module parent) for user to select from.
export function showLearnFolderSelector() {
    if (unitList) {
        unitList.length = 0;
    }
    repoRoot = `${workspace.workspaceFolders[0].uri.fsPath}`;
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

// input box used to gather module name.  input is validated and if no name is entered, exit the function.
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

// data used to create the module yml file.
// check settings.json for repo value.  if there's no value, the root path directory will be considered the repo name.
export function updateModule(units) {
    if (!learnRepoId) {
        learnRepo = repoName;
    }
    if (!gitHubID) {
        author = `...`;
    }
    if (!alias) {
        msAuthor = `...`;
    }

    /* tslint:disable:object-literal-sort-keys one-variable-per-declaration */
    const yaml = require("js-yaml");

    const moduleMetadata = {
        "title": moduleTitle,
        "description": `...`,
        "ms.date": `...`,
        "author": author,
        "ms.author": msAuthor,
        "ms.topic": `...`,
        "ms.prod": `...`,
    };
    const moduleData = {
        header: `### YamlMime:Module`,
        uid: `${learnRepo}.${formattedModuleName}`,
        metadata: moduleMetadata,
        title: moduleTitle,
        summary: `...`,
        abstract: `...`,
        prerequisites: `...`,
        iconUrl: `https://docs.microsoft.com/media/learn/module.svg`,
        levels: `...`,
        roles: `...`,
        products: `...`,
        // tslint:disable-next-line: object-literal-shorthand
        units: units,
        badge: [`{badge}`],
    };
    const moduleIndex = join(modulePath, "index.yml");
    const moduleContent = yaml.dump(moduleData);
    writeFileSync(moduleIndex, moduleContent);
    cleanupModule(moduleIndex);
}

// cleanup unnecessary characters, replace values and open module in new tab after it's written to disk.
export function cleanupModule(generatedModule: string) {
    try {
        const moduleContent = readFileSync(generatedModule, "utf8");
        const updatedModule = moduleContent.replace("header: ", "")
            .replace(`{badge}`, `uid: ${learnRepo}.${formattedModuleName}.badge`)
            .replace(/  -/g, "-")
            .replace(/'/g, "")
            .replace(`- uid: `, "  uid: ");
        writeFileSync(generatedModule, updatedModule, "utf8");
        const uri = Uri.file(generatedModule);
        const options: TextDocumentShowOptions = {
            preserveFocus: false,
            preview: false,
            viewColumn: ViewColumn.One,
        };
        window.showTextDocument(uri, options);
    } catch (error) {
        showStatusMessage(error);
    }
}
