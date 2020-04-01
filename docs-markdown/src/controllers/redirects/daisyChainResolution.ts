import * as fs from "fs";
import { window, workspace } from "vscode";
import { postWarning, showStatusMessage, tryFindFile } from "../../helper/common";
import { RedirectFileName } from "./constants";
import { RedirectUrl } from "./redirect-url";
import { getMarkdownOptions, IMasterRedirection, IMasterRedirections, updateRedirects } from "./utilities";

export async function applyRedirectDaisyChainResolution() {
    const editor = window.activeTextEditor;
    if (!editor) {
        postWarning("Editor not active. Abandoning command.");
        return;
    }

    let redirects: IMasterRedirections | null = null;
    const folder = workspace.getWorkspaceFolder(editor.document.uri);
    if (!folder) {
        return;
    }

    const file = tryFindFile(folder.uri.fsPath, RedirectFileName);
    if (!!file && fs.existsSync(file)) {
        if (!editor.document.uri.fsPath.endsWith(RedirectFileName)) {
            const openFile = await window.showErrorMessage(
                `Unable to update the master redirects, please open the "${RedirectFileName}" file then try again!`,
                "Open File");
            if (!!openFile) {
                const document = await workspace.openTextDocument(file);
                await window.showTextDocument(document);
            }
            return;
        }

        const jsonBuffer = fs.readFileSync(file);
        redirects = JSON.parse(jsonBuffer.toString()) as IMasterRedirections;
    }

    if (!redirects || !redirects.redirections) {
        return;
    }

    const { config, options } = await getMarkdownOptions();
    if (!options) {
        return;
    }

    const redirectsLookup = new Map<string, { redirect: RedirectUrl | null, redirection: IMasterRedirection }>();
    redirects.redirections.forEach((r) => {
        redirectsLookup.set(r.source_path, {
            redirect: RedirectUrl.parse(options, r.redirect_url),
            redirection: r,
        });
    });

    const findRedirect = (sourcePath: string) => {
        return redirectsLookup.has(sourcePath)
            ? redirectsLookup.get(sourcePath)
            : null;
    };

    let daisyChainsResolved = 0;
    let maxDepthResolved = 0;
    redirectsLookup.forEach((source, _) => {
        const { redirect: url, redirection: redirect } = source;
        if (!url || !redirect) {
            return;
        }

        const redirectFilePath = url.filePath;

        let daisyChainPath = null;
        let targetRedirectUrl = null;
        let depthResolved = 0;
        let isExternalUrl = false;
        let targetRedirect = findRedirect(redirectFilePath);
        while (targetRedirect !== null) {
            if (!targetRedirect!.redirect || !targetRedirect!.redirection) {
                break;
            }

            depthResolved++;
            if (depthResolved > maxDepthResolved) {
                maxDepthResolved = depthResolved;
            }
            isExternalUrl = targetRedirect!.redirect.isExternalUrl;
            targetRedirectUrl =
                isExternalUrl
                    ? targetRedirect!.redirect!.url.toString()
                    : targetRedirect!.redirect!.toRelativeUrl();
            daisyChainPath = targetRedirect!.redirect!.filePath;
            targetRedirect = findRedirect(daisyChainPath);
        }

        if (targetRedirectUrl && targetRedirectUrl !== source.redirection.redirect_url) {
            daisyChainsResolved++;
            const newRedirectUrl =
                isExternalUrl
                    ? targetRedirectUrl
                    : source.redirect!.adaptHashAndQueryString(targetRedirectUrl);
            source.redirection.redirect_url = newRedirectUrl;

            if (source.redirection.redirect_document_id) {
                if (isExternalUrl ||
                    !newRedirectUrl.startsWith(`/${options.docsetName}/`)) {
                    source.redirection.redirect_document_id = false;
                }
            }
        }
    });

    if (daisyChainsResolved > 0) {
        await updateRedirects(editor, redirects, config);
        const numberFormat = Intl.NumberFormat();
        showStatusMessage(`Resolved ${numberFormat.format(daisyChainsResolved)} daisy chains, at a max-depth of ${maxDepthResolved}!`);
    } else {
        showStatusMessage("There are no daisy chains found.");
    }
}
