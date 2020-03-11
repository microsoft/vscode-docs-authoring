"use strict";

import { appendFileSync, readFileSync, writeFileSync } from "fs";
import { basename, join } from "path";
import { commands, ExtensionContext, TextDocument, window, workspace } from "vscode";
import { sendTelemetryData } from "./helper/common";
import { Reporter } from "./helper/telemetry";
import { codeSnippets, tripleColonCodeSnippets } from "./markdown-extensions/codesnippet";
import { column_end, columnEndOptions, columnOptions } from "./markdown-extensions/column";
import { container_plugin } from "./markdown-extensions/container";
import { div_plugin, divOptions } from "./markdown-extensions/div";
import { image_end, imageOptions } from "./markdown-extensions/image";
import { include } from "./markdown-extensions/includes";
import { rowEndOptions, rowOptions } from "./markdown-extensions/row";
import { video_plugin, videoOptions } from "./markdown-extensions/video";
import { xref } from "./xref/xref";

export const output = window.createOutputChannel("docs-preview");
export let extensionPath: string;
const telemetryCommand: string = "preview";

const previewThemeSetting = "preview.previewTheme";
let bodyAttribute: string = "";

export function activate(context: ExtensionContext) {
    const filePath = window.visibleTextEditors[0].document.fileName;
    const workingPath = filePath.replace(basename(filePath), "");
    extensionPath = context.extensionPath;
    const wrapperPath = join(extensionPath, "media", "wrapper.js");
    const wrapperJsData = readFileSync(wrapperPath, "utf8");
    const selectedPreviewTheme = workspace.getConfiguration().get(previewThemeSetting);
    switch (selectedPreviewTheme) {
        case "Use current VS Code theme":
            break;
        case "Light":
            if (wrapperJsData.includes("vscode-light")) {
                output.appendLine(`Current theme: Light.`);
            } else {
                const updatedWrapperJsData = wrapperJsData.replace(/body.setAttribute.*;/gm, "");
                writeFileSync(wrapperPath, updatedWrapperJsData, "utf8");
                bodyAttribute = `body.setAttribute("class", "vscode-body scrollBeyondLastLine wordWrap showEditorSelection vscode-light");`;
            }
            break;
        case "Dark":
            if (wrapperJsData.includes("vscode-dark")) {
                output.appendLine(`Current theme: Dark.`);
            } else {
                const updatedWrapperJsData = wrapperJsData.replace(/body.setAttribute.*;/gm, "");
                writeFileSync(wrapperPath, updatedWrapperJsData, "utf8");
                bodyAttribute = `body.setAttribute("class", "vscode-body scrollBeyondLastLine wordWrap showEditorSelection vscode-dark");`;
            }
            break;
        case "High Contrast":
            if (wrapperJsData.includes("vscode-high-contrast")) {
                output.appendLine(`Current theme: High Contrast.`);
            } else {
                const updatedWrapperJsData = wrapperJsData.replace(/body.setAttribute.*;/gm, "");
                writeFileSync(wrapperPath, updatedWrapperJsData, "utf8");
                bodyAttribute = `body.setAttribute("class", "vscode-body scrollBeyondLastLine wordWrap showEditorSelection vscode-high-contrast");`;
            }
            break;
    }
    appendFileSync(wrapperPath, bodyAttribute, "utf8");

    workspace.onDidChangeConfiguration((e: any) => {
        if (e.affectsConfiguration(previewThemeSetting)) {
            window.showInformationMessage("Your updated configuration has been recorded, but you must reload to see its effects.", "Reload")
                .then((res) => {
                    if (res === "Reload") {
                        commands.executeCommand("workbench.action.reloadWindow");
                    }
                });
        }
    });

    context.subscriptions.push(new Reporter(context));
    const disposableSidePreview = commands.registerCommand("docs.showPreviewToSide", (uri) => {
        commands.executeCommand("markdown.showPreviewToSide");
        const commandOption = "show-preview-to-side";
        sendTelemetryData(telemetryCommand, commandOption);
    });
    const disposableStandalonePreview = commands.registerCommand("docs.showPreview", (uri) => {
        commands.executeCommand("markdown.showPreview");
        const commandOption = "show-preview-tab";
        sendTelemetryData(telemetryCommand, commandOption);
    });
    context.subscriptions.push(
        disposableSidePreview,
        disposableStandalonePreview);
    return {
        extendMarkdownIt(md) {
            return md.use(include, { root: workingPath })
                .use(codeSnippets, { root: workingPath })
                .use(tripleColonCodeSnippets, { root: workingPath })
                .use(xref)
                .use(column_end)
                .use(container_plugin, "row", rowOptions)
                .use(container_plugin, "row-end", rowEndOptions)
                .use(container_plugin, "column", columnOptions)
                .use(container_plugin, "column-end", columnEndOptions)
                .use(div_plugin, "div", divOptions)
                .use(container_plugin, "image", imageOptions)
                .use(image_end)
                .use(video_plugin, "video", videoOptions);
        },
    };
}

// this method is called when your extension is deactivated
export function deactivate() {
    output.appendLine("Deactivating extension.");
}
