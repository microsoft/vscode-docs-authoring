import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { window } from "vscode";
import { extensionPath } from "../extension";
import { formatLearnNames } from "../helper/common";
import { formattedModuleName, modulePath, repoName, updateModule } from "../helper/module-builder";
import { learnRepoId } from "../helper/user-settings";
import { enterUnitName, validateUnitName } from "../strings";

export let formattedUnitName: string;
let learnRepo: string;
let templateSource: string;
let unitTitle: string;

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
        createUnits();
    });
}

export function createUnits() {
    window.showInformationMessage("Create a new unit?", "Yes").then((result) => {
        if (result === "Yes") {
            getUnitName();
        }
    });
    const unitTemplate = join(templateSource, "unit.yml");
    const unitPath = join(modulePath, `${formattedUnitName}.yml`);
    const unitContent = readFileSync(unitTemplate, "utf8");
    if (!learnRepoId) {
        learnRepo = repoName;
    } else {
        learnRepo = learnRepoId;
    }
    const updatedUnit = unitContent.replace(/{module}/g, formattedModuleName)
        .replace(/{unit}/g, formattedUnitName)
        .replace(/{repo}/g, learnRepo)
        .replace(/{unformattedUnitTitle}/g, unitTitle);
    writeFileSync(unitPath, updatedUnit, "utf8");
    updateModule();
}
