import { QuickPickItem, QuickPickOptions, window, commands } from "vscode";
import { sendTelemetryData, checkExtension } from "../helper/common";
import { insertImage, insertURL, selectLinkType } from "./media-controller";
import { applyXref } from "./xref-controller";

const telemetryCommand: string = "insertLink";
let commandOption: string;

export function insertLinkCommand() {
    const commands = [
        { command: pickLinkType.name, callback: pickLinkType },
        { command: insertURL.name, callback: insertURL },
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
        label: "$(link) Link to heading",
    });
    items.push({
        description: "",
        label: "$(x) Link to Xref",
    });

    if (checkExtension("blackmist.LinkCheckMD")) {
        items.push({
            description: "",
            label: "$(check) Check links",
        });
    }

    window.showQuickPick(items, opts).then((selection) => {
        if (!selection) {
            return;
        }
        switch (selection.label.toLowerCase()) {
            case "link to file in repo":
                insertImage();
                commandOption = "link to file in repo";
                break;
            case "Link to web page":
                insertURL();
                commandOption = "Link to web page";
                break;
            case "link to heading":
                selectLinkType();
                commandOption = "link to heading";
                break;
            case "link to Xref":
                applyXref();
                commandOption = "link to Xref";
                break;
            case "check links":
                runLinkChecker();
                commandOption = "check links";
                break;
        }
        sendTelemetryData(telemetryCommand, commandOption);
    });
}

export function runLinkChecker() {
    commands.executeCommand("extension.generateLinkReport");
}