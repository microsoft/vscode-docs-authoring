"use strict";

export function deleteEmptyMetadata(data: any) {
    const metadataRegex: any = new RegExp(/^(\w+\.*\w+?:)(\s*|\s""|\s'')[\n|\r](?=(.|\n|\r)*---\s$)/gmi);
    const emptyLinesRegex: any = new RegExp(/---^\s*[\n\r](?=(.|\n|\r)*---\s$)/gmi);
    data = data.replace(metadataRegex, '').replace(emptyLinesRegex, '');
    return data;
}

export function deleteNaMetadata(data: any) {
    const metadataRegex: any = new RegExp(/^(\w+\.*\w+?:\s(na|n\/a))[\n|\r](?=(.|\n|\r)*---\s$)/gmi);
    const emptyLinesRegex: any = new RegExp(/---^\s*[\n\r](?=(.|\n|\r)*---\s$)/gmi);
    data = data.replace(metadataRegex, '').replace(emptyLinesRegex, '');
    return data;
}

export function deleteCommentedMetadata(data: any) {
    const metadataRegex: any = new RegExp(/^(#\s?\w+\.*\w+?:).*[\n|\r](?=(.|\n|\r)*---\s$)/gmi);
    const emptyLinesRegex: any = new RegExp(/---^\s*[\n\r](?=(.|\n|\r)*---\s$)/gmi);
    data = data.replace(metadataRegex, '').replace(emptyLinesRegex, '');
    return data;
}
