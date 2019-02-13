import { readFileSync, writeFileSync } from "fs";
import * as path from "path";
import { window } from "vscode";
import { moduleTitle } from "../controllers/quick-pick-controller";
import { extensionPath } from "../extension";
import { formatLearnNames } from "../helper/common";
import { enterUnitName } from "../strings";

let templateSource;

export function getUnitName(modulePath: string, module: string) {
    templateSource = path.join(extensionPath, "learn-templates");
    const getUnitName = window.showInputBox({
        prompt: enterUnitName,
    });
    getUnitName.then((unitName) => {
        if (!unitName) {
            return;
        }
        const { formattedName } = formatLearnNames(unitName);
        createUnits(modulePath, module, formattedName);
    });
}

export function createUnits(modulePath: string, module: string, unit: string) {
    const unitTemplate = path.join(templateSource, "unit.yml");
    const unitPath = path.join(modulePath, `${unit}.yml`);
    const unitContent = readFileSync(unitTemplate, "utf8");
    const updatedUnit = unitContent.replace(/{module}/g, module).replace(/{unit}/g, unit);
    writeFileSync(unitPath, updatedUnit, "utf8");
    updateModule(modulePath, module, unit);
}

export function updateModule(modulePath: string, module: string, unit: string) {
    const moduleTemplate = path.join(templateSource, "index.yml");
    const indexDest = path.join(modulePath, "index.yml");
    const indexContent = readFileSync(moduleTemplate, "utf8");
    const updatedIndex = indexContent.replace(/{module}/g, module).replace(/{unit}/g, unit).replace("unformattedModuleTitle", moduleTitle);
    writeFileSync(indexDest, updatedIndex, "utf8");
}