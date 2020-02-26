"use strict";
"use-strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const common = require("../helper/common");
const log = require("./log");
class UiHelper {
    LoadToolbar() {
        // toolbar only renders if markdown.showToolbar is true in user settings
        if (vscode.workspace.getConfiguration("markdown").showToolbar) {
            try {
                this.uiMessage();
                log.debug("Loaded UI Message Text");
                if (common.checkExtension("docsmsft.docs-article-templates")) {
                    this.uiTemplate();
                    log.debug("Loaded UI Apply Template");
                    this.uiCleanup();
                    log.debug("Loaded UI Apply Cleanup");
                }
                this.uiBold();
                log.debug("Loaded UI Format Bold");
                this.uiItalic();
                log.debug("Loaded UI Format Italic");
                this.uiCode();
                log.debug("Loaded UI Format Code");
                this.uiAlert();
                log.debug("Loaded UI Insert Alert");
                this.uiNumberedList();
                log.debug("Loaded UI Insert Numbered List");
                this.uiBulletedList();
                log.debug("Loaded UI Insert Bulleted List");
                this.uiNewTable();
                log.debug("Loaded UI New Table");
                this.uiLink();
                log.debug("Loaded UI Insert Link");
                this.uiImage();
                log.debug("Loaded UI Insert Image");
                this.uiInclude();
                log.debug("Loaded UI Insert Include");
                this.uiSnippet();
                log.debug("Loaded UI Insert Snippet");
                // this returns false until an activation event is initiated.
                if (!common.checkExtension("docsmsft.docs-preview")) {
                    this.uiPreview();
                    log.debug("Loaded UI Insert Preview");
                }
            }
            catch (error) {
                log.error("Failed to load UI: " + error);
            }
        }
    }
    uiMessage() {
        let statusBarItem;
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.text = "Docs Markdown";
        statusBarItem.color = "white";
        statusBarItem.tooltip = "Show quick pick (Alt + M / Option + M)";
        statusBarItem.show();
        statusBarItem.command = "markdownQuickPick";
    }
    uiLink() {
        let statusBarItem;
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.text = "$(link)";
        statusBarItem.color = "white";
        statusBarItem.tooltip = "Insert Link";
        statusBarItem.show();
        statusBarItem.command = "selectLinkTypeToolbar";
    }
    uiImage() {
        let statusBarItem;
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.text = "$(file-media)";
        statusBarItem.color = "white";
        statusBarItem.tooltip = "Insert Image";
        statusBarItem.show();
        statusBarItem.command = "insertImage";
    }
    uiInclude() {
        let statusBarItem;
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.text = "$(clippy)";
        statusBarItem.color = "white";
        statusBarItem.tooltip = "Insert Include";
        statusBarItem.show();
        statusBarItem.command = "insertInclude";
    }
    uiSnippet() {
        let statusBarItem;
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.text = "$(file-code)";
        statusBarItem.color = "white";
        statusBarItem.tooltip = "Insert Snippet";
        statusBarItem.show();
        statusBarItem.command = "insertSnippet";
    }
    uiBold() {
        let statusBarItem;
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.text = "B";
        statusBarItem.color = "white";
        statusBarItem.tooltip = "Bold";
        statusBarItem.show();
        statusBarItem.command = "formatBold";
    }
    uiItalic() {
        let statusBarItem;
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.text = "i";
        statusBarItem.color = "white";
        statusBarItem.tooltip = "Italic";
        statusBarItem.show();
        statusBarItem.command = "formatItalic";
    }
    uiCode() {
        let statusBarItem;
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.text = "$(code)";
        statusBarItem.color = "white";
        statusBarItem.tooltip = "Code";
        statusBarItem.show();
        statusBarItem.command = "formatCode";
    }
    uiAlert() {
        let statusBarItem;
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.text = "$(alert)";
        statusBarItem.color = "white";
        statusBarItem.tooltip = "Alert";
        statusBarItem.show();
        statusBarItem.command = "insertAlert";
    }
    uiNewTable() {
        let statusBarItem;
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.text = "$(diff-added)";
        statusBarItem.color = "white";
        statusBarItem.tooltip = "Insert Table";
        statusBarItem.show();
        statusBarItem.command = "insertTable";
    }
    uiNumberedList() {
        let statusBarItem;
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.text = "$(list-ordered)";
        statusBarItem.color = "white";
        statusBarItem.tooltip = "Numbered List";
        statusBarItem.show();
        statusBarItem.command = "insertNumberedList";
    }
    uiBulletedList() {
        let statusBarItem;
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.text = "$(list-unordered)";
        statusBarItem.color = "white";
        statusBarItem.tooltip = "Bulleted List";
        statusBarItem.show();
        statusBarItem.command = "insertBulletedList";
    }
    uiPreview() {
        let statusBarItem;
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.text = "$(browser)";
        statusBarItem.color = "white";
        statusBarItem.tooltip = "Preview";
        statusBarItem.show();
        statusBarItem.command = "previewTopic";
    }
    uiTemplate() {
        let statusBarItem;
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.text = "$(file-text)";
        statusBarItem.color = "white";
        statusBarItem.tooltip = "Template";
        statusBarItem.show();
        statusBarItem.command = "applyTemplate";
    }
    uiCleanup() {
        let statusBarItem;
        statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);
        statusBarItem.text = "$(tasklist)";
        statusBarItem.color = "white";
        statusBarItem.tooltip = "Cleanup...";
        statusBarItem.show();
        statusBarItem.command = "applyCleanup";
    }
}
exports.UiHelper = UiHelper;
//# sourceMappingURL=ui.js.map