import * as fs from "fs";
import { window, workspace } from "vscode";
import { naturalLanguageCompare, postWarning, tryFindFile } from "../../helper/common";
import { RedirectFileName } from "./constants";
import { IMasterRedirections, updateRedirects } from "./utilities";

export async function sortMasterRedirectionFile() {
    const editor = window.activeTextEditor;
    if (!editor) {
        postWarning("Editor not active. Abandoning command.");
        return;
    }

    const folder = workspace.getWorkspaceFolder(editor.document.uri);
    if (folder) {
        const file = tryFindFile(folder.uri.fsPath, RedirectFileName);
        if (!!file && fs.existsSync(file)) {
            const jsonBuffer = fs.readFileSync(file);
            const redirects = JSON.parse(jsonBuffer.toString()) as IMasterRedirections;
            if (redirects && redirects.redirections && redirects.redirections.length) {

                redirects.redirections.sort((a, b) => {
                    return naturalLanguageCompare(a.source_path, b.source_path);
                });

                const config = workspace.getConfiguration("markdown");
                await updateRedirects(editor, redirects, config);
            }
        }
    }
}
