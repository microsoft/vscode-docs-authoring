import * as fs from "fs";
import * as path from "path";
import {
    Event,
    EventEmitter,
    ExtensionContext,
    TextDocumentContentProvider,
    Uri,
    window,
    workspace,
} from "vscode";
import { getFirstParagraph, parseMetadata, getPath } from "../helper/seoHelpers";
import SEOPreviewConfig from "./seoPreviewConfig";
const moment = require('moment');
const os = require("os");

const metadataRegex = new RegExp(`^(---)([^>]+?)(---)$`, "m");

export class DocumentContentProvider implements TextDocumentContentProvider {
    public static readonly scheme = "docsPreview";
    private sourceUri: Uri;
    private onDidChangeEvent = new EventEmitter<Uri>();
    private waiting = false;
    private context: ExtensionContext;

    constructor(context: ExtensionContext) {
        this.context = context;
    }

    public provideTextDocumentContent(): Thenable<string> {
        const editor = window.activeTextEditor;
        this.sourceUri = editor.document.uri;

        const workspaceRoot = workspace.rootPath;

        return workspace.openTextDocument(this.sourceUri)
            .then((document) => {
                const content = document.getText();

                if (!workspaceRoot) {
                    return this.getHtmlFromMarkdown(content, path.basename(document.fileName), path.dirname(document.fileName));
                }

                const basePath = path.dirname(document.fileName);
                let docsetRoot = this.getDocsetRoot(basePath) || workspaceRoot;
                let filePath = path.relative(docsetRoot, document.fileName);
                if (os.type() === "Windows_NT") {
                    docsetRoot = docsetRoot.replace(/\\/g, "/");
                    filePath = filePath.replace(/\\/g, "/");
                }
                return this.getHtmlFromMarkdown(content, filePath, docsetRoot);
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

    private getHtmlFromMarkdown(markdown: string, filePath: string, basePath: string): string {
        const body = this.parseFileIntoSEOHtml(markdown, filePath, basePath);

        return `<!DOCTYPE html>
        <html>
        <head>
            <meta http-equiv="Content-type" content="text/html;charset=UTF-8">
            ${this.getStyles()}
        </head>
        <body>
            ${body}
        </body>
        </html>`;
    }

    private parseFileIntoSEOHtml(markdown, filePath, basePath) {
        const breadCrumbPath = getPath(basePath, filePath);
        if (filePath.endsWith(".md")) {
            return this.markdownMetadataIntoSEOHtml(markdown, breadCrumbPath);
        } else if (filePath.endsWith(".yml") || filePath.endsWith(".yaml")) {
            return this.ymlMetadataIntoSEOHtml(markdown, breadCrumbPath);
        } else {
            return "<div>Unable to read file metadata</div>";
        }
    }

    private ymlMetadataIntoSEOHtml(markdown: any, path: string) {
        return "";
    }

    private markdownMetadataIntoSEOHtml(markdown: any, path: string) {
        const metadataMatch = markdown.match(metadataRegex);
        if (metadataMatch) {
            const { title, description, date } = parseMetadata(metadataMatch[2]);
            return `<div class="search-result">
                        <div class="header">
                            <div class="breadcrumbs">${path}<span class="down-arrow"></span></div>
                            <div><a href="#" class="title"><h3>${title}</h3></a></div>
                        </div>
                        ${this.setDateHtml(date)}
                        ${this.setDescriptionHtml(description, markdown)};
                    </div>`;
        } else {
            return "<div>Unable to read file metadata</div>";
        }
    }

    private setDescriptionHtml(description: string, markdown: any) {
        if (!description) {
            description = getFirstParagraph(markdown);
        }
        return `${description}</p></div>`;
    }

    private setDateHtml(date: string) {
        if (date) {
            date = moment(new Date(date)).format("ll");
            return `<div><p class="description"><span class="date">${date} - </span>`;
        } else {
            return `<div><p class="description">`;
        }
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

    private getStyles(): string {
        return `<style>
			body {
                margin-top: 20px;
                background-color: #fff;
                font-size: 14px;
                font-family: arial,sans-serif;
            }
            .date {
                color:rgb(112, 117, 122);
            }
            .breadcrumbs { 
                color: #3C4043;
                font-size: 14px;
                line-height: 1.3;
                padding-bottom: 1px;
                padding-top: 1px;
                line-height: 1.57;
            }
            a.title > h3 {
                font-size: 20px;
                line-height: 1.3;
                font-weight: normal;
                margin: 0;
                padding: 0;
                color: #1a0dab;
                padding-top: 2px;
                margin-bottom: 3px;
            }
            a {
                text-decoration: none;
            }
            .description {
                color: #3C4043;
                margin:0;
            }
            .search-result {
                width: 600px;
                line-height: 1.57;
            }
            .header {
                line-height: 1.57;
            }
            .down-arrow {
                border-color: #3C4043 transparent;
                border-style: solid;
                border-width: 5px 4px 0 4px;
                width: 0;
                height: 0;
                position: relative;
                bottom: -11px;
                left: 6px;
            }
		</style>`;
    }
}
