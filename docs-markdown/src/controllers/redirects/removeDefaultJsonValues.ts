import { showStatusMessage } from "../../helper/common";
import { initiateRedirectCommand, updateRedirects } from "./utilities";

export async function removeDefaultValuesInRedirects() {
    const { isEnvironmentReady, redirectsAndConfigOptions } = await initiateRedirectCommand();
    if (!isEnvironmentReady || !redirectsAndConfigOptions) {
        return;
    }

    const { config, editor, options, redirects } = redirectsAndConfigOptions;

    // Explicitly remove them from this command
    options.omitDefaultJsonProperties = true;

    let removedDefaults = 0;
    redirects.redirections.forEach((redirect) => {
        if (redirect.redirectDocumentId === false) {
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
