import * as path from "path";
import {
    commands,
    Extension,
    ExtensionContext,
    extensions,
    OutputChannel,
    Position,
    Range,
    Selection,
    TextEditorRevealType,
    Uri,
    ViewColumn,
    window,
    workspace,
} from "vscode";
import { DocumentContentProvider, isMarkdownFile } from "./provider";
import { MarkdocsServer } from "./server";
import * as util from "./util/common";
import { Logger } from "./util/logger";

let channel: OutputChannel = null;
let server: MarkdocsServer = null;

export async function activate(context: ExtensionContext) {

    const extensionId = "qezhu.markdocs";
    const extension = extensions.getExtension(extensionId);

    util.setExtensionPath(extension.extensionPath);

    channel = window.createOutputChannel("markdocs");
    const logger = new Logger((text) => channel.append(text));

    server = new MarkdocsServer(context);

    const provider = new DocumentContentProvider(context);
    await server.ensureRuntimeDependencies(extension, channel, logger);

    await server.startMarkdocsServerAsync();

    const registration = workspace.registerTextDocumentContentProvider(DocumentContentProvider.scheme, provider);

    const disposableSidePreview = commands.registerCommand("markdocs.showPreviewToSide", (uri) => {
        preview(uri, ViewColumn.Two, provider);
    });
    const disposableStandalonePreview = commands.registerCommand("markdocs.showPreview", (uri) => {
        preview(uri, ViewColumn.One, provider);
    });
    const disposableDidClick = commands.registerCommand("markdocs.didClick", (uri, line) => {
        click(uri, line);
    });
    const disposableRevealLink = commands.registerCommand("markdocs.revealLine", (uri, line) => {
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
            provider.update(uri);
        }
    }));

    context.subscriptions.push(workspace.onDidSaveTextDocument((document) => {
        if (isMarkdownFile(document)) {
            const uri = getPreviewUri(document.uri);
            provider.update(uri);
        }
    }));

    context.subscriptions.push(window.onDidChangeTextEditorSelection((event) => {
        if (isMarkdownFile(event.textEditor.document)) {
            const markdownFile = getPreviewUri(event.textEditor.document.uri);

            commands.executeCommand("_workbench.htmlPreview.postMessage",
                markdownFile,
                {
                    line: event.selections[0].active.line,
                });
        }
    }));
}

export function deactivate() {
    server.stopMarkdocsServer();
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

function preview(uri: Uri, viewColumn: number, provider: DocumentContentProvider) {
    if (window.activeTextEditor) {
        uri = uri || window.activeTextEditor.document.uri;
    }

    if (!uri) {
        return;
    }

    const previewUri = getPreviewUri(uri);
    provider.update(previewUri);
    return commands.executeCommand("vscode.previewHtml", previewUri, viewColumn, `view ${path.basename(uri.fsPath)}`);
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
