"use strict";

import { readFileSync } from 'fs';
import { basename, resolve } from 'path';
import { commands, ExtensionContext, TextDocument, window } from "vscode";
import { Reporter } from "./helper/telemetry";

export const output = window.createOutputChannel("docs-preview");
export let extensionPath: string;
const INCLUDE_RE = /\[!include\s*\[\s*.+?\s*]\(\s*(.+?)\s*\)\s*]/i
const CODE_RE = /\[\!code-(.*)\[(.*)\]\((.*)\)\]/gmi

export function activate(context: ExtensionContext) {
    extensionPath = context.extensionPath;
    context.subscriptions.push(new Reporter(context));
    const disposableSidePreview = commands.registerCommand("docs.showPreviewToSide", (uri) => {
        commands.executeCommand("markdown.showPreviewToSide");
    });
    const disposableStandalonePreview = commands.registerCommand("docs.showPreview", (uri) => {
        commands.executeCommand("markdown.showPreview");
    });
    context.subscriptions.push(
        disposableSidePreview,
        disposableStandalonePreview);
    return {
        extendMarkdownIt(md) {
            let filePath = window.activeTextEditor.document.fileName;
            const workingPath = filePath.replace(basename(filePath), '')
            return md.use(require('markdown-it-include'), { root: workingPath, includeRe: INCLUDE_RE })
                .use(codeSnippets, { root: workingPath })
        }
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
    output.appendLine("Deactivating extension.");
}

export function isMarkdownFile(document: TextDocument) {
    return document.languageId === "markdown"; // prevent processing of own documents
}

function codeSnippets(md, options) {
    const replaceCodeSnippetWithContents = (src, rootdir) => {
        let captureGroup = CODE_RE.exec(src)
        const filePath = resolve(rootdir, captureGroup[3].trim());
        let mdSrc = readFileSync(filePath, 'utf8');
        mdSrc = `\`\`\`${captureGroup[1].trim()}\r\n${mdSrc}\r\n\`\`\``
        src = src.slice(0, captureGroup.index) + mdSrc + src.slice(captureGroup.index + captureGroup[0].length, src.length);
        return src;
    }

    const importCodeSnippet = (state) => {
        try {
            state.src = replaceCodeSnippetWithContents(state.src, options.root)
        } catch (error) {
            console.log(error)
        }
    }
    md.core.ruler.before('normalize', 'codesnippet', importCodeSnippet);
}