import * as fs from "fs";
import * as path from "path";
import {
    Event,
    EventEmitter,
    ExtensionContext,
    ProviderResult,
    TextDocument,
    TextDocumentContentProvider,
    Uri,
    window,
    workspace,
} from "vscode";
import MarkdownService from "./markdownService";
import MarkdownPreviewConfig from "./util/markdownPreviewConfig";
import PreviewConfigManager from "./util/previewConfigManager";

export class DocumentContentProvider implements TextDocumentContentProvider {
    public static readonly scheme = "markdocs";
    private sourceUri: Uri;
    private onDidChangeEvent = new EventEmitter<Uri>();
    private waiting = false;
    private context: ExtensionContext;
    private extraStyles: Uri[] = [];
    private extraScripts: Uri[] = [];
    private nonce: string;
    private config: MarkdownPreviewConfig;
    private initialData;
    private previewConfigurations = new PreviewConfigManager();
    private readonly yamlHeaderRegex = new RegExp(/<yamlheader.*?>([\s\S]*?)<\/yamlheader>/, "i");

    constructor(context: ExtensionContext) {
        this.context = context;
    }

    public provideTextDocumentContent(uri: Uri): ProviderResult<string> {
        this.sourceUri = Uri.parse(uri.query);

        let initialLine: number | undefined;
        const editor = window.activeTextEditor;

        if (editor && editor.document.uri.toString() === this.sourceUri.toString()) {
            initialLine = editor.selection.active.line;
        }

        this.nonce = new Date().getTime() + "" + new Date().getMilliseconds();
        this.config = this.previewConfigurations.loadAndCacheConfiguration(this.sourceUri);
        this.initialData = {
            doubleClickToSwitchToEditor: this.config.doubleClickToSwitchToEditor,
            line: initialLine,
            previewUri: uri.toString(),
            scrollEditorWithPreview: this.config.scrollEditorWithPreview,
            scrollPreviewWithEditorSelection: this.config.scrollPreviewWithEditorSelection,
            source: this.sourceUri.toString(),
        };

        const workspaceRoot = workspace.rootPath;

        return workspace.openTextDocument(this.sourceUri)
            .then((document) => {
                const content = document.getText();

                if (!workspaceRoot) {
                    return this.markupAsync(content, path.basename(document.fileName), path.dirname(document.fileName), document.uri);
                }

                const basePath = path.dirname(document.fileName);
                let docsetRoot = this.getDocsetRoot(basePath) || workspaceRoot;
                const filePath = path.relative(docsetRoot, document.fileName);
                docsetRoot = docsetRoot.replace(/\\/g, "/");

                return this.markupAsync(content, filePath, docsetRoot, document.uri);
            });
    }

    get onDidChange(): Event<Uri> {
        return this.onDidChangeEvent.event;
    }

    public update(uri: Uri) {
        if (!this.waiting) {
            this.waiting = true;
            setTimeout(() => {
                this.waiting = false;
                this.onDidChangeEvent.fire(uri);
            }, 50);
        }
    }

    public addScript(resource: Uri): void {
        this.extraScripts.push(resource);
    }

    public addStyle(resource: Uri): void {
        this.extraStyles.push(resource);
    }

    private async markupAsync(markdown: string, filePath: string, basePath: string, uri: Uri): Promise<string> {
        let body = await MarkdownService.markupAsync(markdown, filePath, basePath);
        body = this.filterYamlHeader(body);
        body = this.fixLinks(body, uri);

        const result = `<!DOCTYPE html>
        <html>
        <head>
            <meta http-equiv="Content-type" content="text/html;charset=UTF-8">
            <meta id="vscode-markdown-preview-data" data-settings="${JSON.stringify(this.initialData).replace(/"/g, "&quot;")}">
            ${this.getStyles(this.sourceUri, this.nonce, this.config)}
            <base href="${uri.toString(true)}">
        </head>
        <body>
            ${body}
            ${this.getScripts(this.nonce)}
            <script>hljs.initHighlightingOnLoad();</script>
        </body>
        </html>`;

        return result;
    }

    private filterYamlHeader(body: string): string {
        return body.replace(this.yamlHeaderRegex, "");
    }

    private getDocsetRoot(dir: string): string {
        if (dir && path.dirname(dir) !== dir) {
            const config = path.join(dir, "docfx.json");
            if (fs.existsSync(config)) {
                return dir;
            }

            return this.getDocsetRoot(path.dirname(dir));
        }

        return null;
    }

    private getStyles(resource: Uri, nonce: string, config: MarkdownPreviewConfig): string {
        const baseStyles = [
            this.getMediaPath("markdown.css"),
            this.getMediaPath("tomorrow.css"),
            this.getNodeModulePath("highlightjs/styles/tomorrow-night-bright.css"),
            this.getMediaPath("docfx.css"),
        ].concat(this.extraStyles.map((style) => style.toString()));

        return `${baseStyles.map((href) => `<link rel="stylesheet" type="text/css" href="${href}">`).join("\n")}
			${this.getSettingsOverrideStyles(nonce, config)}
			${this.computeCustomStyleSheetIncludes(resource, config)}`;
    }

    private getScripts(nonce: string): string {
        const scripts = [
            this.getNodeModulePath("jquery/dist/jquery.min.js"),
            this.getNodeModulePath("highlightjs/highlight.pack.js"),
            this.getMediaPath("main.js"),
            this.getMediaPath("docfx.js"),
        ].concat(this.extraScripts.map((resource) => resource.toString()));
        return scripts
            .map((source) => `<script src="${source}" nonce="${nonce}" charset="UTF-8"></script>`)
            .join("\n");
    }

    private getSettingsOverrideStyles(nonce: string, config: MarkdownPreviewConfig): string {
        return `<style nonce="${nonce}">
			body {
				${config.fontFamily ? `font-family: ${config.fontFamily};` : ""}
				${isNaN(config.fontSize) ? "" : `font-size: ${config.fontSize}px;`}
				${isNaN(config.lineHeight) ? "" : `line-height: ${config.lineHeight};`}
			}
		</style>`;
    }

    private computeCustomStyleSheetIncludes(resource: Uri, config: MarkdownPreviewConfig): string {
        if (config.styles && Array.isArray(config.styles)) {
            return config.styles.map((style) => {
                return `<link rel="stylesheet" class="code-user-style" data-source="${style.replace(/"/g, "&quot;")}" href="${this.fixHref(resource, style)}" type="text/css" media="screen">`;
            }).join("\n");
        }
        return "";
    }

    private getMediaPath(mediaFile: string): string {
        return Uri.file(this.context.asAbsolutePath(path.join("media", mediaFile))).toString();
    }

    private getNodeModulePath(file: string): string {
        return Uri.file(this.context.asAbsolutePath(path.join("node_modules", file))).toString();
    }

    private fixLinks(document: string, resource: Uri): string {
        return document.replace(
            new RegExp("((?:src|href)=[\"\"])([^#]*?)([\"\"])", "gmi"), (subString: string, p1: string, p2: string, p3: string): string => {
                return [
                    p1,
                    this.fixHref(resource, p2, false),
                    p3,
                ].join("");
            },
        );
    }

    private fixHref(resource: Uri, href: string, basedOnWorkspace: boolean = true): string {
        if (!href) {
            return href;
        }

        // Use href if it is already an URL
        const hrefUri = Uri.parse(href);
        if (["file", "http", "https"].indexOf(hrefUri.scheme) >= 0) {
            return hrefUri.toString();
        }

        // Use href as file URI if it is absolute
        if (path.isAbsolute(href)) {
            return Uri.file(href).toString();
        }

        // use a workspace relative path if there is a workspace
        const root = workspace.getWorkspaceFolder(resource);
        if (root && basedOnWorkspace) {
            return Uri.file(path.join(root.uri.fsPath, href)).toString();
        }

        // otherwise look relative to the markdown file
        return href;
    }
}

export function isMarkdownFile(document: TextDocument) {
    return document.languageId === "markdown"
        && document.uri.scheme !== DocumentContentProvider.scheme; // prevent processing of own documents
}
