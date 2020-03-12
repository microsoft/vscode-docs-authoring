import { existsSync } from "fs";
// const moment = require("moment");
import * as moment from "moment";
// const os = require("os");
import * as os from "os";
import { basename, dirname, join, relative } from "path";
import {
    Event,
    EventEmitter,
    ExtensionContext,
    TextDocumentContentProvider,
    Uri,
    window,
    workspace,
} from "vscode";
import { getFirstParagraph, getPath, parseMarkdownMetadata, parseYamlMetadata } from "../helper/seoHelpers";

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
                    return this.buildHtmlFromContent(content, basename(document.fileName), dirname(document.fileName));
                }

                const basePath = dirname(document.fileName);
                let docsetRoot = this.getDocsetRoot(basePath) || workspaceRoot;
                let filePath = relative(docsetRoot, document.fileName);
                if (os.type() === "Windows_NT") {
                    docsetRoot = docsetRoot.replace(/\\/g, "/");
                    filePath = filePath.replace(/\\/g, "/");
                }
                return this.buildHtmlFromContent(content, filePath, docsetRoot);
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

    private buildHtmlFromContent(content: string, filePath: string, basePath: string): string {
        const body = this.parseFileIntoSEOHtml(content, filePath, basePath);

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

    private parseFileIntoSEOHtml(content, filePath, basePath) {
        const breadCrumbPath = getPath(basePath, filePath);
        if (filePath.endsWith(".md")) {
            return this.markdownMetadataIntoSEOHtml(content, breadCrumbPath);
        } else if (filePath.endsWith(".yml") || filePath.endsWith(".yaml")) {
            return this.ymlMetadataIntoSEOHtml(content, breadCrumbPath);
        } else {
            return "<div>Unable to read file metadata</div>";
        }
    }

    private ymlMetadataIntoSEOHtml(content: string, breadCrumbPath: string) {
        const { title, description } = parseYamlMetadata(content);
        return `<div class="search-result">
                    <div class="header">
                        <div class="breadcrumbs">${breadCrumbPath}<span class="down-arrow"></span></div>
                        <div><a href="#" class="title"><h3>${title}</h3></a></div>
                    </div>
                    <div>
                        <p class="description">
                            ${this.setDescriptionHtml(description, content)}
                        </p>
                    </div>;
                </div>`;
    }

    private markdownMetadataIntoSEOHtml(markdown: string, breadCrumbPath: string) {
        const metadataMatch = markdown.match(metadataRegex);
        if (metadataMatch) {
            const { title, description, date } = parseMarkdownMetadata(metadataMatch[2]);
            return `<div class="search-result">
                        <div class="header">
                            <div class="breadcrumbs">${breadCrumbPath}<span class="down-arrow"></span></div>
                            <div><a href="#" class="title"><h3>${title}</h3></a></div>
                        </div>
                        <div>
                            <p class="description">${this.setDateHtml(date)}
                            ${this.setDescriptionHtml(description, markdown)}
                            </p>
                        </div>;
                    </div>`;
        } else {
            return "<div>Unable to read file metadata</div>";
        }
    }

    private setDescriptionHtml(description: string, markdown: any) {
        if (!description) {
            description = getFirstParagraph(markdown);
        }
        return description;
    }

    private setDateHtml(date: string) {
        if (date) {
            date = moment(new Date(date)).format("ll");
            return `<span class="date">${date} - </span>`;
        } else {
            return "";
        }
    }

    private getDocsetRoot(dir: string): string {
        if (dir && dirname(dir) !== dir) {
            const config = join(dir, "docfx.json");
            if (existsSync(config)) {
                return dir;
            }

            return this.getDocsetRoot(dirname(dir));
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
