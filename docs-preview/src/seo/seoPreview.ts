import { existsSync } from "fs";
import * as moment from "moment";
import * as os from "os";
import { basename, dirname, join, relative } from "path";
import {
    TextDocumentContentProvider,
    Uri,
    window,
    workspace,
} from "vscode";
import { getPath, parseMarkdownMetadata, parseYamlMetadata } from "./seoHelpers";

const metadataRegex = new RegExp(`^(---)([^]+?)(---)$`, "m");

export class DocumentContentProvider implements TextDocumentContentProvider {
    public static readonly scheme = "seoPreview";
    private sourceUri: Uri;
    public provideTextDocumentContent(): Thenable<string> {
        const editor = window.activeTextEditor;
        this.sourceUri = editor.document.uri;

        const workspaceRoot = workspace.rootPath;

        return workspace.openTextDocument(this.sourceUri)
            .then(async (document) => {
                const content = document.getText();

                if (!workspaceRoot) {
                    return await this.buildHtmlFromContent(content, basename(document.fileName), dirname(document.fileName));
                }

                const basePath = dirname(document.fileName);
                let docsetRoot = this.getDocsetRoot(basePath) || workspaceRoot;
                let filePath = relative(docsetRoot, document.fileName);
                if (os.type() === "Windows_NT") {
                    docsetRoot = docsetRoot.replace(/\\/g, "/");
                    filePath = filePath.replace(/\\/g, "/");
                }
                return await this.buildHtmlFromContent(content, filePath, docsetRoot);
            });
    }

    private async buildHtmlFromContent(content: string, filePath: string, basePath: string): Promise<string> {
        const body = await this.parseFileIntoSEOHtml(content, filePath, basePath);

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

    private async parseFileIntoSEOHtml(content, filePath, basePath) {
        const breadCrumbPath = getPath(basePath, filePath);
        if (filePath.endsWith(".md")) {
            return await this.markdownMetadataIntoSEOHtml(content, breadCrumbPath, basePath, filePath);
        } else if (filePath.endsWith(".yml") || filePath.endsWith(".yaml")) {
            return await this.ymlMetadataIntoSEOHtml(content, breadCrumbPath, basePath, filePath);
        } else {
            return "<div>Unable to read file metadata</div>";
        }
    }

    private async ymlMetadataIntoSEOHtml(content: string, breadCrumbPath: string, basePath, filePath) {
        const { title, description } = await parseYamlMetadata(content, breadCrumbPath, basePath, filePath);
        return `<div class="search-result">
                    <div class="header">
                        <div class="breadcrumbs">${breadCrumbPath}<span class="down-arrow"></span></div>
                        <div><a href="#" class="title"><h3>${title}</h3></a></div>
                    </div>
                    <div>
                        <p class="description">
                            ${description}
                        </p>
                    </div>
                </div>`;
    }

    private async markdownMetadataIntoSEOHtml(markdown: string, breadCrumbPath: string, basePath, filePath) {
        const metadataMatch = markdown.match(metadataRegex);
        if (metadataMatch) {
            const { title, description, date } = await parseMarkdownMetadata(metadataMatch[2], markdown, basePath, filePath);
            return `<div class="search-result">
                        <div class="header">
                            <div class="breadcrumbs">${breadCrumbPath}<span class="down-arrow"></span></div>
                            <div><a href="#" class="title"><h3>${title}</h3></a></div>
                        </div>
                        <div>
                            <p class="description">${this.setDateHtml(date)}
                                ${description}
                            </p>
                        </div>
                    </div>`;
        } else {
            return "<div>Unable to read file metadata</div>";
        }
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
                font-family: 'Roboto',arial,sans-serif;
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
                white-space: nowrap;
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
                white-space: nowrap;
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
