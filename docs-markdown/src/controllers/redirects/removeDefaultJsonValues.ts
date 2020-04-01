import * as fs from "fs";
import { window, workspace } from "vscode";
import { postWarning, showStatusMessage, tryFindFile } from "../../helper/common";
import { RedirectFileName } from "./constants";
import { getMarkdownOptions, IMasterRedirections, updateRedirects } from "./utilities";

export async function removeDefaultValuesInRedirects() {
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
                const { config, options } = await getMarkdownOptions();
                if (!options || !config) {
                    return;
                }

                // Explicitly remove them from this command
                options.omitDefaultJsonProperties = true;

                let removedDefaults = 0;
                redirects.redirections.forEach((redirect) => {
                    if (redirect.redirect_document_id === false) {
                        removedDefaults++;
                    }
                });

                if (removedDefaults > 0) {
                    await updateRedirects(editor, redirects, config);
                    const numberFormat = Intl.NumberFormat();
                    showStatusMessage(`Removed ${numberFormat.format(removedDefaults)} redirect_document_id values.`);
                } else {
                    showStatusMessage("All redirect_document_id values are either true or omitted.");
                }
            }
        }
    }
}
