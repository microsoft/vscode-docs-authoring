import * as fs from "fs";
import { Result } from "./result";

export function getFileName(filePath: string): string {
    return filePath.replace(/^.*[\\\/]/, '');
}

export function getFileSize(filePath: string): number {
    const stats = fs.statSync(filePath);
    return stats.size;
}

export function toHumanReadableString(bytes: number, si: boolean = true): string {
    const thresh = si ? 1000 : 1024;
    if (Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }

    const units = si
        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];

    let u = -1;
    do {
        bytes /= thresh;
        ++ u;
    } while (Math.abs(bytes) >= thresh && u < units.length - 1);

    return bytes.toFixed(1)+' '+units[u];
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