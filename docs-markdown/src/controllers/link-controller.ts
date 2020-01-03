import { commands, QuickPickItem, QuickPickOptions, window } from "vscode";
import { checkExtension, sendTelemetryData } from "../helper/common";
import { Insert, insertExternalURL, insertURL, selectLinkType } from "./media-controller";
import { applyXref } from "./xref-controller";

const telemetryCommand: string = "insertLink";

export function insertLinkCommand() {
    const commands = [
        { command: pickLinkType.name, callback: pickLinkType },
        { command: insertURL.name, callback: insertURL },
        { command: insertExternalURL.name, callback: insertExternalURL },
    ];
    return commands;
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
        label: "$(link-external) Link to external web page (opens in new tab)",
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
                Insert(false);
                break;
            case "link to web page":
                insertURL();
                break;
            case "link to external web page (opens in new tab)":
                insertExternalURL();
                break;
            case "link to heading":
                selectLinkType();
                break;
            case "link to xref":
                applyXref();
                break;
            case "generate a link report":
                runLinkChecker();
                break;
        }
        sendTelemetryData(telemetryCommand, selectionWithoutIcon);
    });
}

export function runLinkChecker() {
    commands.executeCommand("extension.generateLinkReport");
}
