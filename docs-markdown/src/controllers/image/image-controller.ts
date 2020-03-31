
import { CompletionItem, Position, QuickPickItem, QuickPickOptions, window, workspace } from "vscode";
import { sendTelemetryData } from "../../helper/telemetry";
import { applyComplex } from "./applyComplex";
import { applyIcon } from "./applyIcon";
import { applyImage } from "./applyImage";
import { applyLightbox } from "./applyLightbox";
import { applyLocScope } from "./applyLocScope";

const telemetryCommand: string = "insertImage";

export function insertImageCommand() {
    const commands = [
        { command: pickImageType.name, callback: pickImageType },
        { command: applyImage.name, callback: applyImage },
        { command: applyIcon.name, callback: applyIcon },
        { command: applyComplex.name, callback: applyComplex },
        { command: applyLocScope.name, callback: applyLocScope },
        { command: applyLightbox.name, callback: applyLightbox },
    ];
    return commands;
}
export function pickImageType() {
    let commandOption: string;
    const opts: QuickPickOptions = { placeHolder: "Select an Image type" };
    const items: QuickPickItem[] = [];
    const config = workspace.getConfiguration("markdown");
    const alwaysIncludeLocScope = config.get<boolean>("alwaysIncludeLocScope");

    items.push({
        description: "",
        label: "Image",
    });
    items.push({
        description: "",
        label: "Icon image",
    });
    items.push({
        description: "",
        label: "Complex image",
    });
    if (!alwaysIncludeLocScope) {
        items.push({
            description: "",
            label: "Add localization scope to image",
        });
    }
    items.push({
        description: "",
        label: "Add lightbox to image",
    });
    window.showQuickPick(items, opts).then((selection) => {
        if (!selection) {
            return;
        }
        switch (selection.label.toLowerCase()) {
            case "image":
                applyImage();
                commandOption = "image";
                break;
            case "image":
                applyImage();
                commandOption = "image (docs markdown)";
                break;
            case "icon image":
                applyIcon();
                commandOption = "icon";
                break;
            case "complex image":
                applyComplex();
                commandOption = "complex";
                break;
            case "add localization scope to image":
                applyLocScope();
                commandOption = "loc-scope";
                break;
            case "add lightbox to image":
                applyLightbox();
                commandOption = "lightbox";
                break;
        }
        sendTelemetryData(telemetryCommand, commandOption);
    });
}

export function imageKeyWordHasBeenTyped(editor: any) {
    const RE_IMAGE = /image/g;
    if (editor) {
        const position = new Position(editor.selection.active.line, editor.selection.active.character);
        const wordRange = editor.document.getWordRangeAtPosition(position, RE_IMAGE);
        if (wordRange) {
            return true;
        }
    }
}
export function imageCompletionProvider() {
    const completionItems: CompletionItem[] = [];
    completionItems.push(new CompletionItem(`:::image type="content" source="" alt-text="" loc-scope="":::`));
    completionItems.push(new CompletionItem(`:::image type="icon" source="" alt-text="" loc-scope="":::`));
    completionItems.push(new CompletionItem(`:::image type="complex" source="" alt-text="" loc-scope="":::`));
    return completionItems;
}
