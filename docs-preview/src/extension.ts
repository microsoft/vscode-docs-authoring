"use strict";

import { appendFileSync, readFileSync, writeFileSync } from "fs";
import { basename, join } from "path";
import { commands, ExtensionContext, ViewColumn, WebviewPanel, window, workspace } from "vscode";
import { isMarkdownFile, isYamlFile, sendTelemetryData } from "./helper/common";
import { Reporter } from "./helper/telemetry";
import { codeSnippets, tripleColonCodeSnippets } from "./markdown-extensions/codesnippet";
import { column_end, columnEndOptions, columnOptions } from "./markdown-extensions/column";
import { container_plugin } from "./markdown-extensions/container";
import { div_plugin, divOptions } from "./markdown-extensions/div";
import { image_end, imageOptions } from "./markdown-extensions/image";
import { include } from "./markdown-extensions/includes";
import { rowEndOptions, rowOptions } from "./markdown-extensions/row";
import { video_plugin, videoOptions } from "./markdown-extensions/video";
import { DocumentContentProvider } from "./seo/seoPreview";
import { xref } from "./xref/xref";

export const output = window.createOutputChannel("docs-preview");
export let extensionPath: string;
const telemetryCommand: string = "preview";

const previewThemeSetting: string = "preview.previewTheme";
const reloadMessage = "Your updated configuration has been recorded, but you must reload to see its effects.";

export async function activate(context: ExtensionContext) {
    let panel: WebviewPanel;
    themeHandler(context);

    workspace.onDidChangeConfiguration((e: any) => promptForReload(e, reloadMessage));

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

    const provider = new DocumentContentProvider();

    context.subscriptions.push(workspace.onDidChangeTextDocument(async (event) => {
        if (isMarkdownFile(event.document) || isYamlFile(event.document)) {
            if (panel) {
                panel.webview.html = await provider.provideTextDocumentContent();
            }
        }
    }));

    const disposableSEOPreview = commands.registerCommand("docs.seoPreview", seoPreview(ViewColumn.Two));
    context.subscriptions.push(
        disposableSidePreview,
        disposableStandalonePreview,
        disposableSEOPreview);

    let filePath = "";
    const editor = window.activeTextEditor;
    if (editor) {
        filePath = editor.document.fileName;
    }
    filePath = await getRecentlyOpenDocument(filePath, context);
    const workingPath = filePath.replace(basename(filePath), "");

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

    function seoPreview(column): (...args: any[]) => any {
        return async () => {
            // Create and show a new webview
            panel = window.createWebviewPanel("seoPreview", "SEO Preview", { preserveFocus: true, viewColumn: column }, {});
            panel.webview.html = await provider.provideTextDocumentContent();
        };
    }
}

function themeHandler(context: ExtensionContext) {
    let bodyAttribute: string = "";
    extensionPath = context.extensionPath;
    const wrapperPath = join(extensionPath, "media", "wrapper.js");
    const wrapperJsData = readFileSync(wrapperPath, "utf8");
    const selectedPreviewTheme = workspace.getConfiguration().get(previewThemeSetting);
    switch (selectedPreviewTheme) {
        case "Light":
            if (wrapperJsData.includes("theme-light")) {
                output.appendLine(`Current theme: Light.`);
            } else {
                const updatedWrapperJsData = wrapperJsData.replace(/body.setAttribute.*;/gm, "");
                writeFileSync(wrapperPath, updatedWrapperJsData, "utf8");
                bodyAttribute = `body.setAttribute("class", "theme-light");`;
            }
            break;
        case "Dark":
            if (wrapperJsData.includes("theme-dark")) {
                output.appendLine(`Current theme: Dark.`);
            } else {
                const updatedWrapperJsData = wrapperJsData.replace(/body.setAttribute.*;/gm, "");
                writeFileSync(wrapperPath, updatedWrapperJsData, "utf8");
                bodyAttribute = `body.setAttribute("class", "theme-dark");`;
            }
            break;
        case "High Contrast":
            if (wrapperJsData.includes("theme-high-contrast")) {
                output.appendLine(`Current theme: High Contrast.`);
            } else {
                const updatedWrapperJsData = wrapperJsData.replace(/body.setAttribute.*;/gm, "");
                writeFileSync(wrapperPath, updatedWrapperJsData, "utf8");
                bodyAttribute = `body.setAttribute("class", "theme-high-contrast");`;
            }
            break;
    }
    appendFileSync(wrapperPath, bodyAttribute, "utf8");
}

// this method is called when your extension is deactivated
export function deactivate() {
    output.appendLine("Deactivating extension.");
}

function promptForReload(e, message: string) {
    if (e.affectsConfiguration(previewThemeSetting)) {
        window.showInformationMessage(message, "Reload")
            .then((res) => {
                if (res === "Reload") {
                    commands.executeCommand("workbench.action.reloadWindow");
                }
            });
    }
}

async function getRecentlyOpenDocument(filePath: string, context: ExtensionContext) {
    if (!filePath) {
        filePath = context.globalState.get("openDocument");
    } else if (filePath === "extension-output-#1"
        || filePath === "tasks") {
        filePath = context.globalState.get("openDocument");
    } else {
        await context.globalState.update("openDocument", filePath);
    }
    return filePath;
}
