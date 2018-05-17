"use strict";

import * as vscode from "vscode";
import { output } from "../extension";
import * as common from "../helper/common";
import * as log from "../helper/log";
import { insertAlert } from "./alert-controller";
import { formatBold } from "./bold-controller";
import { formatCode } from "./code-controller";
import { insertInclude } from "./include-controller";
import { formatItalic } from "./italic-controller";
import { insertBulletedList, insertNumberedList } from "./list-controller";
import { insertImage, insertVideo, selectLinkType } from "./media-controller";
import { previewTopic } from "./preview-controller";
import { insertSnippet } from "./snippet-controller";
import { insertTable } from "./table-controller";
import { applyTemplate } from "./template-controller";

export function quickPickMenuCommand() {
    const commands = [
        { command: markdownQuickPick.name, callback: markdownQuickPick },
    ];
    return commands;
}

export function markdownQuickPick() {
    log.telemetry(markdownQuickPick.name, "");
    const opts: vscode.QuickPickOptions = { placeHolder: "Which Markdown command would you like to run?" };
    const items: vscode.QuickPickItem[] = [];
    items.push(
        {
            description: "",
            label: "$(pencil) Bold",
        },
        {
            description: "",
            label: "$(info) Italic",
        },
        {
            description: "",
            label: "$(code) Code",
        },
        {
            description: "Insert note, tip, important, caution, or warning",
            label: "$(alert) Alert",
        },
        {
            description: "",
            label: "$(list-ordered) Numbered list",
        },
        {
            description: "",
            label: "$(list-unordered) Bulleted list",
        },
        {
            description: "",
            label: "$(diff-added) Table",
        },
        {
            description: "Insert internal or external link",
            label: "$(link) Link",
        },
        {
            description: "",
            label: "$(file-media) Image",
        },
        {
            description: "",
            label: "$(clippy) Include",
        },
        {
            description: "",
            label: "$(file-code) Snippets",
        },
        {
            description: "",
            label: "$(device-camera-video) Video",
        },
        {
            description: "",
            label: "$(browser) Preview",
        },
    );
    // check for active docs-article-templates extension.  if active, add to quickpick menu.
    try {
        if (vscode.extensions.getExtension("docsmsft.docs-article-templates").isActive === true) {
            items.push({
                description: "",
                label: "$(diff) Template",
            });
        }
    } catch (error) {
        common.generateTimestamp();
        output.appendLine(common.msTimeValue + " - The docs-article-templates extension is not installed.");
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
                formatBold();
                break;
            case "italic":
                formatItalic();
                break;
            case "code":
                formatCode();
                break;
            case "alert":
                insertAlert();
                break;
            case "numbered list":
                insertNumberedList();
                break;
            case "bulleted list":
                insertBulletedList();
                break;
            case "table":
                insertTable();
                break;
            case "link":
                selectLinkType();
                break;
            case "image":
                insertImage();
                break;
            case "include":
                insertInclude();
                break;
            case "snippets":
                insertSnippet();
                break;
            case "video":
                insertVideo();
                break;
            case "preview":
                previewTopic();
                break;
            case "template":
                applyTemplate();
                break;
            default:
                common.generateTimestamp();
                output.appendLine(common.msTimeValue + " - No quickpick case was hit.");
        }
    });
}
