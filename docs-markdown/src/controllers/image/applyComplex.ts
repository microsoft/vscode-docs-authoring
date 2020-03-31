import { QuickPickItem, window, workspace } from "vscode";
import { checkEditor, insertContentToEditor, noActiveEditorMessage, setCursorPosition } from "../../helper/common";
import { applyImage } from "./applyImage";
const path = require("path");
const dir = require("node-dir");
import { imageExtensions } from "../media-controller";
import { getLocScopeProducts, locScopeItems } from "./applyLocScope";
export async function applyComplex() {
    // get editor, its needed to apply the output to editor window.
    const editor = window.activeTextEditor;
    let folderPath: string = "";
    if (!editor) {
        noActiveEditorMessage();
        return;
    }
    let image = "";
    if (checkEditor(editor)) {
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
                const selection = editor.selection;
                const selectedText = editor.document.getText(selection);
                let altText: string | undefined = "";
                if (selectedText === "") {
                    // Ask user input for alt text
                    altText = await window.showInputBox({
                        placeHolder: "Add alt text (up to 250 characters)",
                        validateInput: (text: string) => text !== "" ? text.length <= 250 ? "" : "alt text should be less than 250 characters" : "alt-text input must not be empty",
                    });
                    if (!altText) {
                        // if user did not enter any alt text, then exit.
                        altText = "";
                    }
                } else {
                    altText = selectedText;
                }
                const config = workspace.getConfiguration("markdown");
                const alwaysIncludeLocScope = config.get<boolean>("alwaysIncludeLocScope");
                if (alwaysIncludeLocScope) {
                    const notCached = locScopeItems.length <= 0;
                    if (notCached) {
                        await getLocScopeProducts();
                    }
                    // show quickpick to user for products list.
                    const locScope = await window.showQuickPick(locScopeItems, { placeHolder: "Select from product list" });
                    if (locScope) {
                        image = `:::image type="complex" source="${sourcePath}" alt-text="${altText}" loc-scope="${locScope.label}":::

:::image-end:::`;
                    }
                } else {
                    // output image complex type
                    image = `:::image type="complex" source="${sourcePath}" alt-text="${altText}":::

:::image-end:::`;
                }
                insertContentToEditor(editor, applyImage.name, image, true);
                // Set editor position to the middle of long description body
                setCursorPosition(editor, editor.selection.active.line + 1, editor.selection.active.character);
            }
        });
    }
}
