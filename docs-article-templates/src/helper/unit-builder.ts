import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { MessageOptions, TextDocumentShowOptions, Uri, ViewColumn, window } from "vscode";
import { output } from "../extension";
import { formatLearnNames } from "../helper/common";
import { formattedModuleName, includesDirectory, modulePath, repoName, updateModule } from "../helper/module-builder";
import { learnRepoId } from "../helper/user-settings";
import { enterUnitName, validateUnitName } from "../strings";

export const unitList = [];
export let formattedUnitName: string;
let learnRepo: string;
let includeFile: string;
let unitTitle: string;
let author: string;
let msAuthor: string;

// input box used to gather unit name.  input is validated and if no name is entered, exit the function.
export function getUnitName() {
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
        createUnits();
    });
}

// data used to create the unit(s) yml file.
export async function createUnits() {
    const options: MessageOptions = { modal: true };
    window.showInformationMessage(`Create a new unit? Previous unit: ${unitTitle}`, options, "Yes", "No").then((result) => {
        if (result === "Yes") {
            getUnitName();
        }
    });
    const unitPath = join(modulePath, `${formattedUnitName}.yml`);
    if (!learnRepoId) {
        learnRepo = repoName;
    } else {
        learnRepo = learnRepoId;
    }

    /* tslint:disable:object-literal-sort-keys */
    const yaml = require("write-yaml");
    // tslint:disable-next-line: one-variable-per-declaration
    const unitMetadata = {
        "title": unitTitle,
        "description": `...`,
        "ms.date": `...`,
        "author": `...`,
        "ms.author": `...`,
        "ms.topic": `...`,
        "ms.prod": `...`,
        "ROBOTS": `NOINDEX`,
    };

    const data = {
        header: `### YamlMime:ModuleUnit`,
        uid: `${learnRepo}.${formattedModuleName}.${formattedUnitName}`,
        metadata: unitMetadata,
        title: `${unitTitle}`,
        durationInMinutes: `1`,
        content: `\n[!include[](includes/${formattedUnitName}.md)]`,
    };
    yaml.sync(unitPath, data);
    unitList.push(`${learnRepo}.${formattedModuleName}.${formattedUnitName}`);
    includeFile = join(includesDirectory, `${formattedUnitName}.md`);
    writeFileSync(includeFile, "");
    cleanupUnit(unitPath);
}

// cleanup unnecessary characters, replace values and open unit in new tab after it's written to disk.
export async function cleanupUnit(generatedUnit: string) {
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
        updateModule(unitList);
    } catch (error) {
        output.appendLine(error);
    }
}
