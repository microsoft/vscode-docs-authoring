import { existsSync } from "fs";
import { dirname, join, relative } from "path";
import { commands, ProgressLocation, QuickPickItem, QuickPickOptions, RelativePattern, Uri, window, workspace, TextEditor } from "vscode";
import { checkExtension, noActiveEditorMessage } from "../helper/common";
import { sendTelemetryData } from "../helper/telemetry";
import { applyReplacements, findReplacements, IRegExpWithGroup, Replacements } from "../helper/utility";
import { ICommand } from "../ICommand";
import { Insert, insertURL, MediaType, selectLinkType } from "./media-controller";
import { applyXref } from "./xref-controller";

export const linkControllerCommands: ICommand[] = [
    {
        callback: collapseRelativeLinks,
        command: collapseRelativeLinks.name,
    },
    {
        callback: collapseRelativeLinksInFolder,
        command: collapseRelativeLinksInFolder.name,
    },
];

const linkRegex: IRegExpWithGroup = {
    expression: /\]\((?<path>[^http?|~].+?)(?<query>\?.+?)?(?<hash>#.+?)?\)/gm,
    groups: ["path", "query", "hash"],
};
const telemetryCommand: string = "insertLink";
let commandOption: string;

async function collapseRelativeLinksInFolder(uri: Uri) {
    await window.withProgress({
        location: ProgressLocation.Window,
    }, async (progress) => {
        const filePaths =
            await workspace.findFiles(
                new RelativePattern(uri.path, "**/*.md"));

        const length = filePaths.length;
        progress.report({ increment: 1, message: `Collapsing links in ${length} files.` });
        for (let i = 0; i < length; i++) {
            const file = filePaths[i];
            const document = await workspace.openTextDocument(file);
            const editor = await window.showTextDocument(document, undefined, false);
            await collapseRelativeLinksForEditor(editor);
            progress.report({ increment: 1 });
        }

        progress.report({ increment: 100, message: `Collapsed links in ${length} files.` });
    });
}

async function collapseRelativeLinks() {
    await collapseRelativeLinksForEditor(window.activeTextEditor);
}

async function collapseRelativeLinksForEditor(editor: TextEditor) {
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
