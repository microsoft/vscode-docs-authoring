import * as fs from "fs";
import { Result } from "./result";

export function getFileName(filePath: string | null): string {
    return !!filePath ? filePath.replace(/^.*[\\\/]/, '') : "";
}

export function getFileSize(filePath: string): number {
    const stats = fs.statSync(filePath);
    return stats.size;
}

export function toHumanReadableString(bytes: number, si: boolean = true): string {
    const thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
        return `${bytes} B`;
    }

    const units = si
        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];

    let unitIndex = -1;
    do {
        bytes /= thresh;
        ++ unitIndex;
    } while (Math.abs(bytes) >= thresh && unitIndex < units.length - 1);

    return `${bytes.toFixed(1)} ${units[unitIndex]}`;
}

export function calculatePercentReduction(originalBytes: number, compressedBytes: number): string {
    const percent = 
        ((originalBytes - compressedBytes) / originalBytes) * 100;
    return `${percent.toFixed(2)}%`;
}

export function resultToString(result: Result): string {
    if (result.wasCompressed) {
        return result.wasResized
            ? `Compressed (and resized) "${result.file}" from ${result.before} to ${result.after}, reduced by ${result.reduction}.`
            : `Compressed "${result.file}" from ${result.before} to ${result.after}, reduced by ${result.reduction}.`;
    }

    return `Unable to compress "${result.file}".`;
}

export function resultsToString(results: Result[]): string {
    const resized = sum(results, r => r.wasResized === true ? 1 : 0);
    const beforeSum = sum(results, r => !!r.originalSize ? r.originalSize : 0);
    const afterSum = sum(results, r => !!r.compressedSize ? r.compressedSize : 0);
    const count = results.length;
    const reduction = calculatePercentReduction(beforeSum, afterSum);
    const resizedMessage = !!resized ? ` (and resized ${resized})` : "";
    const individualResults = results.map(r => `${resultToString(r)}`).join("\n");

    return `${individualResults}\nCompressed ${count} images${resizedMessage} in total, from ${toHumanReadableString(beforeSum)} to ${toHumanReadableString(afterSum)}, reduced by ${reduction}`;
}

function sum<T>(array: T[], selector: (t: T) => number): number {
    return array.reduce((a, b) => a + selector(b), 0);
}