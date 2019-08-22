"use strict";

import { rename } from "fs";
import { basename } from "path";
import { commands, ExtensionContext, TextDocument, window } from "vscode";
import { sendTelemetryData } from "./helper/common";
import { Reporter } from "./helper/telemetry";
import { codeSnippets, custom_codeblock } from "./markdown-extensions/codesnippet";
import { column_end, columnOptions } from "./markdown-extensions/column";
import { container_plugin } from "./markdown-extensions/container";
import { div_plugin, divOptions } from "./markdown-extensions/div";
import { rowOptions } from "./markdown-extensions/row";
import { video_plugin, videoOptions } from "./markdown-extensions/video";
import { xref } from "./xref/xref";

export const output = window.createOutputChannel("docs-preview");
export let extensionPath: string;
export const INCLUDE_RE = /\[!include\s*\[\s*.+?\s*]\(\s*(.+?)\s*\)\s*]/i;
const telemetryCommand: string = "preview";

export function activate(context: ExtensionContext) {
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
    context.subscriptions.push(
        disposableSidePreview,
        disposableStandalonePreview);
    return {
        extendMarkdownIt(md) {
            const filePath = window.activeTextEditor.document.fileName;
            const workingPath = filePath.replace(basename(filePath), "");
            return md.use(require("markdown-it-include"), { root: workingPath, includeRe: INCLUDE_RE })
                .use(codeSnippets, { root: workingPath })
                .use(xref)
                .use(custom_codeblock)
                .use(column_end)
                .use(container_plugin, "row", rowOptions)
                .use(container_plugin, "column", columnOptions)
                .use(div_plugin, "div", divOptions)
                .use(video_plugin, "video", videoOptions);
        },
    };
}

// this method is called when your extension is deactivated
export function deactivate() {
    output.appendLine("Deactivating extension.");
}
