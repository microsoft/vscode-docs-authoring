import { existsSync } from "fs";
import { dirname, join, normalize, relative } from "path";
import { commands, QuickPickItem, QuickPickOptions, window } from "vscode";
import { checkExtension, noActiveEditorMessage } from "../helper/common";
import { sendTelemetryData } from "../helper/telemetry";
import { applyReplacements, findReplacements, IRegExpWithGroup, Replacements } from "../helper/utility";
import { Insert, insertURL, MediaType, selectLinkType } from "./media-controller";
import { applyXref } from "./xref-controller";

const linkRegex: IRegExpWithGroup = { expression: /\]\((?<path>[^http?].+?)\)/gm, group: "path" };
const telemetryCommand: string = "insertLink";
let commandOption: string;

export async function collapseRelativeLinks() {
    const editor = window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }

    const content = editor.document.getText();
    if (!content) {
        return;
    }

    const directory = dirname(editor.document.fileName);
    const tempReplacements = findReplacements(editor.document, content, null, linkRegex);
    const replacements: Replacements = [];
    if (tempReplacements) {
        for (let i = 0; i < tempReplacements.length; i++) {
            const replacement = tempReplacements[i];
            const absolutePath = join(directory, replacement.value);
            if (replacement && existsSync(absolutePath)) {
                const relativePath = relative(directory, absolutePath).replace(/\\/g, "/");
                if (relativePath !== replacement.value) {
                    replacements.push({
                        selection: replacement.selection,
                        value: relativePath,
                    });
                }
            }
        }
    }

    await applyReplacements(replacements, editor);
}

export function pickLinkType() {
    const opts: QuickPickOptions = { placeHolder: "Select an Link type" };
    const items: QuickPickItem[] = [];
    items.push({
        description: "",
        label: "$(file-symlink-directory) Link to file in repo",
    });
    items.push({
        description: "",
        label: "$(globe) Link to web page",
    });
    items.push({
        description: "",
        label: "$(link) Link to heading",
    });
    items.push({
        description: "",
        label: "$(x) Link to Xref",
    });

    if (checkExtension("blackmist.LinkCheckMD")) {
        items.push({
            description: "",
            label: "$(check) Generate a link report",
        });
    }

    window.showQuickPick(items, opts).then((selection) => {
        if (!selection) {
            return;
        }
        const selectionWithoutIcon = selection.label.toLowerCase().split(")")[1].trim();
        switch (selectionWithoutIcon) {
            case "link to file in repo":
                Insert(MediaType.Link);
                commandOption = "link to file in repo";
                break;
            case "link to web page":
                insertURL();
                commandOption = "link to web page";
                break;
            case "link to heading":
                selectLinkType();
                commandOption = "link to heading";
                break;
            case "link to xref":
                applyXref();
                commandOption = "link to Xref";
                break;
            case "generate a link report":
                runLinkChecker();
                commandOption = "generate a link report";
                break;
        }
        sendTelemetryData(telemetryCommand, commandOption);
    });
}

export function runLinkChecker() {
    commands.executeCommand("extension.generateLinkReport");
}
