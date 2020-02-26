"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode = require("vscode");
const extension_1 = require("../extension");
const common_1 = require("../helper/common");
const alert_controller_1 = require("./alert-controller");
const bold_controller_1 = require("./bold-controller");
const cleanup_controller_1 = require("./cleanup/cleanup-controller");
const code_controller_1 = require("./code-controller");
const image_controller_1 = require("./image-controller");
const include_controller_1 = require("./include-controller");
const italic_controller_1 = require("./italic-controller");
const list_controller_1 = require("./list-controller");
const media_controller_1 = require("./media-controller");
const no_loc_controller_1 = require("./no-loc-controller");
const preview_controller_1 = require("./preview-controller");
const row_columns_controller_1 = require("./row-columns-controller");
const snippet_controller_1 = require("./snippet-controller");
const table_controller_1 = require("./table-controller");
const template_controller_1 = require("./template-controller");
const xref_controller_1 = require("./xref-controller");
const yaml_controller_1 = require("./yaml-controller");
const link_controller_1 = require("./link-controller");
function quickPickMenuCommand() {
    const commands = [
        { command: markdownQuickPick.name, callback: markdownQuickPick },
    ];
    return commands;
}
exports.quickPickMenuCommand = quickPickMenuCommand;
function markdownQuickPick() {
    const opts = { placeHolder: "Which command would you like to run?" };
    const markdownItems = [];
    const yamlItems = [];
    let items = [];
    const activeTextDocument = vscode.window.activeTextEditor;
    if (common_1.checkExtension("docsmsft.docs-preview")) {
        markdownItems.push({
            description: "",
            label: "$(browser) Preview",
        });
    }
    markdownItems.push({
        description: "",
        label: "$(pencil) Bold",
    }, {
        description: "",
        label: "$(info) Italic",
    }, {
        description: "",
        label: "$(code) Code",
    }, {
        description: "Insert note, tip, important, caution, or warning",
        label: "$(alert) Alert",
    }, {
        description: "",
        label: "$(list-ordered) Numbered list",
    }, {
        description: "",
        label: "$(list-unordered) Bulleted list",
    }, {
        description: "",
        label: "$(diff-added) Table",
    }, {
        description: "",
        label: "$(ellipsis) Columns",
    }, {
        description: "",
        label: "$(link) Link",
    }, {
        description: "",
        label: "$(lock) Non-localizable text",
    }, {
        description: "",
        label: "$(file-media) Image",
    }, {
        description: "",
        label: "$(clippy) Include",
    }, {
        description: "",
        label: "$(file-code) Snippet",
    }, {
        description: "",
        label: "$(device-camera-video) Video",
    }, {
        description: "",
        label: "$(tasklist) Cleanup...",
    });
    // push commands marked for preview (beta)
    // add description and label to this section for preview features. Example below:
    // {
    //    description: "Beta preview",
    //    label: "$(tasklist) Cleanup...",
    // }
    const previewSetting = vscode.workspace.getConfiguration("markdown").previewFeatures;
    if (previewSetting == true) {
    }
    if (common_1.checkExtension("docsmsft.docs-article-templates")) {
        markdownItems.push({
            description: "",
            label: "$(diff) Template",
        });
    }
    yamlItems.push({
        description: "",
        label: "$(note) TOC entry",
    }, {
        description: "",
        label: "$(note) TOC entry with optional attributes",
    }, {
        description: "",
        label: "$(note) Parent node",
    }, {
        description: "",
        label: "$(link) Insert link",
    }, {
        description: "",
        label: "$(lock) Non-localizable text",
    });
    if (activeTextDocument) {
        const activeDocumentLanguage = activeTextDocument.document.languageId;
        switch (activeDocumentLanguage) {
            case "markdown":
                items = markdownItems;
                break;
            case "yaml":
                items = yamlItems;
                break;
        }
    }
    vscode.window.showQuickPick(items, opts).then((selection) => {
        if (!selection) {
            return;
        }
        if (!vscode.window.activeTextEditor) {
            vscode.window.showInformationMessage("Open a file first to manipulate text selections");
            return;
        }
        const convertLabelToLowerCase = selection.label.toLowerCase();
        const selectionWithoutIcon = convertLabelToLowerCase.split(")")[1].trim();
        switch (selectionWithoutIcon) {
            case "bold":
                bold_controller_1.formatBold();
                break;
            case "italic":
                italic_controller_1.formatItalic();
                break;
            case "code":
                code_controller_1.formatCode();
                break;
            case "alert":
                alert_controller_1.insertAlert();
                break;
            case "numbered list":
                list_controller_1.insertNumberedList();
                break;
            case "bulleted list":
                list_controller_1.insertBulletedList();
                break;
            case "table":
                table_controller_1.insertTable();
                break;
            case "link":
                link_controller_1.pickLinkType();
                break;
            case "non-localizable text":
                no_loc_controller_1.noLocText();
                break;
            case "image":
                image_controller_1.pickImageType();
                break;
            case "include":
                include_controller_1.insertInclude();
                break;
            case "snippet":
                snippet_controller_1.insertSnippet();
                break;
            case "video":
                media_controller_1.insertVideo();
                break;
            case "preview":
                preview_controller_1.previewTopic();
                break;
            case "template":
                template_controller_1.applyTemplate();
                break;
            case "cleanup...":
                cleanup_controller_1.applyCleanup();
                break;
            case "link to xref":
                xref_controller_1.applyXref();
                break;
            case "toc entry":
                yaml_controller_1.insertTocEntry();
                break;
            case "toc entry with optional attributes":
                yaml_controller_1.insertTocEntryWithOptions();
                break;
            case "parent node":
                yaml_controller_1.insertExpandableParentNode();
                break;
            case "insert link":
                media_controller_1.insertLink();
                break;
            case "columns":
                row_columns_controller_1.insertRowsAndColumns();
                break;
            default:
                const { msTimeValue } = common_1.generateTimestamp();
                extension_1.output.appendLine(msTimeValue + " - No quickpick case was hit.");
        }
    });
}
exports.markdownQuickPick = markdownQuickPick;
//# sourceMappingURL=quick-pick-menu-controller.js.map