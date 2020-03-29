import { reporter } from "../../helper/telemetry";
import { readWriteFileWithProgress } from "./utilities";

const telemetryCommand: string = "applyCleanup";
/**
 * Cleanup empty, na and commented out metadata attributes found in .md files
 */
export function removeEmptyMetadata(progress: any, file: string, files: string[] | null, index: number | null, cleanupType: string) {
    const message = "Removal of metadata values";
    reporter.sendTelemetryEvent("command", { command: telemetryCommand });
    if (file.endsWith(".md")) {
        return readWriteFileWithProgress(progress,
            file,
            message,
            files,
            index,
            (data: string) => {
                if (data.startsWith("---")) {
                    if (cleanupType === "empty") {
                        data = deleteEmptyMetadata(data);
                    }
                    if (cleanupType === "na") {
                        data = deleteNaMetadata(data);
                    }
                    if (cleanupType === "commented") {
                        data = deleteCommentedMetadata(data);
                    }
                    if (cleanupType === "all") {
                        data = deleteEmptyMetadata(data);
                        data = deleteNaMetadata(data);
                        data = deleteCommentedMetadata(data);
                    }
                }
                return data;
            });
    } else { return Promise.resolve(); }
}

export function deleteEmptyMetadata(data: any) {
    const metadataRegex: any = new RegExp(/^(\w+\.*\w+?:)(\s*|\s""|\s'')[\n|\r](?=(.|\n|\r)*---\s$)/gmi);
    data = data.replace(metadataRegex, "");
    return data;
}

export function deleteNaMetadata(data: any) {
    const metadataRegex: any = new RegExp(/^(\w+\.*\w+?:\s(na|n\/a))[\n|\r](?=(.|\n|\r)*---\s$)/gmi);
    data = data.replace(metadataRegex, "");
    return data;
}

export function deleteCommentedMetadata(data: any) {
    const metadataRegex: any = new RegExp(/^(#\s?\w+\.*.*\w+?:).*[\n|\r](?=(.|\n|\r)*---\s$)/gmi);
    data = data.replace(metadataRegex, "");
    return data;
}
