import Axios from "axios";
import { Position, QuickPickItem, window } from "vscode";
import { noActiveEditorMessage } from "../../helper/common";
export const locScopeItems: QuickPickItem[] = [];
export async function applyLocScope() {
    // get editor, its needed to apply the output to editor window.
    const editor = window.activeTextEditor;
    if (!editor) {
        noActiveEditorMessage();
        return;
    }
    // if user has not selected any text, then continue
    const RE_LOC_SCOPE = /:::image\s+((source|type|alt-text|lightbox|border)="([a-zA-Z0-9_.\/ -]+)"\s*)+:::/gm;
    const position = new Position(editor.selection.active.line, editor.selection.active.character);
    // get the current editor position and check if user is inside :::image::: tags
    const wordRange = editor.document.getWordRangeAtPosition(position, RE_LOC_SCOPE);
    if (wordRange) {
        const start = RE_LOC_SCOPE.exec(editor.document.getText(wordRange));
        if (start) {
            const type = start[start.indexOf("type") + 1];
            if (type.toLowerCase() === "icon") {
                window.showErrorMessage("The loc-scope attribute should not be added to icons, which are not localized.");
                return;
            }
        }
        // if user is inside :::image::: tag, then ask them for quickpick of products based on allow list
        const notCached = locScopeItems.length <= 0;
        if (notCached) {
            await getLocScopeProducts();
        }
        // show quickpick to user for products list.
        const product = await window.showQuickPick(locScopeItems, { placeHolder: "Select from product list" });
        if (!product) {
            // if user did not select source image then exit.
            return;
        } else {
            // insert loc-sope into editor
            editor.edit((selected) => {
                selected.insert(new Position(wordRange.end.line, wordRange.end.character - 3), ` loc-scope="${product.label}"`);
            });
        }
    } else {
        const RE_LOC_SCOPE_EXISTS = /:::image\s+((source|type|alt-text|lightbox|border|loc-scope)="([a-zA-Z0-9_.\/ -]+)"\s*)+:::/gm;
        const locScopeAlreadyExists = editor.document.getWordRangeAtPosition(position, RE_LOC_SCOPE_EXISTS);
        if (locScopeAlreadyExists) {
            window.showErrorMessage("loc-scope attribute already exists on :::image::: tag.");
            return;
        }
        window.showErrorMessage("invalid cursor position. You must be inside :::image::: tags.");
    }
    return;
}

export async function getLocScopeProducts() {
    // if user is inside :::image::: tag, then ask them for quickpick of products based on allow list
    // call allowlist with API Auth Token
    // you will need auth token to call list
    const response = await Axios.get("https://docs.microsoft.com/api/metadata/allowlists");
    // get products from response
    const products: string[] = [];
    Object.keys(response.data)
        .filter((x) => x.startsWith("list:product"))
        .map((item: string) => {
            const set = item.split(":");
            if (set.length > 2) {
                products.push(set[2]);
                Object.keys(response.data[item].values)
                    .map((prod: string) =>
                        // push the response products into the list of quickpicks.
                        products.push(prod),
                    );
            }
        });
    products.sort().map((item) => {
        locScopeItems.push({
            label: item,
        });
    });
    locScopeItems.push({
        label: "other",
    });
    locScopeItems.push({
        label: "third-party",
    });
}
