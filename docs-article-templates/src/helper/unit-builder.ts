import { readFileSync, writeFileSync } from "fs";
import * as path from "path";
import { window } from "vscode";
import { moduleTitle } from "../controllers/quick-pick-controller";
import { extensionPath } from "../extension";
import { formatLearnNames } from "../helper/common";
import { formattedModuleName, modulePath } from "../helper/module-builder";
import { enterUnitName } from "../strings";

export let formattedUnitName: string;
let templateSource;

export function getUnitName() {
    templateSource = path.join(extensionPath, "learn-templates");
    const getUnitName = window.showInputBox({
        prompt: enterUnitName,
    });
    getUnitName.then((unitName) => {
        if (!unitName) {
            unitName = "default unit";
            // return;
        }
        const { formattedName } = formatLearnNames(unitName);
        formattedUnitName = formattedName;
        createUnits();
    });
}

export function createUnits() {
    const unitTemplate = path.join(templateSource, "unit.yml");
    const unitPath = path.join(modulePath, `${formattedUnitName}.yml`);
    const unitContent = readFileSync(unitTemplate, "utf8");
    const updatedUnit = unitContent.replace(/{module}/g, formattedModuleName).replace(/{unit}/g, formattedUnitName);
    writeFileSync(unitPath, updatedUnit, "utf8");
    updateModule();
}

export function updateModule() {
    const moduleTemplate = path.join(templateSource, "index.yml");
    const indexDest = path.join(modulePath, "index.yml");
    const indexContent = readFileSync(moduleTemplate, "utf8");
    const updatedIndex = indexContent.replace(/{module}/g, formattedModuleName).replace(/{unit}/g, formattedUnitName).replace("unformattedModuleTitle", moduleTitle);
    writeFileSync(indexDest, updatedIndex, "utf8");
}