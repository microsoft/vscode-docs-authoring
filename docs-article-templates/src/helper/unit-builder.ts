import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { MessageOptions, window, Uri, ViewColumn, TextDocumentShowOptions } from "vscode";
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
    const options: MessageOptions = {modal: true};
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
    const data = {
        header: `### YamlMime:ModuleUnit`,
        uid: `${learnRepo}.${formattedModuleName}.${formattedUnitName}`,
        title: `${unitTitle}`,
        durationInMinutes: `1`,
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
            .replace(/'/g, "");
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
