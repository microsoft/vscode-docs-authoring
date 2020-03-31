import { QuickPickItem, window, workspace } from "vscode";
import { checkEditor, insertContentToEditor, noActiveEditorMessage } from "../../helper/common";
import { imageExtensions } from "../media-controller";
import { applyImage } from "./applyImage";
const path = require("path");
const dir = require("node-dir");
export async function applyIcon() {
    // get editor to see if user has selected text
    const editor = window.activeTextEditor;
    let folderPath: string = "";
    if (!editor) {
        noActiveEditorMessage();
        return;
    }
    let image = "";
    if (checkEditor(editor)) {
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        if (selectedText === "") {
            // Get images from repo as quickpick items
            // User should be given a list of quickpick items which list images from repo
            if (workspace.workspaceFolders) {
                folderPath = workspace.workspaceFolders[0].uri.fsPath;
            }
            // recursively get all the files from the root folder
            dir.files(folderPath, async (err: any, files: any) => {
                if (err) {
                    window.showErrorMessage(err);
                }
                const items: QuickPickItem[] = [];
                files.sort();
                files.filter((file: any) => imageExtensions.indexOf(path.extname(file.toLowerCase())) !== -1).forEach((file: any) => {
                    items.push({ label: path.basename(file), description: path.dirname(file) });
                });
                // allow user to select source items from quickpick
                const source = await window.showQuickPick(items, { placeHolder: "Select Image from repo" });
                if (!source) {
                    // if user did not select source image then exit.
                    return;
                } else {
                    const activeFileDir = path.dirname(editor.document.fileName);
                    const sourcePath = path.relative(activeFileDir, path.join(source.description, source.label).split("//").join("//"))
                        .replace(/\\/g, "/");
                    // output image content type
                    image = `:::image type="icon" source="${sourcePath}":::`;
                    insertContentToEditor(editor, applyImage.name, image, true);
                }
            });
        }
    } else {
        // if user has selected text then exit?
        return;
    }
    return;
}
