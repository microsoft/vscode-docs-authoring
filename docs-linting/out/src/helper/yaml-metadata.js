"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const path = require("path");
const Collections = require("typescript-collections");
const YAML = require("yamljs");
const common = require("./common");
const utilityHelper = require("./utility");
const vscode_1 = require("vscode");
/* tslint:disable:no-var-requires max-classes-per-file */
const lodash = require("lodash.merge");
const matcher = require("matcher");
const fsExistsSync = require("fs-exists-sync");
var MetadataSourceContentType;
(function (MetadataSourceContentType) {
    MetadataSourceContentType[MetadataSourceContentType["MarkdownFile"] = 0] = "MarkdownFile";
    MetadataSourceContentType[MetadataSourceContentType["DocFxFile"] = 1] = "DocFxFile";
    MetadataSourceContentType[MetadataSourceContentType["GlobalMetadataFx"] = 2] = "GlobalMetadataFx";
    MetadataSourceContentType[MetadataSourceContentType["FileMetadataFx"] = 3] = "FileMetadataFx";
    MetadataSourceContentType[MetadataSourceContentType["YamlContent"] = 4] = "YamlContent";
})(MetadataSourceContentType = exports.MetadataSourceContentType || (exports.MetadataSourceContentType = {}));
exports.dateTimeFormat = "MM/dd/yyyy";
class EmptyYamlHeaderError extends Error {
    constructor(message) {
        super(message);
        Object.setPrototypeOf(this, EmptyYamlHeaderError.prototype);
    }
}
exports.EmptyYamlHeaderError = EmptyYamlHeaderError;
class MetadataContentBase {
    constructor(metadataType, dataContent, fileName, rawMetadata) {
        this.MetadataType = metadataType;
        this.OriginalData = dataContent;
        this.FileName = fileName;
        this.RawMetadata = rawMetadata;
    }
    getYamlMetadataContent() {
        try {
            return this.getYamlMetadataContentInner();
        }
        catch (err) {
            this.checkSyntaxError(err.toString());
            throw new Error("Yaml header could not be parsed.  If any free-form text spans multiple lines, please wrap the entire string in quotes.");
        }
    }
    getRawMetadataContent() {
        try {
            return this.getRawMetadataContentInner();
        }
        catch (err) {
            throw new Error("Yaml header could not be parsed.  If any free-form text spans multiple lines, please wrap the entire string in quotes.");
        }
    }
    getYamlMetadataContentInner() {
        return this.OriginalData;
    }
    getRawMetadataContentInner() {
        return this.RawMetadata;
    }
    translateSyntaxErrorMessage(errMsg) {
        if (errMsg.indexOf("ms.date:") >= 0) {
            return "ms.date format is incorrect. Change to " + exports.dateTimeFormat + " and re-run validation.";
        }
        else if (errMsg.indexOf("Malformed inline YAML string") >= 0) {
            return errMsg.replace("Malformed inline YAML string", "Incorrect YAML syntax in string") + ". Please fix YAML syntax and re-run validation.";
        }
        return errMsg;
    }
    checkSyntaxError(errMsg) {
        if (errMsg.indexOf("<ParseException> ") >= 0) {
            errMsg = errMsg.replace("<ParseException> ", "");
            throw new Error(this.translateSyntaxErrorMessage(errMsg).toString());
        }
    }
}
exports.MetadataContentBase = MetadataContentBase;
class YamlMetadataContent extends MetadataContentBase {
    constructor(originalContent, fileName, rawMetadata = "") {
        super(MetadataSourceContentType.YamlContent, originalContent, fileName, rawMetadata);
    }
    getYamlMetadataContentInner() {
        return this.OriginalData;
    }
    getRawMetadataContentInner() {
        return this.RawMetadata;
    }
}
exports.YamlMetadataContent = YamlMetadataContent;
class MarkdownFileMetadataContent extends MetadataContentBase {
    constructor(originalContent, fileName, rawMetadata = "") {
        super(MetadataSourceContentType.MarkdownFile, originalContent, fileName, rawMetadata);
    }
    getYamlMetadataContentInner() {
        const re = /^(-{3}(?:\n|\r)([\w\W]+?)(?:\n|\r)-{3})?([\w\W]*)*/;
        const results = re.exec(utilityHelper.stripBOMFromString(this.OriginalData.toString()) || "{}");
        if (results !== null) {
            const result = results[1];
            const trimmed = common.rtrim(result.trim(), "---");
            const parsed = YAML.parse(trimmed);
            if (parsed === null) {
                // fix if yaml header is empty or contains only comments
                return "";
            }
            return YAML.stringify(parsed);
        }
        return "";
    }
    getRawMetadataContentInner() {
        const re = /^(-{3}(?:\n|\r)([\w\W]+?)(?:\n|\r)-{3})?([\w\W]*)*/;
        const results = re.exec(this.OriginalData.toString());
        if (results !== null) {
            const result = results[1];
            if (result === undefined) {
                return "";
            }
            return result;
        }
        return " ";
    }
}
exports.MarkdownFileMetadataContent = MarkdownFileMetadataContent;
class DocFxMetadataContent extends MetadataContentBase {
    constructor(originalContent, fileName, referenceTemplateFileName, rawMetadata = "") {
        super(MetadataSourceContentType.DocFxFile, originalContent, fileName, rawMetadata);
        this.referenceTemplateFileName = referenceTemplateFileName;
    }
    Expand() {
        try {
            const result = [];
            const docfxParsed = JSON.parse(utilityHelper.stripBOMFromString(this.OriginalData.toString()) || "{}");
            if (docfxParsed === undefined || docfxParsed.build === undefined) {
                // log.debug("file '" + this.FileName + "' does not contain requested root element 'build'");
                return result;
            }
            if (docfxParsed.build.fileMetadata !== undefined) {
                result.push(new FileFxMetadataContent(JSON.stringify(docfxParsed.build.fileMetadata), this.FileName, this.referenceTemplateFileName));
            }
            if (docfxParsed.build.globalMetadata !== undefined) {
                result.push(new GlobalFxMetadataContent(JSON.stringify(docfxParsed.build.globalMetadata), this.FileName));
            }
            return result;
        }
        catch (err) {
            throw new Error("Yaml headers could not be parsed from file '" + this.FileName + "'. Original error :" + err.toString());
        }
    }
}
exports.DocFxMetadataContent = DocFxMetadataContent;
class GlobalFxMetadataContent extends MetadataContentBase {
    constructor(originalContent, fileName, rawMetadata = "") {
        super(MetadataSourceContentType.GlobalMetadataFx, originalContent, fileName, rawMetadata);
    }
    getYamlMetadataContentInner() {
        if (this.OriginalData === undefined || this.OriginalData === "") {
            return "";
        }
        const parsed = JSON.parse(utilityHelper.stripBOMFromString(this.OriginalData.toString()) || "{}");
        return YAML.stringify(parsed);
    }
}
exports.GlobalFxMetadataContent = GlobalFxMetadataContent;
class FileFxMetadataContent extends MetadataContentBase {
    constructor(originalContent, fileName, referenceTemplateFileName, rawMetadata = "") {
        super(MetadataSourceContentType.FileMetadataFx, originalContent, fileName, rawMetadata);
        this.referenceTopicFileName = referenceTemplateFileName;
    }
    getYamlMetadataContentInner() {
        // parses file base metadata passed from from the docfx.json file. If filepattern is speficied it's taken only if
        // this.referenceTopicFileName is matched.
        const parsed = JSON.parse(utilityHelper.stripBOMFromString(this.OriginalData.toString()) || "{}");
        const returned = {};
        for (const key in parsed) {
            if (parsed.hasOwnProperty(key)) {
                const atributeItem = parsed[key];
                if (atributeItem instanceof Object) {
                    for (const filePattern in atributeItem) {
                        if (atributeItem.hasOwnProperty(filePattern)) {
                            if (this.matchFilePattern(this.referenceTopicFileName.toString(), filePattern)) {
                                returned[key] = atributeItem[filePattern];
                            }
                        }
                    }
                }
                else {
                    if (atributeItem instanceof String) {
                        returned[key] = parsed[key];
                    }
                }
            }
        }
        return YAML.stringify(returned);
    }
    matchFilePattern(referenceFile, filePattern) {
        const newSearchPattern = path.dirname(this.FileName).replace(/\\/g, "/") + "/" + filePattern; // normalizes path and replaces backslashes
        const filePath = referenceFile.replace(/\\/g, "/"); // normalizes path and replaces backslashes
        const isJS = matcher.isMatch(filePath, newSearchPattern);
        return isJS;
    }
}
exports.FileFxMetadataContent = FileFxMetadataContent;
/**
 * Returns docfx.json metadata representation if find in the specified directory.
 */
function findDocFxMetadataForDir(dirname, referenceTopicFileName) {
    const searchedMetadata = path.join(dirname, GetDocFxMetadataName());
    if (fsExistsSync(searchedMetadata)) {
        return new DocFxMetadataContent(fs.readFileSync(searchedMetadata, "utf8"), searchedMetadata, referenceTopicFileName);
    }
    return;
}
exports.findDocFxMetadataForDir = findDocFxMetadataForDir;
/**
 * Merges 2 metadata content specified by the holder class. Higher priority overwrites lower priority metadata.
 * Return type is yaml metadata content only.
 */
function mergeYamlMetadata(higherPriorityMetadata, lowerPriorityMetadata) {
    if (higherPriorityMetadata === undefined) {
        throw new RangeError("higherPriorityMetadata must be defined.");
    }
    if (lowerPriorityMetadata === undefined) {
        throw new RangeError("lowerPriorityMetadata must be defined.");
    }
    const contentHi = higherPriorityMetadata.getYamlMetadataContent();
    const contentLo = lowerPriorityMetadata.getYamlMetadataContent();
    const contentRaw = higherPriorityMetadata.getRawMetadataContent();
    let mergedContent;
    const newFileName = higherPriorityMetadata.FileName;
    if (contentHi === undefined || contentHi === "") {
        if (contentLo === undefined) {
            mergedContent = "";
        }
        else {
            mergedContent = contentLo;
        }
    }
    else if (contentLo === undefined || contentLo === "") {
        if (contentHi === undefined) {
            mergedContent = "";
        }
        else {
            mergedContent = contentHi;
        }
    }
    else {
        const yamlFrontHi = YAML.parse(contentHi);
        const yamlFrontLo = YAML.parse(contentLo);
        const mergedContentAny = lodash(yamlFrontLo, yamlFrontHi);
        mergedContent = YAML.stringify(mergedContentAny);
        if (mergedContent.trim() === "{}") {
            mergedContent = "";
        }
    }
    return new YamlMetadataContent(mergedContent, newFileName, contentRaw);
}
/**
 * Merges all metadata in the passed priority queue into the one. This merge does expansion if DocFxMetadataContent representing docfx.json is specified
 * Highest priority item in the queue will be merged as highest priority metadata.
 */
function mergeMetadata(priorityQueue) {
    if (priorityQueue === undefined) {
        throw new RangeError("priorityStack must be defined.");
    }
    const stack = new Collections.Stack();
    if (priorityQueue.isEmpty()) {
        throw new RangeError("priorityQueue can't be empty.");
    }
    while (!priorityQueue.isEmpty()) {
        const item = priorityQueue.dequeue();
        if (item !== undefined) {
            switch (item.MetadataType) {
                case MetadataSourceContentType.MarkdownFile:
                    stack.push(item);
                    break;
                case MetadataSourceContentType.GlobalMetadataFx:
                case MetadataSourceContentType.FileMetadataFx:
                case MetadataSourceContentType.YamlContent:
                    stack.push(item);
                    break;
                case MetadataSourceContentType.DocFxFile:
                    const docfxContent = item;
                    const expandedList = docfxContent.Expand();
                    for (const expandedItem of expandedList) {
                        stack.push(expandedItem);
                    }
                    break;
                default:
                    throw new RangeError("switch value:" + item.MetadataType + " is not implemented");
            }
        }
        return mergeMetadataFromTop(stack);
    }
    return mergeMetadataFromTop(stack);
}
exports.mergeMetadata = mergeMetadata;
/**
 * merges all metadata in the passed stack specified by content holder class. Merging is done from the top of the stack to the bottom.
 * Bottom item has highest priotity.
 * Does not expand docfx.json content representation!
 */
function mergeMetadataFromTop(stack) {
    let currentMergedItem = stack.pop();
    while (!stack.isEmpty()) {
        currentMergedItem = mergeYamlMetadata(stack.pop(), currentMergedItem);
    }
    return currentMergedItem;
}
function GetDocFxMetadataName() {
    return "docfx.json";
}
/**
 * Return true if cursor is within the YAML Header
 * @param
 */
function isCursorInsideYamlHeader(editor) {
    const docText = editor.document.getText();
    const secondDashPosition = docText.indexOf("---", 4);
    const range = new vscode_1.Range(0, 0, editor.selection.end.line, editor.selection.end.character);
    const cursorText = editor.document.getText(range);
    const isInHeader = cursorText.length < secondDashPosition;
    return isInHeader;
}
exports.isCursorInsideYamlHeader = isCursorInsideYamlHeader;
//# sourceMappingURL=yaml-metadata.js.map