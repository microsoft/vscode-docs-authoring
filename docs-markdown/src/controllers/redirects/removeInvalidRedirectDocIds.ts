import * as fs from "fs";
import { resolve } from "path";
import { ProgressLocation, window } from "vscode";
import { postError, showStatusMessage } from "../../helper/common";
import { RedirectUrl } from "./redirect-url";
import { IMasterRedirection, initiateRedirectCommand, updateRedirects } from "./utilities";

export async function detectInvalidDocumentIdRedirects() {
    const { isEnvironmentReady, redirectsAndConfigOptions } = await initiateRedirectCommand();
    if (!isEnvironmentReady || !redirectsAndConfigOptions) {
        return;
    }

    const { config, editor, folder, options, redirects } = redirectsAndConfigOptions;
    const redirectsLookup = new Map<string, { redirect: RedirectUrl | null, redirection: IMasterRedirection }>();
    redirects.redirections.forEach((r) => {
        if (!r.redirectDocumentId) {
            return;
        }
        redirectsLookup.set(r.sourcePath, {
            redirect: RedirectUrl.parse(options, r.redirectUrl),
            redirection: r,
        });
    });

    const fileExists = (filePath: string) => {
        try {
            const fullPath = resolve(folder.uri.fsPath, filePath);
            return fs.existsSync(fullPath);
        } catch {
            return false;
        }
    };

    let fixesApplied = 0;
    try {
        fixesApplied = await window.withProgress({
            cancellable: true,
            location: ProgressLocation.Notification,
            title: "Detecting invalid redirects",
        }, async (progress, token) => {
            token.onCancellationRequested(() => {
                postError("User canceled the long running operation");
            });

            const message = "Detecting invalid redirects, this may take a while.";
            showStatusMessage(message);
            progress.report({ message });

            const size = redirectsLookup.size;
            let index = 0;
            let fixes = 0;
            redirectsLookup.forEach(async (source, _) => {
                index++;
                progress.report({ message: `Validating ${index} of ${size}.`, increment: index });

                const { redirect: url, redirection: redirect } = source;
                if (!url || !redirect) {
                    return;
                }

                if (!!redirect.redirectDocumentId) {
                    if (url.isExternalUrl) {
                        redirect.redirectDocumentId = false;
                        fixes++;
                        return;
                    }

                    if (!redirect.redirectUrl.startsWith(`/${options.docsetName}/`)) {
                        redirect.redirectDocumentId = false;
                        fixes++;
                        return;
                    }

                    const files = [
                        url.filePath,
                        url.filePath.replace(".md", "/index.md"),
                        url.filePath.replace(".md", "/index.yml"),
                    ];
                    if (!files.some((path: string) => fileExists(path))) {
                        redirect.redirectDocumentId = false;
                        fixes++;
                        return;
                    }
                }
            });

            return fixes;
        });
    } catch (error) {
        showStatusMessage(`Something went wrong: ${error.toString()}`);
    }

    if (fixesApplied > 0) {
        await updateRedirects(editor, redirects, config);
        const numberFormat = Intl.NumberFormat();
        showStatusMessage(`Fixed ${numberFormat.format(fixesApplied)} invalid redirect_document_id values.`);
    } else {
        showStatusMessage("All redirect_document_id values appear to be valid.");
    }
}
