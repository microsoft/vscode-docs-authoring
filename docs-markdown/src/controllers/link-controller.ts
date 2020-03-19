import { commands, QuickPickItem, QuickPickOptions, window } from "vscode";
import { checkExtension } from "../helper/common";
import { sendTelemetryData } from "../helper/telemetry";
import { Insert, insertURL, MediaType, selectLinkType } from "./media-controller";
import { applyXref } from "./xref-controller";

const telemetryCommand: string = "insertLink";
let commandOption: string;

export function insertLinkCommand() {
    return [
        { command: pickLinkType.name, callback: pickLinkType },
        { command: insertURL.name, callback: insertURL },
    ];
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
