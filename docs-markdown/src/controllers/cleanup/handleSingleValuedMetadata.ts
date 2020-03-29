import { reporter } from "../../helper/telemetry";
import { handleMarkdownMetadata } from "./handleMarkdownMetadata";
import { handleYamlMetadata } from "./handleYamlMetadata";
import { readWriteFileWithProgress } from "./utilities";

const telemetryCommand: string = "applyCleanup";

/**
 * Searches through all directories from rootPath
 * and cleans up Yaml Metadata values that have single array items
 * then converts the array to single item.
 */
export function handleSingleValuedMetadata(progress: any, file: string, files: string[] | null, index: number | null) {
    reporter.sendTelemetryEvent("command", { command: telemetryCommand });
    const message = "Single-Valued metadata";
    if (file.endsWith(".yml") || file.endsWith(".md")) {
        return readWriteFileWithProgress(progress,
            file,
            message,
            files,
            index,
            (data: string) => {
                if (file.endsWith(".yml")) {
                    data = handleYamlMetadata(data);
                } else if (file.endsWith(".md")) {
                    if (data.startsWith("---")) {
                        const regex = new RegExp(`^(---)([^]+?)(---)$`, "m");
                        const metadataMatch = data.match(regex);
                        if (metadataMatch) {
                            data = handleMarkdownMetadata(data, metadataMatch[2]);
                        }
                    }
                }
                return data;
            });
    } else { return Promise.resolve(); }
}
