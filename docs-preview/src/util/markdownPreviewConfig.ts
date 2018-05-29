import * as vscode from "vscode";

export default class MarkdownPreviewConfig {
    public static getConfigForResource(resource: vscode.Uri) {
        return new MarkdownPreviewConfig(resource);
    }

    public readonly scrollBeyondLastLine: boolean;
    public readonly wordWrap: boolean;
    public readonly previewFrontMatter: string;
    public readonly lineBreaks: boolean;
    public readonly doubleClickToSwitchToEditor: boolean;
    public readonly scrollEditorWithPreview: boolean;
    public readonly scrollPreviewWithEditorSelection: boolean;
    public readonly markEditorSelection: boolean;

    public readonly lineHeight: number;
    public readonly fontSize: number;
    public readonly fontFamily: string | undefined;
    public readonly styles: string[];

    private constructor(resource: vscode.Uri) {
        const editorConfig = vscode.workspace.getConfiguration("editor", resource);
        const markdownConfig = vscode.workspace.getConfiguration("markdown", resource);
        const markdownEditorConfig = vscode.workspace.getConfiguration("[markdown]");

        this.scrollBeyondLastLine = editorConfig.get<boolean>("scrollBeyondLastLine", false);

        this.wordWrap = editorConfig.get<string>("wordWrap", "off") !== "off";
        if (markdownEditorConfig && markdownEditorConfig["editor.wordWrap"]) {
            this.wordWrap = markdownEditorConfig["editor.wordWrap"] !== "off";
        }

        this.previewFrontMatter = markdownConfig.get<string>("previewFrontMatter", "hide");
        this.scrollPreviewWithEditorSelection = !!markdownConfig.get<boolean>("preview.scrollPreviewWithEditorSelection", true);
        this.scrollEditorWithPreview = !!markdownConfig.get<boolean>("preview.scrollEditorWithPreview", true);
        this.lineBreaks = !!markdownConfig.get<boolean>("preview.breaks", false);
        this.doubleClickToSwitchToEditor = !!markdownConfig.get<boolean>("preview.doubleClickToSwitchToEditor", true);
        this.markEditorSelection = !!markdownConfig.get<boolean>("preview.markEditorSelection", true);

        this.fontFamily = markdownConfig.get<string | undefined>("preview.fontFamily", undefined);
        this.fontSize = Math.max(8, +markdownConfig.get<number>("preview.fontSize", NaN));
        this.lineHeight = Math.max(0.6, +markdownConfig.get<number>("preview.lineHeight", NaN));

        this.styles = markdownConfig.get<string[]>("styles", []);
    }

    public isEqualTo(otherConfig: MarkdownPreviewConfig) {
        for (const key in this) {
            if (this.hasOwnProperty(key) && key !== "styles") {
                if (this[key] !== otherConfig[key]) {
                    return false;
                }
            }
        }

        // Check styles
        if (this.styles.length !== otherConfig.styles.length) {
            return false;
        }
        for (let i = 0; i < this.styles.length; ++i) {
            if (this.styles[i] !== otherConfig.styles[i]) {
                return false;
            }
        }

        return true;
    }

    [key: string]: any;
}
