import * as path from "path";
import { commands, ExtensionContext, extensions, OutputChannel, Position, Range, Selection, TextEditorRevealType, Uri, ViewColumn, WebviewPanel, window, workspace } from "vscode";
import { DocumentContentProvider, isMarkdownFile } from "./provider";
import { MarkdocsServer } from "./server";
import * as util from "./util/common";
import { Logger } from "./util/logger";

let channel: OutputChannel = null;
let server: MarkdocsServer = null;
let panelMap: Map<string, WebviewPanel> = new Map();

export async function activate(context: ExtensionContext) {

    const extensionId = "docsmsft.docs-preview";
    const extension = extensions.getExtension(extensionId);

    util.setExtensionPath(extension.extensionPath);

    channel = window.createOutputChannel("docs-preview");
    const logger = new Logger((text) => channel.append(text));

    server = new MarkdocsServer(context);

    const provider = new DocumentContentProvider(context);
    await server.ensureRuntimeDependencies(extension, channel, logger);

    await server.startMarkdocsServerAsync();

    const registration = workspace.registerTextDocumentContentProvider(DocumentContentProvider.scheme, provider);

    const disposableSidePreview = commands.registerCommand("docs.showPreviewToSide", (uri) => {
        preview(uri, ViewColumn.Two, provider, context);
    });
    const disposableStandalonePreview = commands.registerCommand("docs.showPreview", (uri) => {
        preview(uri, ViewColumn.One, provider, context);
    });
    const disposableDidClick = commands.registerCommand("docs.didClick", (uri, line) => {
        click(uri, line);
    });
    const disposableRevealLink = commands.registerCommand("docs.revealLine", (uri, line) => {
        reveal(uri, line);
    });

    context.subscriptions.push(
        disposableSidePreview,
        disposableStandalonePreview,
        disposableDidClick,
        disposableRevealLink,
        registration);

    context.subscriptions.push(workspace.onDidChangeTextDocument((event) => {
        if (isMarkdownFile(event.document)) {
            const uri = getPreviewUri(event.document.uri);
            provider.update(uri, panelMap);
        }
    }));

    context.subscriptions.push(workspace.onDidSaveTextDocument((document) => {
        if (isMarkdownFile(document)) {
            const uri = getPreviewUri(document.uri);
            provider.update(uri, panelMap);
        }
    }));

    context.subscriptions.push(window.onDidChangeTextEditorSelection((event) => {
        if (isMarkdownFile(event.textEditor.document)) {
            const markdownFile = getPreviewUri(event.textEditor.document.uri);

            this.editor.webview.postMessage({
                type: 'onDidChangeTextEditorSelection',
                line: event.selections[0].active.line,
                source: markdownFile
            });
        }
    }));
}

export function deactivate() {
    return server.stopMarkdocsServerAsync();
}

function getPreviewUri(uri: Uri) {
    if (uri.scheme === DocumentContentProvider.scheme) {
        return uri;
    }

    return uri.with({
        path: uri.fsPath + ".rendered",
        query: uri.toString(),
        scheme: DocumentContentProvider.scheme,
    });
}

async function preview(uri: Uri, viewColumn: number, provider: DocumentContentProvider, context: ExtensionContext) {
    if (window.activeTextEditor) {
        uri = uri || window.activeTextEditor.document.uri;
    }

    if (!uri) {
        return;
    }

    const previewUri = getPreviewUri(uri);

    const panel = window.createWebviewPanel(
        previewUri.fsPath,
        `view ${path.basename(uri.fsPath)}`,
        viewColumn,
        {
            enableCommandUris: true,
            enableScripts: true,
            localResourceRoots: [
                Uri.file(path.join(context.extensionPath, 'media'))
            ]
        }
    );

    panel.webview.html = await provider.provideTextDocumentContent(previewUri);
    panelMap.set(previewUri.fsPath, panel);
}

function click(uri: string, line: number) {
    const sourceUri = Uri.parse(decodeURIComponent(uri));
    return workspace.openTextDocument(sourceUri)
        .then((document) => window.showTextDocument(document))
        .then((editor) =>
            commands.executeCommand("revealLine", { lineNumber: Math.floor(line), at: "center" })
                .then(() => editor))
        .then((editor) => {
            if (editor) {
                editor.selection = new Selection(
                    new Position(Math.floor(line), 0),
                    new Position(Math.floor(line), 0));
            }
        });
}

function reveal(uri: string, line: number) {
    const sourceUri = Uri.parse(decodeURIComponent(uri));

    window.visibleTextEditors
        .filter((editor) => isMarkdownFile(editor.document) && editor.document.uri.toString() === sourceUri.toString())
        .forEach((editor) => {
            const sourceLine = Math.floor(line);
            const fraction = line - sourceLine;
            const text = editor.document.lineAt(sourceLine).text;
            const start = Math.floor(fraction * text.length);
            editor.revealRange(
                new Range(sourceLine, start, sourceLine + 1, 0),
                TextEditorRevealType.AtTop);
        });
}
