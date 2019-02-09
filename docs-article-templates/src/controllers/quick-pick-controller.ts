"use strict";

import * as fs from "fs";
import * as dir from "node-dir";
import * as path from "path";
import * as vscode from "vscode";
import { output } from "../extension";
import * as common from "../helper/common";
import { cleanupDownloadFiles, templateDirectory } from "../helper/github";
import * as metadata from "../helper/user-metadata";

const markdownExtensionFilter = [".md"];

export async function showTemplates() {
    // create a new markdown file.
    const newFile = vscode.Uri.parse("untitled:" + "New-Topic.md");
    // parse the repo directory for markdown files, sort them and push them to the quick pick menu.
    vscode.workspace.openTextDocument(newFile).then((textDocument: vscode.TextDocument) => {
        vscode.window.showTextDocument(textDocument, 1, false).then((textEditor) => {
            dir.files(templateDirectory, (err, files) => {
                if (err) {
                    output.appendLine(err);
                    throw err;
                }
                const items: vscode.QuickPickItem[] = [];
                const learnModule: string = "Learn Module";
                items.push({ label: learnModule });
                files.sort();
                {
                    files.filter((file: any) => markdownExtensionFilter.indexOf(path.extname(file.toLowerCase()))
                        !== -1).forEach((file: any) => {
                            if (path.basename(file).toLowerCase() !== "readme.md") {
                                items.push({ label: path.basename(file) });
                            }
                        });
                }
                vscode.window.showQuickPick(items).then((qpSelection) => {
                    if (!qpSelection) {
                        return;
                    }
                    // let module;

                    if (qpSelection.label === learnModule) {
                        // const repoRoot = `${vscode.workspace.workspaceFolders[0].uri.fsPath}\\`;
                        const getModuleName = vscode.window.showInputBox({
                            prompt: "Enter module name.",
                        });
                        getModuleName.then((moduleName) => {
                            // build module name
                            const module = moduleName.replace(/ /g, "-").toLowerCase();
                            // tslint:disable-next-line:no-console
                            console.log(`This is the module name ${module}`);
                            getProductName(module);
                        });
                    }

                    if (qpSelection.label && qpSelection.label !== learnModule) {
                        const qpFullPath = path.join(qpSelection.description, qpSelection.label);
                        const content = fs.readFileSync(qpFullPath, "utf8");
                        textEditor.edit((edit) => {
                            let updatedContent;
                            const { msDateValue } = common.generateTimestamp();
                            // replace metadata placeholder values with user settings and dynamic values then write template content to new file.
                            if (!metadata.gitHubID && !metadata.alias) {
                                updatedContent = content.replace("{@date}", msDateValue).replace("{github-id}", metadata.missingValue).replace("{ms-alias}", metadata.missingValue);
                                edit.insert(new vscode.Position(0, 0), updatedContent);
                            } else if (!metadata.gitHubID) {
                                updatedContent = content.replace("{@date}", msDateValue).replace("{github-id}", metadata.missingValue).replace("{ms-alias}", metadata.alias);
                                edit.insert(new vscode.Position(0, 0), updatedContent);
                            } else if (!metadata.alias) {
                                updatedContent = content.replace("{@date}", msDateValue).replace("{github-id}", metadata.gitHubID).replace("{ms-alias}", metadata.missingValue);
                                edit.insert(new vscode.Position(0, 0), updatedContent);
                            } else {
                                updatedContent = content.replace("{@date}", msDateValue).replace("{github-id}", metadata.gitHubID).replace("{ms-alias}", metadata.alias);
                                edit.insert(new vscode.Position(0, 0), updatedContent);
                            }
                        });
                    }
                }, (error: any) => {
                    vscode.window.showWarningMessage(error);
                    output.appendLine(error);
                });
            });
        });
    });

    cleanupDownloadFiles();
}

export function getProductName(module: string) {
    const getProductName = vscode.window.showInputBox({
        prompt: "Enter product name.",
    });
    getProductName.then((productName) => {
        // tslint:disable-next-line:no-console
        console.log(`This is the product name ${productName}`);
        createModuleDirectory(module, productName)
    });
}

export function createModuleDirectory(module: string, product: string) {
    // fs.mkdirSync(path.join(repoRoot, product, module));
    try {
        const repoRoot = `${vscode.workspace.workspaceFolders[0].uri.fsPath}\\`;
        
        const productPath = path.join(repoRoot, product);
        if (!fs.existsSync(productPath)) {
            fs.mkdirSync(productPath);
        }

        const modulePath = path.join(repoRoot, product, module);
        if (!fs.existsSync(modulePath)) {
            fs.mkdirSync(modulePath);
        }
        
        // fs.mkdirSync(modulePath);
        fs.mkdirSync(path.join(repoRoot, product, module, "includes"));
        fs.mkdirSync(path.join(repoRoot, product, module, "media"));
        addModuleFiles(modulePath, module);
    } catch (error) {
        console.log(`Function: createModuleDirectory ${error}`);
    }

}

export function addModuleFiles(modulePath: string, module: string) {
    try {
        const introductionSrc = "E:\\GitHub\\vscode-docs-authoring\\docs-article-templates\\src\\learn-templates\\1-introduction.yml";
        const introductionDest = path.join(modulePath, "1-introduction.yml");
        const introductionContent = fs.readFileSync(introductionSrc,"utf8");
        const updatedIntro = introductionContent.replace("{module}", module);
        fs.writeFileSync(introductionDest, updatedIntro, "utf8");

        const indexSrc = "E:\\GitHub\\vscode-docs-authoring\\docs-article-templates\\src\\learn-templates\\index.yml";
        const indexDest = path.join(modulePath, "index.yml");
        const indexContent = fs.readFileSync(indexSrc,"utf8");
        const updatedIndex = indexContent.replace(/{module}/g, module);
        fs.writeFileSync(indexDest, updatedIndex, "utf8");
    } catch (error) {
        console.log(`Function: addModuleFiles ${error}`);
    }
}