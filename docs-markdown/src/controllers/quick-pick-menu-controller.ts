"use strict";

import * as vscode from "vscode";
import { output } from "../extension";
import { checkExtension, generateTimestamp } from "../helper/common";
import { insertAlert } from "./alert-controller";
import { formatBold } from "./bold-controller";
import { applyCleanup } from "./cleanup-controller";
import { formatCode } from "./code-controller";
import { insertInclude } from "./include-controller";
import { formatItalic } from "./italic-controller";
import { insertBulletedList, insertNumberedList } from "./list-controller";
import { Insert, insertImage, insertURL, insertVideo, selectLinkType } from "./media-controller";
import { previewTopic } from "./preview-controller";
import { insertSnippet } from "./snippet-controller";
import { insertTable } from "./table-controller";
import { applyTemplate } from "./template-controller";
import { applyXref } from "./xref-controller";

export function quickPickMenuCommand() {
    const commands = [
        { command: markdownQuickPick.name, callback: markdownQuickPick },
    ];
    return commands;
}

export function markdownQuickPick() {
    const opts: vscode.QuickPickOptions = { placeHolder: "Which Markdown command would you like to run?" };
    const items: vscode.QuickPickItem[] = [];

    if (checkExtension("docsmsft.docs-preview")) {
        items.push({
            description: "",
            label: "$(browser) Preview",
        });
    }

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
            description: "",
            label: "$(file-symlink-directory) Link to file in repo",
        },
        {
            description: "",
            label: "$(globe) Link to web page",
        },
        {
            description: "",
            label: "$(link) Link to heading",
        },
        {
            description: "",
            label: "$(x) Link to XREF",
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
            label: "$(file-code) Snippet",
        },
        {
            description: "",
            label: "$(device-camera-video) Video",
        },
        {
            description: "",
            label: "$(tasklist) Cleanup...",
        }
    );

    if (checkExtension("docsmsft.docs-article-templates")) {
        items.push({
            description: "",
            label: "$(diff) Template",
        });
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
            case "link to file in repo":
                Insert(false);
                break;
            case "link to web page":
                insertURL();
                break;
            case "link to heading":
                selectLinkType();
                break;
            case "image":
                insertImage();
                break;
            case "include":
                insertInclude();
                break;
            case "snippet":
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
            case "cleanup...":
                applyCleanup();
                break;
            case "link to xref":
                applyXref();
                break;
            default:
                const { msTimeValue } = generateTimestamp();
                output.appendLine(msTimeValue + " - No quickpick case was hit.");
        }
    });
}
