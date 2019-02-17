import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { window } from "vscode";
import { extensionPath, output } from "../extension";
import { formatLearnNames } from "../helper/common";
import { formattedModuleName, includesDirectory, modulePath, repoName, updateModule } from "../helper/module-builder";
import { learnRepoId } from "../helper/user-settings";
import { enterUnitName, validateUnitName } from "../strings";

export let formattedUnitName: string;
let learnRepo: string;
let templateSource: string;
let unitTitle: string;
export const unitList = [];

export function getUnitName() {
    templateSource = join(extensionPath, "learn-templates");
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
        unitList.push(formattedUnitName);
        createUnits();
    });
}

export function promptForNumberOfUnits() {
    const promptForUnits = window.showInputBox({
        prompt: `Enter number of units.`
    });
    promptForUnits.then((units) => {
        console.log(units);
    })

}

export async function createUnits() {
    /* window.showInformationMessage("Create a new unit?", "Yes", "No").then((result) => {
        if (result === "Yes") {
            getUnitName();
        }
    }); */
    const unitTemplate = join(templateSource, "unit.yml");
    const unitPath = join(modulePath, `${formattedUnitName}.yml`);
    const unitContent = readFileSync(unitTemplate, "utf8");
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
    const includeFile = join(includesDirectory, `${formattedUnitName}.md`);
    writeFileSync(includeFile, "");
    // let uri = includeFile
    // let success = await commands.executeCommand('vscode.openFile', uri);
    cleanupUnit(unitPath);
    updateModule(unitList);
}

export function cleanupUnit(generatedUnit: string) {
    try {
        const moduleContent = readFileSync(generatedUnit, "utf8");
        const updatedModule = moduleContent.replace("header: ", "")
            .replace(/'/g, "");
        writeFileSync(generatedUnit, updatedModule, "utf8");
    } catch (error) {
        output.appendLine(error);
    }

}