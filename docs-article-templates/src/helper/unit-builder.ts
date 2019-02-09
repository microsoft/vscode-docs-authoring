import * as path from "path";
import { readFileSync, writeFileSync } from "fs";
import {extensionPath} from "../extension";

export function createUnits(modulePath: string, module: string) {
    const introductionSrc = path.join(extensionPath, "learn-templates", "1-introduction.yml");
    const introductionDest = path.join(modulePath, "1-introduction.yml");
    const introductionContent = readFileSync(introductionSrc, "utf8");
    const updatedIntro = introductionContent.replace(/{module}/g, module);
    writeFileSync(introductionDest, updatedIntro, "utf8");

    const indexSrc = path.join(extensionPath, "learn-templates", "index.yml");
    const indexDest = path.join(modulePath, "index.yml");
    const indexContent = readFileSync(indexSrc, "utf8");
    const updatedIndex = indexContent.replace(/{module}/g, module);
    writeFileSync(indexDest, updatedIndex, "utf8");
}
