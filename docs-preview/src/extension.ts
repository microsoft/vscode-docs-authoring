"use strict";

import { readFileSync } from "fs";
import { basename, resolve } from "path";
import { commands, ExtensionContext, TextDocument, window } from "vscode";
import { Reporter, reporter } from "./helper/telemetry";

export const output = window.createOutputChannel("docs-preview");
export let extensionPath: string;
export const INCLUDE_RE = /\[!include\s*\[\s*.+?\s*]\(\s*(.+?)\s*\)\s*]/i;
export const CODE_RE = /\[\!code-(.*)\[(.*)\]\((.*)\)\]/gmi;

export function activate(context: ExtensionContext) {
    extensionPath = context.extensionPath;
    context.subscriptions.push(new Reporter(context));
    const disposableSidePreview = commands.registerCommand("docs.showPreviewToSide", (uri) => {
        commands.executeCommand("markdown.showPreviewToSide");
        reporter.sendTelemetryEvent(`preview.show-preview-to-side`, null, null);
    });
    const disposableStandalonePreview = commands.registerCommand("docs.showPreview", (uri) => {
        commands.executeCommand("markdown.showPreview");
        reporter.sendTelemetryEvent(`preview.show-preview-tab`, null, null);
    });
    context.subscriptions.push(
        disposableSidePreview,
        disposableStandalonePreview);
    return {
        extendMarkdownIt(md) {
            const filePath = window.activeTextEditor.document.fileName;
            const workingPath = filePath.replace(basename(filePath), "");
            return md.use(require("markdown-it-include"), { root: workingPath, includeRe: INCLUDE_RE })
                .use(codeSnippets, { root: workingPath });
        }
    };
}

// this method is called when your extension is deactivated
export function deactivate() {
    output.appendLine("Deactivating extension.");
}

export function isMarkdownFile(document: TextDocument) {
    return document.languageId === "markdown"; // prevent processing of own documents
}

export function codeSnippets(md, options) {
    const replaceCodeSnippetWithContents = (src, rootdir) => {
        const captureGroup = CODE_RE.exec(src);
        const filePath = resolve(rootdir, captureGroup[3].trim());
        let mdSrc = readFileSync(filePath, "utf8");
        mdSrc = `\`\`\`${captureGroup[1].trim()}\r\n${mdSrc}\r\n\`\`\``;
        src = src.slice(0, captureGroup.index) + mdSrc + src.slice(captureGroup.index + captureGroup[0].length, src.length);
        return src;
    };

    const importCodeSnippet = (state) => {
        try {
            state.src = replaceCodeSnippetWithContents(state.src, options.root);
        } catch (error) {
            output.appendLine(error);
        }
    };
    md.core.ruler.before("normalize", "codesnippet", importCodeSnippet);
}
