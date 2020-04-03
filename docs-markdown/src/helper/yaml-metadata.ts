"use strict";

import { existsSync, readFileSync } from "fs";
import * as path from "path";
import { PriorityQueue, Stack } from "typescript-collections";
import { Range, TextEditor } from "vscode";
import * as yamlMetadata from "../helper/yaml-metadata";
import * as common from "./common";
import * as utilityHelper from "./utility";
// tslint:disable-next-line: no-var-requires
const jsyaml = require("js-yaml");
/* tslint:disable:no-var-requires max-classes-per-file */

const lodash = require("lodash.merge");
const matcher = require("matcher");

export enum MetadataSourceContentType { MarkdownFile, DocFxFile, GlobalMetadataFx, FileMetadataFx, YamlContent }

export const dateTimeFormat = "MM/dd/yyyy";

export class EmptyYamlHeaderError extends Error {
    public constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, EmptyYamlHeaderError.prototype);
    }
}

export class MetadataContentBase {
    public MetadataType: MetadataSourceContentType;
    public OriginalData: string;
    public FileName: string;
    public RawMetadata: string;

    constructor(metadataType: MetadataSourceContentType, dataContent: string, fileName: string, rawMetadata: string) {
        this.MetadataType = metadataType;
        this.OriginalData = dataContent;
        this.FileName = fileName;
        this.RawMetadata = rawMetadata;
    }

    public getYamlMetadataContent(): string {
        try {
            return this.getYamlMetadataContentInner();
        } catch (err) {
            this.checkSyntaxError(err.toString());

            throw new Error("Yaml header could not be parsed.  If any free-form text spans multiple lines, please wrap the entire string in quotes.");
        }
    }

    public getRawMetadataContent(): string {
        try {
            return this.getRawMetadataContentInner();
        } catch (err) {
            throw new Error("Yaml header could not be parsed.  If any free-form text spans multiple lines, please wrap the entire string in quotes.");
        }
    }

    public getYamlMetadataContentInner(): string {
        return this.OriginalData;
    }

    public getRawMetadataContentInner(): string {
        return this.RawMetadata;
    }

    private translateSyntaxErrorMessage(errMsg: string): string {
        if (errMsg.indexOf("ms.date:") >= 0) {
            return "ms.date format is incorrect. Change to " + dateTimeFormat + " and re-run validation.";
        } else if (errMsg.indexOf("Malformed inline YAML string") >= 0) {
            return errMsg.replace("Malformed inline YAML string", "Incorrect YAML syntax in string") + ". Please fix YAML syntax and re-run validation.";
        }
        return errMsg;
    }

    private checkSyntaxError(errMsg: string) {
        if (errMsg.indexOf("<ParseException> ") >= 0) {
            errMsg = errMsg.replace("<ParseException> ", "");
            throw new Error(this.translateSyntaxErrorMessage(errMsg).toString());
        }
    }

}

export class YamlMetadataContent extends MetadataContentBase {
    public MetadataType!: MetadataSourceContentType;
    public OriginalData!: string;
    public FileName!: string;
    public RawMetadata!: string;

    constructor(originalContent: string, fileName: string, rawMetadata: string = "") {
        super(MetadataSourceContentType.YamlContent, originalContent, fileName, rawMetadata);
    }

    public getYamlMetadataContentInner(): string {
        return this.OriginalData;
    }

    public getRawMetadataContentInner(): string {
        return this.RawMetadata;
    }
}

export class MarkdownFileMetadataContent extends MetadataContentBase {

    constructor(originalContent: string, fileName: string, rawMetadata: string = "") {
        super(MetadataSourceContentType.MarkdownFile, originalContent, fileName, rawMetadata);
    }

    public getYamlMetadataContentInner(): string {
        const re = /^(-{3}(?:\n|\r)([\w\W]+?)(?:\n|\r)-{3})?([\w\W]*)*/;
        const results = re.exec(utilityHelper.stripBOMFromString(this.OriginalData.toString()) || "{}");

        if (results !== null) {
            const result = results[1];
            const trimmed = common.rtrim(result.trim(), "---");
            const parsed = jsyaml.load(trimmed);
            if (parsed === null) {
                // fix if yaml header is empty or contains only comments
                return "";
            }
            return JSON.stringify(parsed);
        }
        return "";
    }

    public getRawMetadataContentInner(): string {
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

export class DocFxMetadataContent extends MetadataContentBase {
    private referenceTemplateFileName: string;

    constructor(originalContent: string, fileName: string, referenceTemplateFileName: string, rawMetadata: string = "") {
        super(MetadataSourceContentType.DocFxFile, originalContent, fileName, rawMetadata);
        this.referenceTemplateFileName = referenceTemplateFileName;
    }

    public Expand(): YamlMetadataContent[] {
        try {
            const result: yamlMetadata.YamlMetadataContent[] = [];
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
        } catch (err) {
            throw new Error("Yaml headers could not be parsed from file '" + this.FileName + "'. Original error :" + err.toString());
        }
    }
}

export class GlobalFxMetadataContent extends MetadataContentBase {
    constructor(originalContent: string, fileName: string, rawMetadata: string = "") {
        super(MetadataSourceContentType.GlobalMetadataFx, originalContent, fileName, rawMetadata);
    }

    public getYamlMetadataContentInner(): string {
        if (this.OriginalData === undefined || this.OriginalData === "") {
            return "";
        }

        const parsed = JSON.parse(utilityHelper.stripBOMFromString(this.OriginalData.toString()) || "{}");
        return JSON.stringify(parsed);
    }
}

export class FileFxMetadataContent extends MetadataContentBase {
    private referenceTopicFileName: string;

    constructor(originalContent: string, fileName: string, referenceTemplateFileName: string, rawMetadata: string = "") {
        super(MetadataSourceContentType.FileMetadataFx, originalContent, fileName, rawMetadata);
        this.referenceTopicFileName = referenceTemplateFileName;
    }

    public getYamlMetadataContentInner(): string {
        // parses file base metadata passed from from the docfx.json file. If filepattern is speficied it's taken only if
        // this.referenceTopicFileName is matched.

        const parsed = JSON.parse(utilityHelper.stripBOMFromString(this.OriginalData.toString()) || "{}");
        const returned: any = {};
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
                } else {
                    if (atributeItem instanceof String) {
                        returned[key] = parsed[key];
                    }
                }
            }
        }

        return JSON.stringify(returned);
    }

    private matchFilePattern(referenceFile: string, filePattern: string): boolean {
        const newSearchPattern = path.dirname(this.FileName).replace(/\\/g, "/") + "/" + filePattern; // normalizes path and replaces backslashes
        const filePath = referenceFile.replace(/\\/g, "/"); // normalizes path and replaces backslashes
        const isJS = matcher.isMatch(filePath, newSearchPattern);
        return isJS;
    }
}

/**
 * Returns docfx.json metadata representation if find in the specified directory.
 */
export function findDocFxMetadataForDir(dirname: string, referenceTopicFileName: string): DocFxMetadataContent | undefined {
    const searchedMetadata = path.join(dirname, GetDocFxMetadataName());
    if (existsSync(searchedMetadata)) {
        return new DocFxMetadataContent(readFileSync(searchedMetadata, "utf8"), searchedMetadata, referenceTopicFileName);
    }
    return;
}

/**
 * Merges 2 metadata content specified by the holder class. Higher priority overwrites lower priority metadata.
 * Return type is yaml metadata content only.
 */
function mergeYamlMetadata(higherPriorityMetadata: MetadataContentBase, lowerPriorityMetadata: MetadataContentBase): YamlMetadataContent {
    if (higherPriorityMetadata === undefined) {
        throw new RangeError("higherPriorityMetadata must be defined.");
    }

    if (lowerPriorityMetadata === undefined) {
        throw new RangeError("lowerPriorityMetadata must be defined.");
    }

    const contentHi = higherPriorityMetadata.getYamlMetadataContent();
    const contentLo = lowerPriorityMetadata.getYamlMetadataContent();
    const contentRaw = higherPriorityMetadata.getRawMetadataContent();
    let mergedContent: string;
    const newFileName = higherPriorityMetadata.FileName;

    if (contentHi === undefined || contentHi === "") {
        if (contentLo === undefined) {
            mergedContent = "";
        } else {
            mergedContent = contentLo;
        }
    } else if (contentLo === undefined || contentLo === "") {
        if (contentHi === undefined) {
            mergedContent = "";
        } else {
            mergedContent = contentHi;
        }
    } else {
        const yamlFrontHi = jsyaml.load(contentHi);
        const yamlFrontLo = jsyaml.load(contentLo);
        const mergedContentAny = lodash(yamlFrontLo, yamlFrontHi);
        mergedContent = JSON.stringify(mergedContentAny);
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
export function mergeMetadata(priorityQueue: PriorityQueue<MetadataContentBase>): MetadataContentBase {
    if (priorityQueue === undefined) {
        throw new RangeError("priorityStack must be defined.");
    }

    const stack = new Stack<MetadataContentBase>();
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
                    const docfxContent = item as DocFxMetadataContent;
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

/**
 * merges all metadata in the passed stack specified by content holder class. Merging is done from the top of the stack to the bottom.
 * Bottom item has highest priotity.
 * Does not expand docfx.json content representation!
 */
function mergeMetadataFromTop(stack: Stack<MetadataContentBase>): MetadataContentBase {
    let currentMergedItem = stack.pop()!;
    while (!stack.isEmpty()) {
        currentMergedItem = mergeYamlMetadata(stack.pop()!, currentMergedItem);
    }

    return currentMergedItem;
}

function GetDocFxMetadataName(): string {
    return "docfx.json";
}

/**
 * Return true if cursor is within the YAML Header
 * @param
 */
export function isCursorInsideYamlHeader(editor: TextEditor) {
    const docText = editor.document.getText();
    const secondDashPosition = docText.indexOf("---", 4);
    const range = new Range(0, 0, editor.selection.end.line, editor.selection.end.character);
    const cursorText = editor.document.getText(range);
    const isInHeader = cursorText.length < secondDashPosition;
    return isInHeader;
}
