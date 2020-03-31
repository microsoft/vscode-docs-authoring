import { Position, QuickPickItem, window, workspace } from "vscode";
import { noActiveEditorMessage } from "../../helper/common";
import { imageExtensions } from "../media-controller";
const path = require("path");
const dir = require("node-dir");
export async function applyLightbox() {
    // get editor, its needed to apply the output to editor window.
    const editor = window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }
    // if user has not selected any text, then continue
    const RE_LIGHTBOX = /:::image\s+((source|type|alt-text|loc-scope|border)="([a-zA-Z0-9_.\/ -]+)"\s*)+:::/gm;
    const position = new Position(editor.selection.active.line, editor.selection.active.character);
    // get the current editor position and check if user is inside :::image::: tags
    const wordRange = editor.document.getWordRangeAtPosition(position, RE_LIGHTBOX);
    if (wordRange) {
        let folderPath = "";
        if (workspace.workspaceFolders) {
            folderPath = workspace.workspaceFolders[0].uri.fsPath;
        }
        // get available files
        dir.files(folderPath, async (err: any, files: any) => {
            if (err) {
                window.showErrorMessage(err);
            }
            const items: QuickPickItem[] = [];
            files.sort();
            files.filter((file: any) => imageExtensions.indexOf(path.extname(file.toLowerCase())) !== -1).forEach((file: any) => {
                items.push({ label: path.basename(file), description: path.dirname(file) });
            });
            // show quickpick to user available images.
            const image = await window.showQuickPick(items, { placeHolder: "Select Image from repo" });
            if (!image) {
                // if user did not select source image then exit.
                return;
            } else {
                // insert lightbox into editor
                const activeFileDir = path.dirname(editor.document.fileName);
                const imagePath = path.relative(activeFileDir, path.join(image.description, image.label).split("//").join("//"))
                    .replace(/\\/g, "/");
                editor.edit((selected) => {
                    selected.insert(new Position(wordRange.end.line, wordRange.end.character - 3), ` lightbox="${imagePath}"`);
                });
            }
        });
    } else {
        const RE_LIGHTBOX_EXISTS = /:::image\s+((source|type|alt-text|lightbox|border|loc-scope)="([a-zA-Z0-9_.\/ -]+)"\s*)+:::/gm;
        const lightboxAlreadyExists = editor.document.getWordRangeAtPosition(position, RE_LIGHTBOX_EXISTS);
        if (lightboxAlreadyExists) {
            window.showErrorMessage("lightbox attribute already exists on :::image::: tag.");
            return;
        }
        window.showErrorMessage("invalid cursor position. You must be inside :::image::: tags.");
    }
    return;
}
