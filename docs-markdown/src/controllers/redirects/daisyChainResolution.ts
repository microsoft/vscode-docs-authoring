import { showStatusMessage } from "../../helper/common";
import { RedirectUrl } from "./redirect-url";
import { IMasterRedirection, initiateRedirectCommand, updateRedirects } from "./utilities";

export async function applyRedirectDaisyChainResolution() {
    const { isEnvironmentReady, redirectsAndConfigOptions } = await initiateRedirectCommand();
    if (!isEnvironmentReady || !redirectsAndConfigOptions) {
        return;
    }

    const { config, editor, options, redirects } = redirectsAndConfigOptions;
    const redirectsLookup = new Map<string, { redirect: RedirectUrl | null, redirection: IMasterRedirection }>();
    redirects.redirections.forEach((r) => {
        redirectsLookup.set(r.sourcePath, {
            redirect: RedirectUrl.parse(options, r.redirectUrl),
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

        if (targetRedirectUrl && targetRedirectUrl !== source.redirection.redirectUrl) {
            daisyChainsResolved++;
            const newRedirectUrl =
                isExternalUrl
                    ? targetRedirectUrl
                    : source.redirect!.adaptHashAndQueryString(targetRedirectUrl);
            source.redirection.redirectUrl = newRedirectUrl;

            if (source.redirection.redirectDocumentId) {
                if (isExternalUrl ||
                    !newRedirectUrl.startsWith(`/${options.docsetName}/`)) {
                    source.redirection.redirectDocumentId = false;
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
