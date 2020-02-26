"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function deleteEmptyMetadata(data) {
    const metadataRegex = new RegExp(/^(\w+\.*\w+?:)(\s*|\s""|\s'')[\n|\r](?=(.|\n|\r)*---\s$)/gmi);
    data = data.replace(metadataRegex, '');
    return data;
}
exports.deleteEmptyMetadata = deleteEmptyMetadata;
function deleteNaMetadata(data) {
    const metadataRegex = new RegExp(/^(\w+\.*\w+?:\s(na|n\/a))[\n|\r](?=(.|\n|\r)*---\s$)/gmi);
    data = data.replace(metadataRegex, '');
    return data;
}
exports.deleteNaMetadata = deleteNaMetadata;
function deleteCommentedMetadata(data) {
    const metadataRegex = new RegExp(/^(#\s?\w+\.*.*\w+?:).*[\n|\r](?=(.|\n|\r)*---\s$)/gmi);
    data = data.replace(metadataRegex, '');
    return data;
}
exports.deleteCommentedMetadata = deleteCommentedMetadata;
//# sourceMappingURL=cleanup.js.map