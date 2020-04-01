import { readFileSync, writeFileSync } from "fs";
import { join, parse } from "path";
import { MessageOptions, TextDocumentShowOptions, Uri, ViewColumn, window } from "vscode";
import { formatLearnNames, showStatusMessage } from "../helper/common";
import { formattedModuleName, includesDirectory, modulePath, repoName, updateModule } from "../helper/module-builder";
import { alias, gitHubID, learnRepoId } from "../helper/user-settings";
import { enterUnitName, validateUnitName } from "../strings";

export const unitList = [];
export let formattedUnitName: string;
let learnRepo: string = learnRepoId;
let includeFile: string;
let unitTitle: string;
let author: string = gitHubID;
let msAuthor: string = alias;

// input box used to gather unit name.  input is validated and if no name is entered, exit the function.
export function getUnitName(existingModule?: boolean, existingModulePath?: string) {
    const getUnitNameInput = window.showInputBox({
        prompt: enterUnitName,
        validateInput: (userInput) => userInput.length > 0 ? "" : validateUnitName,
    });
    getUnitNameInput.then((unitName) => {
        if (!unitName) {
            return;
        }
        unitTitle = unitName;
        const { formattedName } = formatLearnNames(unitName);
        formattedUnitName = formattedName;
        if (existingModule) {
            addUnitToModule(existingModulePath);
        } else {
            createUnits();
        }
    });
}

// data used to create the unit(s) yml file.
export function createUnits() {
    const options: MessageOptions = { modal: true };
    window.showInformationMessage(`Create a new unit? Previous unit: ${unitTitle}`, options, "Yes", "No").then((result) => {
        if (result === "Yes") {
            getUnitName();
        }
    });
    const unitPath = join(modulePath, `${formattedUnitName}.yml`);
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

    const unitMetadata = {
        "title": unitTitle,
        "description": `...`,
        "ms.date": `...`,
        "author": author,
        "ms.author": msAuthor,
        "ms.topic": `interactive-tutorial`,
        "ms.prod": `...`,
        "ROBOTS": `NOINDEX`,
    };
    const unitData = {
        header: `### YamlMime:ModuleUnit`,
        uid: `${learnRepo}.${formattedModuleName}.${formattedUnitName}`,
        metadata: unitMetadata,
        title: `${unitTitle}`,
        durationInMinutes: `1`,
        content: `\n[!include[](includes/${formattedUnitName}.md)]`,
    };
    const unitContent = yaml.dump(unitData);
    writeFileSync(unitPath, unitContent);
    unitList.push(`${learnRepo}.${formattedModuleName}.${formattedUnitName}`);
    includeFile = join(includesDirectory, `${formattedUnitName}.md`);
    writeFileSync(includeFile, "");
    cleanupUnit(unitPath);
}

// cleanup unnecessary characters, replace values and open unit in new tab after it's written to disk.
export function cleanupUnit(generatedUnit: string, preserveValues?: boolean) {
    try {
        const moduleContent = readFileSync(generatedUnit, "utf8");
        const updatedModule = moduleContent.replace("header: ", "")
            .replace(/'/g, "")
            .replace(`content: |-`, "content: |")
            .replace(/^\s*[\r\n]/gm, "");
        writeFileSync(generatedUnit, updatedModule, "utf8");
        const uri = Uri.file(generatedUnit);
        const options: TextDocumentShowOptions = {
            preserveFocus: false,
            preview: false,
            viewColumn: ViewColumn.One,
        };
        window.showTextDocument(uri, options);
        if (preserveValues) {
            window.showInformationMessage(`${generatedUnit} created.  Please add unit to index file.`);
        } else {
            updateModule(unitList);
        }
    } catch (error) {
        showStatusMessage(error);
    }
}

// data used to create the unit(s) yml file.
export function addUnitToModule(existingModulePath: string) {
    let unitPath;

    unitList.push(`${learnRepo}.${formattedModuleName}.${formattedUnitName}`);
    const moduleDirectory = parse(existingModulePath).dir;
    unitPath = join(moduleDirectory, `${formattedUnitName}.yml`);
    if (!gitHubID) {
        author = `...`;
    }
    if (!alias) {
        msAuthor = `...`;
    }

    /* tslint:disable:object-literal-sort-keys one-variable-per-declaration */
    const yaml = require("js-yaml");
    const config = yaml.safeLoad(readFileSync(existingModulePath, "utf8"));

    const unitMetadata = {
        "title": unitTitle,
        "description": `...`,
        "ms.date": `...`,
        "author": author,
        "ms.author": msAuthor,
        "ms.topic": `interactive-tutorial`,
        "ms.prod": `...`,
        "ROBOTS": `NOINDEX`,
    };
    const unitData = {
        header: `### YamlMime:ModuleUnit`,
        uid: `${config.uid}.${formattedUnitName}`,
        metadata: unitMetadata,
        title: `${unitTitle}`,
        durationInMinutes: `1`,
        content: `\n[!include[](includes/${formattedUnitName}.md)]`,
    };
    const unitContent = yaml.dump(unitData);
    writeFileSync(unitPath, unitContent);
    const includeDirectory = join(moduleDirectory, "includes");
    includeFile = join(includeDirectory, `${formattedUnitName}.md`);
    writeFileSync(includeFile, "");
    cleanupUnit(unitPath, true);
}
