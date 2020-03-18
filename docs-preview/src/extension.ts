"use strict";
import { basename } from "path";
import { commands, ExtensionContext, Uri, ViewColumn, WebviewPanel, window, workspace } from "vscode";
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

export function activate(context: ExtensionContext) {
    let panel: WebviewPanel;
    const filePath = window.visibleTextEditors[0].document.fileName;
    const workingPath = filePath.replace(basename(filePath), "");
    extensionPath = context.extensionPath;
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
            panel.webview.html = await provider.provideTextDocumentContent();
        }
    }));

    const disposableSEOPreview = commands.registerCommand("docs.seoPreview", seoPreview(ViewColumn.One));
    const disposableSideSEOPreview = commands.registerCommand("docs.seoPreviewToSide", seoPreview(ViewColumn.Two));
    context.subscriptions.push(
        disposableSidePreview,
        disposableStandalonePreview,
        disposableSEOPreview,
        disposableSideSEOPreview);
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

// this method is called when your extension is deactivated
export function deactivate() {
    output.appendLine("Deactivating extension.");
}
