import { postError } from "../../helper/common";
import { reporter } from "../../helper/telemetry";
import { readWriteFileWithProgress } from "./utilities";

const telemetryCommand: string = "applyCleanup";
/**
 * Lower cases all metadata found in .md files
 */
export function capitalizationOfMetadata(progress: any, file: string, files: string[] | null, index: number | null) {
    reporter.sendTelemetryEvent("command", { command: telemetryCommand });
    const message = "Capitalization of metadata values";
    if (file.endsWith(".md")) {
        return readWriteFileWithProgress(progress,
            file,
            message,
            files,
            index,
            (data) => {
                if (data.startsWith("---")) {
                    data = lowerCaseData(data, "ms.author");
                    data = lowerCaseData(data, "author");
                    data = lowerCaseData(data, "ms.prod");
                    data = lowerCaseData(data, "ms.service");
                    data = lowerCaseData(data, "ms.subservice");
                    data = lowerCaseData(data, "ms.technology");
                    data = lowerCaseData(data, "ms.topic");
                }
                return data;
            });
    } else { return Promise.resolve(); }
}
/**
 * takes data as input, and passes variable into regex
 * to be used to find metadata key and replace value with lowercase data.
 * @param data takes string data from file
 * @param variable metadata key to use in regex to replace
 */
export function lowerCaseData(data: any, variable: string) {
    const regex = new RegExp(`^(${variable}:)(.*(\\S\\s)?)`, "m");
    const captureParts = regex.exec(data);
    let value = "";
    if (captureParts && captureParts.length > 2) {
        value = captureParts[2].toLowerCase();
        if (value.match(/^\s*$/) !== null) {
            return data;
        }
        try {
            return data.replace(regex, `${variable}:${value}`);
        } catch (error) {
            postError(`Error occurred: ${error}`);
        }
    }

    return data;
}
