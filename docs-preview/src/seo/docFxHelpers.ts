import { existsSync, readFileSync } from "fs";
import { sep } from "path";
import { tryFindFile } from "../helper/common";
import { IDocFxMetadata, MetadataType } from "./docFxTypes";

export function getDocfxMetadata(basePath) {
    const docFxJson = tryFindFile(basePath, "docfx.json");
    if (!!docFxJson && existsSync(docFxJson)) {
        const jsonBuffer = readFileSync(docFxJson);
        const metadata = JSON.parse(jsonBuffer.toString()) as IDocFxMetadata;
        if (metadata && metadata.build && metadata.build.fileMetadata) {
            return metadata;
        }
    }
}

export function tryGetFileMetadataTitleSuffix(docfxMetadata: IDocFxMetadata, filePath) {
    if (docfxMetadata.build.fileMetadata
        && docfxMetadata.build.fileMetadata.titleSuffix) {
        const value = getReplacementValue(docfxMetadata.build.fileMetadata.titleSuffix, filePath);
        if (value) {
            return value;
        }
    }
    return "";
}

export function tryGetGlobalMetadataTitleSuffix(docfxMetadata: IDocFxMetadata) {
    if (docfxMetadata.build.globalMetadata
        && docfxMetadata.build.globalMetadata.titleSuffix) {
        return docfxMetadata.build.globalMetadata.titleSuffix;
    }
    return "";
}

function getReplacementValue(globs: { [glob: string]: string }, fsPath: string): string | undefined {
    if (globs && fsPath) {
        let segments = fsPath.split(sep);
        const globKeys = Object.keys(globs).map((key) => ({ key, segments: key.split("/") }));
        const firstSegment = globKeys[0].segments[0];
        segments = segments.slice(segments.indexOf(firstSegment));
        const length = segments.length;
        for (let i = 0; i < globKeys.length; ++i) {
            const globKey = globKeys[i];
            if (length <= globKey.segments.length) {
                let equals = false;
                for (let f = 0; f < segments.length - 1; ++f) {
                    const left = segments[f];
                    const right = globKey.segments[f];
                    if (right.startsWith("*")) {
                        break;
                    }
                    equals = left.toLowerCase() === right.toLowerCase();
                }

                if (equals) {
                    return globs[globKey.key];
                }
            }
        }
    }

    return undefined;
}
