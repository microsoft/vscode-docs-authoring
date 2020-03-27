import { reporter } from "../../helper/telemetry";
import { readWriteFileWithProgress } from "./utilities";

const telemetryCommand: string = "applyCleanup";

/**
 * Converts http:// to https:// for all microsoft links.
 */
export function microsoftLinks(progress: any, file: string, files: string[] | null, index: number | null) {
    const message = "Microsoft Links";
    reporter.sendTelemetryEvent("command", { command: telemetryCommand });
    if (file.endsWith(".md")) {
        return readWriteFileWithProgress(progress,
            file,
            message,
            files,
            index,
            (data: string) => {
                data = handleLinksWithRegex(data);
                return data;
            });
    } else { return Promise.resolve(); }
}

/**
 * replaces input data with regex values for microsoft links.
 * Looks for data that contains microsoft links for docs, azure, msdn, and technet.
 * Replace the http with https, and remove language specific url.
 * @param data takes data string as arg
 */
export function handleLinksWithRegex(data: string) {
    const akaRegex = new RegExp(/http:\/\/aka.ms/g);
    data = data.replace(akaRegex, "https://aka.ms");
    const microsoftRegex = new RegExp(/http:\/\/microsoft.com/g);
    data = data.replace(microsoftRegex, "https://microsoft.com");
    const goMicrosoftRegex = new RegExp(/http:\/\/go.microsoft.com/g);
    data = data.replace(goMicrosoftRegex, "https://go.microsoft.com");
    const visualstudioRegex = new RegExp(/http:\/\/visualstudio.com/g);
    data = data.replace(visualstudioRegex, "https://visualstudio.com");
    const officeRegex = new RegExp(/http:\/\/office.com/g);
    data = data.replace(officeRegex, "https://office.com");
    const docsRegex = new RegExp(/http:\/\/docs.microsoft.com/g);
    data = data.replace(docsRegex, "https://docs.microsoft.com");
    const azureRegex = new RegExp(/http:\/\/azure.microsoft.com/g);
    data = data.replace(azureRegex, "https://azure.microsoft.com");
    const azureRegex2 = new RegExp(/http:\/\/azure.com/g);
    data = data.replace(azureRegex2, "https://azure.com");
    const msdnRegex = new RegExp(/http:\/\/msdn.microsoft.com/g);
    data = data.replace(msdnRegex, "https://msdn.microsoft.com");
    const msdnRegex2 = new RegExp(/http:\/\/msdn.com/g);
    data = data.replace(msdnRegex2, "https://msdn.com");
    const technetRegex = new RegExp(/http:\/\/technet.microsoft.com/g);
    data = data.replace(technetRegex, "https://technet.microsoft.com");
    const technetRegex2 = new RegExp(/http:\/\/technet.com/g);
    data = data.replace(technetRegex2, "https://technet.com");
    const downloadRegex = new RegExp(/http:\/\/download.microsoft.com/g);
    data = data.replace(downloadRegex, "https://download.microsoft.com");
    const docsRegexLang = new RegExp(/https:\/\/docs.microsoft.com\/[A-Za-z]{2}-[A-Za-z]{2}\//g);
    data = data.replace(docsRegexLang, "https://docs.microsoft.com/");
    const azureRegexLang = new RegExp(/https:\/\/azure.microsoft.com\/[A-Za-z]{2}-[A-Za-z]{2}\//g);
    data = data.replace(azureRegexLang, "https://azure.microsoft.com/");
    const msdnRegexLang = new RegExp(/https:\/\/msdn.microsoft.com\/[A-Za-z]{2}-[A-Za-z]{2}\//g);
    data = data.replace(msdnRegexLang, "https://msdn.microsoft.com/");
    const technetRegexLang = new RegExp(/https:\/\/technet.microsoft.com\/[A-Za-z]{2}-[A-Za-z]{2}\//g);
    data = data.replace(technetRegexLang, "https://technet.microsoft.com/");
    return data;
}
