"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const common_1 = require("../helper/common");
const media_controller_1 = require("./media-controller");
const xref_controller_1 = require("./xref-controller");
const telemetryCommand = "insertLink";
let commandOption;
function insertLinkCommand() {
    return [
        { command: pickLinkType.name, callback: pickLinkType },
        { command: media_controller_1.insertURL.name, callback: media_controller_1.insertURL },
    ];
}
exports.insertLinkCommand = insertLinkCommand;
function pickLinkType() {
    const opts = { placeHolder: "Select an Link type" };
    const items = [];
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
    if (common_1.checkExtension("blackmist.LinkCheckMD")) {
        items.push({
            description: "",
            label: "$(check) Generate a link report",
        });
    }
    vscode_1.window.showQuickPick(items, opts).then((selection) => {
        if (!selection) {
            return;
        }
        const selectionWithoutIcon = selection.label.toLowerCase().split(")")[1].trim();
        switch (selectionWithoutIcon) {
            case "link to file in repo":
                media_controller_1.Insert(media_controller_1.MediaType.Link);
                commandOption = "link to file in repo";
                break;
            case "link to web page":
                media_controller_1.insertURL();
                commandOption = "link to web page";
                break;
            case "link to heading":
                media_controller_1.selectLinkType();
                commandOption = "link to heading";
                break;
            case "link to xref":
                xref_controller_1.applyXref();
                commandOption = "link to Xref";
                break;
            case "generate a link report":
                runLinkChecker();
                commandOption = "generate a link report";
                break;
        }
        common_1.sendTelemetryData(telemetryCommand, commandOption);
    });
}
exports.pickLinkType = pickLinkType;
function runLinkChecker() {
    vscode_1.commands.executeCommand("extension.generateLinkReport");
}
exports.runLinkChecker = runLinkChecker;
//# sourceMappingURL=link-controller.js.map