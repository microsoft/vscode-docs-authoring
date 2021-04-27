import { markdownQuickPick } from "../quick-pick-menu-controller";
import { MarkdownEnum } from "./markdown-enum";
import { ContentMatch } from "./content-match";
import { Helpers } from "./helpers";
import * as path from 'path';
import { LinkTypes } from "./linktypes-enum";
import { Stack } from 'stack-typescript';
import { FileTypeEnum } from "./filetype-enum";
import { SrvRecord } from "dns";
import { headingTextRegex } from "../../helper/getHeader";

export class ContentBlock {
    private _name : string;
    public get name() : string {
        return this._name;
    }
    public set name(v : string) {
        this._name = v;
    }

    private _tab: string;
    public get tab(): string {
        return this._tab;
    }
    public set tab(v: string) {
        this._tab = v;
    }

    private _zone: string;
    public get zone(): string {
        return this._zone;
    }
    public set zone(v: string) {
        this._zone = v;
    }
    
    private _text : string;
    public get text() : string {
        return this._text;
    }
    public set text(v : string) {
        this._text = v;
    }
    
    private _artifactType : MarkdownEnum;
    public get artifactType() : MarkdownEnum {
        return this._artifactType;
    }
    public set artifactType(v : MarkdownEnum) {
        this._artifactType = v;
    }
    
    
    public get start() : number {
        return this._index;
    }
    public set start(v: number) {
        this._index = v;
    }
    
    private _length : number;
    public get length() : number {
        return this._length;
    }
    public set length(v : number) {
        this._length = v;
    }
    
    private _groups : Map<string, string>;
    public get groups() : Map<string, string> {
        return this._groups;
    }
    public set groups(v : Map<string, string>) {
        this._groups = v;
    }
        

    private _fromInclude : boolean;
    public get fromInclude() : boolean {
        return this._fromInclude
    }
    public set fromInclude(v : boolean) {
        this._fromInclude = v;
    }
    
    
    private _fileName : string;
    public get fileName() : string {
        return this._fileName;
    }
    public set fileName(v : string) {
        this._fileName = v;
    }


    private _blockText: string;
    public get blockText(): string {
        return this._blockText;
    }
    public set blockText(v: string) {
        this._blockText = v;
    }
    
    private _innerBlocks : ContentBlock[] = [];
    public get innerBlocks() : ContentBlock[] {
        return this._innerBlocks;
    }
    public set innerBlocks(v : ContentBlock[]) {
        this._innerBlocks = v;
    }
    
    
    private _allInnerBlocksList : ContentBlock[] = [];
    public get allInnerBlocksList() : ContentBlock[] {
        return this._allInnerBlocksList;
    }
    public set allInnerBlocksList(v : ContentBlock[]) {
        this._allInnerBlocksList = v;
    }
    
    
    private _parent : ContentBlock;
    public get parent() : ContentBlock {
        return this._parent;
    }
    public set parent(v : ContentBlock) {
        this._parent = v;
    }

    
    private _index : number;
    public get index() : number {
        return this._index;
    }
    public set index(v : number) {
        this._index = v;
    }
    
    
    private _isParagraph : boolean;
    public get isParagraph() : boolean {
        return this._isParagraph;
    }
    public set isParagraph(v : boolean) {
        this._isParagraph = v;
    }
    
    
    public get headerNumber() : number {    
        if (this.groups.has("HeaderNumberValue"))
        {
            var num: number = +this.groups.get("HeaderNumberValue");
            return num;        
        }
        else
            return -1;        
    }
    
    
    private _startLine : number;
    public get startLine() : number {
        return this._startLine;
    }
    public set startLine(v : number) {
        this._startLine = v;
    }
        
    public containsContentBlock(block: ContentBlock) {
        return block.start >= this.index && (block.start + block.length) <= (this.index + this.length);
    }

    public containsContentMatch(match: ContentMatch) {
        return match.index >= this.index && (match.index + match.length) <= (this.index + this.length);
    }
    
    private _endLine : number;
    public get endLine() : number {
        return this._endLine;
    }
    public set endLine(v : number) {
        this._endLine = v;
    }

    public static deepCopy<T>(source: T): T {
        return Array.isArray(source)
        ? source.map(item => this.deepCopy(item))
        : source instanceof Date
        ? new Date(source.getTime())
        : source && typeof source === 'object'
              ? Object.getOwnPropertyNames(source).reduce((o, prop) => {
                 Object.defineProperty(o, prop, Object.getOwnPropertyDescriptor(source, prop));
                 o[prop] = this.deepCopy(source[prop]);
                 return o;
              }, Object.create(Object.getPrototypeOf(source)))
        : source as T;
      }

    constructor() {

    }
    
    public setCodeFence(text: string, tag: string, filename: string = "") {
        this.text = text;
        this.artifactType = MarkdownEnum.CodeFence;
        this.fileName = filename;
        this.groups = new Map([
            ["0", text],
            ["code", text],
            ["tag", tag]
        ]);
    }

    public setText(text: string) {
        this.text = text;
        this.groups = new Map([
            ["0", text],            
        ]); 
    }

    public setTextWithIndex(text: string, i: number, l:number, filename: string = "") {
        this.text = text;
        this.groups = new Map([
            ["0", text]
        ]); 
        this.fileName = filename;
        this.start = i;
        this.length = l;
    }    

    public getGroup(group: string): string {
        var returnValue = this.groups[group];
        if (undefined == returnValue) {
            returnValue = "";
        }

        return returnValue;
    }

    public setLink(link: Map<string, string>, i: number, l: number, filename: string = "") {
        this.groups = new Map(link);
        this.fileName = filename;
        this.start = i;
        this.length = l;
        this.artifactType = MarkdownEnum.Link;

        var file = this.groups.get("file");
        if (file != undefined && !ContentMatch.externalLink.test(file)) {
            var root = path.dirname(this.fileName);
            var fixedPath = Helpers.fixPath(root, file);
            if (fixedPath != undefined)
                this.groups.set("hrefpath", fixedPath);
        }
        else if (file != undefined && file.search(/\/azure\/.+/gim) != undefined) {
            this.groups.set("hrefpath", file.replace(/(http(s)?:\/\/docs\.microsoft\.com)?\/azure\//gim, "articles/"));
        }

        var hrefPath = this.groups.get("hrefPath");
        if (hrefPath !== undefined) {
            this.groups.set("filename", Helpers.getFileName(hrefPath));
        }

        if (file != undefined) {
            if (file.indexOf("/") == 0) {
                this.groups.set("linkType", LinkTypes.Internal.toString());
            }
            else if (file.indexOf("github") >= 0) {
                this.groups.set("linkType", LinkTypes.GitHub.toString());
            }
            else if (!Helpers.strIsNullOrEmpty(this.getGroup("selector"))) {
                this.groups.set("linkType", LinkTypes.Selector.toString());
            }
            else if (ContentMatch.includeFile.test(this.getGroup("file"))) {
                this.groups.set("linkType", LinkTypes.Include.toString());
            }
            else if (ContentMatch.mediaFile.test(this.getGroup("file"))) {
                this.groups.set("linkType", LinkTypes.Media.toString());
            }
            else if (ContentMatch.signUp.test(this.getGroup("file"))) {
                this.groups.set("linkType", LinkTypes.SignUp.toString());
            }
            else
                this.groups.set("linkType", LinkTypes.External.toString());
        }

        this.groups.set("0", this.groups.get("link"));
        this.text = this.groups.get("link");
    }

    public static *depthFirstTreeTraversal(root: ContentBlock, children: (node: ContentBlock) => ContentBlock[]): IterableIterator<ContentBlock> {
        var stack = new Stack<ContentBlock>();
        stack.push(root);
        while (stack.length != 0) {
            var current = stack.pop();
            // If you don't care about maintaining child order then remove the Reverse.
            for (var child of children(current).reverse())
                stack.push(child);

            yield current;
        }
    }

    public AllInnerBlocks(): ContentBlock[] {
        let list: ContentBlock[] = [];
        for (var item of ContentBlock.depthFirstTreeTraversal(this, (e) => e.innerBlocks)) {
            list.push(item);
        }

        return list;
    }

    public static getAllChildBlocks(startingBlock: ContentBlock, result: ContentBlock[]): ContentBlock[]
    {
        var inner = startingBlock.innerBlocks;
        for (var child of inner)
        {
            result.push(child);

            // this will internally add to result
            ContentBlock.getAllChildBlocks(child, result);
        }

        return result;
    }        

    public static getAllParentBlocks(node: ContentBlock, parentlist: ContentBlock[]): ContentBlock[] {    
        if (node.parent == null)
            return parentlist;

        parentlist.push(node.parent);
        ContentBlock.getAllParentBlocks(node.parent, parentlist);
        return parentlist;
    }

    public allChildBlocks(): ContentBlock[]{
        let start: ContentBlock[] = [];
        return ContentBlock.getAllChildBlocks(this, start);
    }

    public allParentBlocks() {
        let start: ContentBlock[] = [];
        return ContentBlock.getAllParentBlocks(this, start);
    }

    public getParent(type: MarkdownEnum): ContentBlock {
        var parent = this.parent;
        let checkedParents: ContentBlock[] = [];
        checkedParents.push(parent);
        while (parent != null && parent.artifactType != type) {
            parent = parent.parent;

            if (checkedParents.indexOf(parent) >= 0)
                break;

            checkedParents.push(parent);
        }

        return parent;
    }

    public topParent(): ContentBlock{
        if (null != this.parent)
            return this.parent.topParent();
        else 
            return this;
    }

    public setIncludeFile(filename: string) {
        this.fromInclude = true;
        this.fileName = filename;
        this.innerBlocks.forEach(e => e.setIncludeFile(filename));
    }

    public static extractIncludeBlocks(artifact: ContentMatch, filename: string): ContentBlock[] {
        var file = artifact.getGroup("file");
        filename = path.relative(filename, file);
        return Helpers.readInclude(filename);
    }        

    public static splitIntoLines(content: string): ContentMatch[]{
        return ContentMatch.getMatches(content, ContentMatch.line);
    }

    public static getHeaderBlocks(content: string, codeFences?: ContentMatch[], fileName?: string) {
        var Headers = ContentMatch.getHeaders(content);
        let Blocks: ContentBlock[] = [];
        var LastIndexMetadata = ContentMatch.getLastIndexMetadata(content, fileName);
        var hasHeaders = true;
        var hasH1 = false;
        var currentParent = null;
        hasHeaders = !(Headers.length == 0 || (codeFences.length % 2 == 1));
        let first: ContentMatch = null;
        if (hasHeaders) {
            first = Headers[0];
            var header = first.getGroup("header");
            hasH1 = ContentMatch.links.test(header) && ContentMatch.tabAnchor.test(header);                
        }

        if (!hasHeaders || !hasH1) {
            let currentParent = new ContentBlock();
            currentParent.text = "";
            currentParent.groups = new Map<string, string>(
                [
                    ["0", ""],
                    ["HeaderIndex", "-1"],
                    ["HeaderNumber", "H0"],
                    ["HeaderName", "None"]
                ]
            );

            currentParent.blockText = content.substring(LastIndexMetadata);
            
            if (hasHeaders) {
                currentParent.blockText = "";
                currentParent.start = 0;
                currentParent.length = 0;

                if (null != first) {
                    currentParent.length = first.index;
                    currentParent.blockText = content.substring(0, first.index);
                }
            }

            Blocks.push(currentParent);
        }

        let nonCodeHeaders = Headers.filter(e => !ContentMatch.inCodeFence(e, codeFences) && e.index >= LastIndexMetadata);
        for (let i = 0; i < nonCodeHeaders.length; i++)
        {
            var match = nonCodeHeaders[i];
            var header = match.getGroup("header");

            var hMatch = ContentMatch.getMatches(header, ContentMatch.headerNumber)[0];
            var headerNumber = header.split('#').length - 1;
            if (null != hMatch)
                headerNumber = hMatch.getGroup("number").length;
            var index = match.index;
            var text = "";

            if ((i + 1) < nonCodeHeaders.length) {
                text = content.substring(index, nonCodeHeaders[i + 1].index - index);
            }
            else {
                text = content.substring(index, content.length - index);
            }

            var length = 0;
            if ((i + 1) < nonCodeHeaders.length)
                length = nonCodeHeaders[i + 1].index - match.index;
            else
                length = content.length - match.index;

            var currentBlock = new ContentBlock();
            currentBlock.blockText = text;
            currentBlock.artifactType = MarkdownEnum.Header;
            currentBlock.text = header;
            currentBlock.index = i;
            currentBlock.start = match.index;
            currentBlock.groups = new Map<string, string>(
                [
                    ["0", header],
                    ["HeaderIndex", `${i}`],
                    ["HeaderNumber", `$H{headerNumber}`],
                    ["HeaderName", header],
                    ["HeaderNumberValue", `${headerNumber}`]
                ]
            );

            if (ContentMatch.links.test(header) && ContentMatch.tabAnchor.test(header)) {
                var conceptualTab = currentBlock;
                currentBlock.artifactType = MarkdownEnum.ConceptualTab;
                currentBlock.groups["name"] = header;
            }

            Blocks.push(currentBlock);
        }

        return Blocks;
    }

    public static splitContentIntoBlocks(filename: string, content: string, isInclude: boolean): ContentBlock[] {
        var AllCodeFences = ContentMatch.getCodeFences(content);
        var HeaderBlocks = ContentBlock.getHeaderBlocks(content, AllCodeFences);
        HeaderBlocks.forEach(e => e.fileName = filename);
        var linkRefs = ContentMatch.getLinkRefs(content);

        if ((AllCodeFences.length % 2) == 1) {
            console.log("Odd number of code fences!");
            return [];
        }            

        for (let i = 0; i < HeaderBlocks.length; i++)
        {
            var header = HeaderBlocks[i].getGroup("HeaderName");
            HeaderBlocks[i].extractInnerBlocks(filename, linkRefs);

            if (isInclude)
                HeaderBlocks[i].setIncludeFile(filename);            
        }
        
        return HeaderBlocks;
    }

    public static populateBlockDetails(content: string, filename: string, blocks: ContentBlock[])
    {
        var zones = ContentMatch.getZones(content);
        var zoneList: string[] = [];
        var tabList: string[] = [];
        let artifactsInTabs: ContentBlock[] = [];
        let artifactsInZones: ContentBlock[] = [];
        for (var zone of zones) {
            var name = zone.getGroup("name");
            if (!Helpers.strIsNullOrEmpty(name))
                zoneList.push(name);
        }

        var conceptualTabs = blocks.filter(e => e.artifactType == MarkdownEnum.ConceptualTab);
        for (var tab of conceptualTabs)
        {
            var name = tab.getGroup("name");
            if (!Helpers.strIsNullOrEmpty(name))
                tabList.push(name);
        }

        // Set up zone pivot information.
        for (var block of blocks)
        {
            var zone = zones.filter(e => e.containsContentBlock(block))[0];
            if (block.artifactType  != MarkdownEnum.ConceptualTab)
            {
                var tab = blocks.filter(e => e.artifactType == MarkdownEnum.ConceptualTab).filter(f => f.containsContentBlock(block))[0];
                if (tab !== undefined) {
                    block.tab = tab.getGroup("name");
                    artifactsInTabs.push(block);
                }
            }

            if (null != zone)
            {
                block.zone = zone.getGroup("name");
                artifactsInZones.push(block);
            }
        }

        var HeaderBlocks = blocks.filter(e => e.artifactType == MarkdownEnum.Header).sort((a, b) => b.start - a.start);

        if (HeaderBlocks.length == 0)
            return;
            
        var stack = new Stack<ContentBlock>();
        stack.push(HeaderBlocks[0]);
        for (let i = 1; i < HeaderBlocks.length; i++)
        {
            var thisHeader = HeaderBlocks[i];
            if (ContentMatch.links.test(thisHeader.text) && ContentMatch.tabAnchor.test(thisHeader.text)) {
                stack.top.innerBlocks.push(thisHeader);
                thisHeader.parent = stack.top;
                continue;
            }

            if (thisHeader.headerNumber == stack.top.headerNumber) {
                stack.pop();
                if (stack.length > 0) {
                    stack.top.innerBlocks.push(thisHeader);
                    thisHeader.parent = stack.top;
                }
                stack.push(thisHeader);
            }
            else if (thisHeader.headerNumber > stack.top.headerNumber) {
                stack.top.innerBlocks.push(thisHeader);
                thisHeader.parent = stack.top;
                stack.push(thisHeader);
            }
            else {                    
                while (stack.length > 0 && thisHeader.headerNumber <= stack.top.headerNumber) {
                    stack.pop();
                }

                if (stack.length > 0) {
                    stack.top.innerBlocks.push(thisHeader);
                    thisHeader.parent= stack.top;
                }
                stack.push(thisHeader);
            }
        }

        HeaderBlocks.forEach(e => e.innerBlocks = e.innerBlocks.sort((a, b) => b.start - a.start));
    }

    public copyParentInfo(parent: ContentBlock) {        
        try
        {
            let info_to_copy: string[] = ["HeaderNumberValue", "HeaderNumber", "HeaderIndex", "HeaderName", "ToCNodePath", "TopNodeName"];
            parent.groups.forEach((key, value) => {
                if (info_to_copy.indexOf(key))
                    this.groups.set(key, value);
            });                

            this.index = parent.innerBlocks.length;
            parent = parent;
        }            
        catch (e)
        {
            console.log(e);
        }
    }

    public addInnerBlock(block: ContentBlock) {
        if (block.length > 0) {
            if (block.artifactType != MarkdownEnum.Header && block.artifactType != MarkdownEnum.ToC_Node && block.artifactType != MarkdownEnum.ToC_TopNode)
                block.copyParentInfo(this);
            var inner = this.innerBlocks.filter(e => !e.fromInclude).filter(f => block.start >= f.start && (((block.start + block.length) - 1)) <= ((f.start + f.length) - 1)).sort((a, b) => b.length - a.length)[0];
            if (inner !== undefined)
                inner.addInnerBlock(block);
            else {
                var newChildBlocks = this.innerBlocks.filter(f => f.start >= block.start && (((f.start + f.length) - 1)) <= ((block.start + block.length) - 1)).sort((a, b) => b.length - a.length);
                    
                for (var child of newChildBlocks) {
                    Helpers.removeAt(this.innerBlocks, child);
                    block.addInnerBlock(child);
                }

                this.innerBlocks.push(block);                    
            }
        }
    }

    public extractCodeFenceTokens(tag: string, codeFence:ContentBlock, fileName?: string) {
        var content = codeFence.text;
        this.addInnerBlock(codeFence);

        // This will need rewritten with interfaccs
    }

    public static extractSnippet(artifact: ContentMatch, filename: string): ContentBlock {
        if (!artifact.groups.has("snippet") || !artifact.groups.has("file")) {
            console.log(`Cannot retrieve code for ${artifact.getGroup("0")}`);
        }

        var file = artifact.getGroup("file");

        var snippetname = artifact.getGroup("snippet");
        var snippet = Helpers.readSnippetFile(snippetname, file, filename);
        if (null == snippet)
            return null;            
        
        let content = snippet;
        var lines = ContentBlock.splitIntoLines(content);

        if (artifact.groups.has("range")) {
            var ranges = artifact.getGroup("range").split(",");
            let lineNumbers: Set<number> = new Set<number>();
            for (var range in ranges)
            {
                if (range.indexOf("-") >= 0) {
                    var portions = range.split("-");
                    if (portions.length != 2) {
                        console.log(`"Could not get ranges for ${range} for ${file}`);
                        continue;
                    }

                    var start = -1;
                    var end = -1;
                    start = +portions[0];
                    end = +portions[1];
                    if (start >= 0 && end >= 0) {
                        start--;
                        for (let i = start; i < end; i++)
                            lineNumbers.add(i);
                    }
                }
                else {
                    var line = -1;
                    line = +range;
                    if (line >= 0) {
                        line--;
                        lineNumbers.add(line);
                    }
                }
            }

            let join: String[] = [];
            try {
                content = Array.from(lineNumbers.values()).filter(e => e >= 0 && e <= lines.length).map(e => lines[e].getGroup("line")).join("\r\n");
            }
            catch (e)
            {
                console.log(e);
            }
        }
        else if (artifact.groups.has("id") || artifact.groups.has("QS_id")) {
            var id = artifact.getGroup("id");
            if (!Helpers.strIsNullOrEmpty(artifact.getGroup("QS_id")))
                id = artifact.getGroup("QS_id");
            var startLine = lines.filter(e => new RegExp(`<${id}>`, "gim").test(e.getGroup("0")))[0];
            var endLine = lines.filter(e => new RegExp(`</${id}>`, "gim").test(e.getGroup("0")))[0];            

            if (start !== undefined && end !== undefined && start != end) {
                var startIndex = lines.indexOf(startLine);
                var endIndex = lines.indexOf(endLine);
                while (lines[startIndex].getGroup("line").startsWith("#") && startIndex < endIndex) { startIndex++; }

                if (endIndex > startIndex) {
                    content = lines.slice(startIndex, endIndex - startIndex).map(e => e.getGroup("line")).join("\r\n");
                }
                else
                    console.log(`Could not get snippet ${id} for ${file}`);
            }
            else {
                console.log(`Could not get snippet ${id} for ${file}. Returning all content`);
            }
        }

        var block = new ContentBlock();
        block.text = content;
        block.artifactType = MarkdownEnum.CodeFence;
        block.start = artifact.index;
        block.length = content.length;
        block.fileName = file;
        block.fromInclude = true;
        var text = "";
        if (artifact.groups.has("currenttag") && Helpers.strIsNullOrEmpty(artifact.getGroup("currenttag")))
            text = artifact.getGroup("currenttag");
           
        block.groups = new Map(
            [
                ["0", content],
                ["code", content],
                ["tag", text]
            ]
        ); 

        return block;
    }

    public extractInnerBlocks(filename: string, refs?: ContentMatch[]) {
        let content = this.blockText;
        var codeFences = ContentMatch.getCodeFences(content);

        if (!Helpers.strIsNullOrEmpty(content)) {
            if ((codeFences.length % 2) == 0 && codeFences.length != 0) {
                var INDEX = 0;
                for (let j = 0; j < codeFences.length; j += 2) {
                    var tag = "";
                    if (codeFences[j].groups.has("currenttag") && !Helpers.strIsNullOrEmpty(codeFences[j].getGroup("currenttag"))) {
                        tag = codeFences[j].getGroup("currenttag").trim().toLowerCase();
                    }

                    var beforeCodeBlock = content.substring(INDEX, (codeFences[j].index - INDEX));

                    this.extractArtifacts(beforeCodeBlock, filename, codeFences, refs);

                    INDEX = codeFences[j + 1].index + codeFences[j + 1].length;
                    var insidecodeblock = content.substring(codeFences[j].index, (INDEX - codeFences[j].index));
                    var codeFence = new ContentBlock();
                    codeFence.setCodeFence(insidecodeblock, tag);
                    codeFence.start = codeFences[j].index + this.start,
                        codeFence.length = INDEX - codeFences[j].index;
                    this.fileName = filename;                    

                    this.extractCodeFenceTokens(tag, codeFence, filename);
                }

                var afterCodeBlocks = content.substring(INDEX, content.length - INDEX);
                this.extractArtifacts(afterCodeBlocks, filename, codeFences, refs);
            }
            else if (codeFences.length == 0) {
                this.extractArtifacts(content, filename, codeFences, refs);
            }
            else {
                console.log("Odd Number of Code Fences");
                this.extractArtifacts(content, filename, codeFences, refs);
            }
        }
    }    

    public getHrefPath(href: string): string {
        var path = "";
        if (!Helpers.strIsNullOrEmpty(href) && !ContentMatch.externalLink.test(href)) {
            href = href.split('?')[0].split('#')[0];
            if (Helpers.strIsNullOrEmpty(this.fileName))
                return "";
            var root = this.fileName.replace(Helpers.getFileName(this.fileName), "");
            path = Helpers.fixPath(root, href);
        }
        return path;
    }

    public extractParagraphs(content: string, fileName?: string, startIndex: number = 0) {
        // Todo : Test if this works.
        // Make sure indexes are correct with newlines taken out.
        content = content.replace(/\r\n$/gim, "");
        var paragraphs = ContentMatch.getMatches(content, ContentMatch.newLineX2);
        var INDEX = 0;
        var thisStart = (this.start + this.text.length);
        if (startIndex != 0)
            thisStart = startIndex;

        for (let i = 0; i < paragraphs.length; i++)
        {
            var p = content.substring(INDEX, paragraphs[i].index - INDEX);
            var c = new ContentBlock();
            c.blockText = content;
            c.start = INDEX + thisStart;
            c.length = p.length;
            c.fileName = fileName;
            c.artifactType = MarkdownEnum.Paragraph;
            c.isParagraph = true;
            this.addInnerBlock(c);
            INDEX = paragraphs[i].index + paragraphs[i].length;
        }

        var after = content.substring(INDEX, content.length - INDEX);
        c = new ContentBlock();
        c.blockText = content;
        c.start = INDEX + thisStart;
        c.length = p.length;
        c.fileName = fileName;
        c.artifactType = MarkdownEnum.Paragraph;
        c.isParagraph = true;
        this.addInnerBlock(c);       
    }    

    public extractListRows(contentBlock: ContentBlock, fileName?: string){
        this.addInnerBlock(contentBlock);
        var content = contentBlock.text;
        var pattern = ContentMatch.bulletRow;
        if (contentBlock.groups.has("spaces")) {
            var spaces = contentBlock.getGroup("spaces").length;
            if (spaces > 0)
                pattern = new RegExp(ContentMatch.padPatternSpaces(pattern.source, spaces));
        }

        for (var bulletRow of ContentMatch.getMatches(content, pattern))
        {
            if (bulletRow.groups.has("bullet") && !Helpers.strIsNullOrEmpty(bulletRow.getGroup("bullet"))) {
                var c = new ContentBlock();
                c.text = bulletRow.getGroup("bullet");
                c.index = bulletRow.index + contentBlock.start;
                c.length = bulletRow.length;
                c.fileName = this.fileName;
                c.artifactType = MarkdownEnum.ListRow;               
                contentBlock.addInnerBlock(c);
            }
        }
    }

    public extractTableData(contentBlock: ContentBlock, fileName?: string) {
        var content = contentBlock.text;
        var contentMatches = ContentMatch.getMatches(content, ContentMatch.tableRow);
        if (contentMatches.length > 2) {
            this.addInnerBlock(contentBlock);
            let columns: ContentBlock[] = [];
            var tableData = contentMatches[0];
            var formatData = contentMatches[1];
            if (tableData !== undefined)
                console.log("Table Data cannot be NULL!!");

            var tableContent = contentMatches.slice(2);
            var columnsCount = 0;
            if (formatData !== undefined) {
                var columnInfo = ContentMatch.getMatches(formatData.getGroup("row"), ContentMatch.tableColumn);
                columnsCount = columnInfo.length;
            }
            else
                console.log("Issues Extracting Table Data");

            var firstRow = tableData.getGroup("row");
            var columnMatches = ContentMatch.getMatches(firstRow, ContentMatch.pipe);
            if (columnMatches.length == 0)
                console.log("Table Columns were NULL!");
            var noBorders = false;
            if (columnMatches.length < columnsCount)
                noBorders = true;

            var INDEX = 0;
            var column = 0;
            var length = 0;
            for (let i = 0; i < columnMatches.length; i++)
            {
                if (noBorders) {
                    length = columnMatches[i].index - INDEX;
                    var value = Helpers.strTrimSpaces(firstRow.substring(INDEX, length))
                    INDEX = columnMatches[i].index + columnMatches[i].length;

                    if (column >= columnsCount)
                        console.log("Issues Extracting Table Data");

                    var tmp = new ContentBlock();
                    tmp.text = value;
                    tmp.start = INDEX + tableData.index;
                    tmp.length = length;
                    tmp.artifactType = MarkdownEnum.TableColumn;
                    tmp.fileName = fileName;
                    tmp.groups["ColumnName"] = value;
                    columns.push(tmp);
                    contentBlock.addInnerBlock(tmp);
                    column++;

                    if ((i + 1) == columnMatches.length) {
                        length = firstRow.length - INDEX;

                        value = firstRow.substring(INDEX, length);
                        value = value.replace(ContentMatch.anyNewLines, "");
                        value = Helpers.strTrimSpaces(value);
                        tmp = new ContentBlock();
                        tmp.text = value;
                        tmp.index = INDEX + tableData.index;
                        tmp.length = length;
                        tmp.artifactType = MarkdownEnum.TableColumn;
                        tmp.fileName = fileName;
                        tmp.groups["ColumnName"] = value;
                        columns.push(tmp);
                        contentBlock.addInnerBlock(tmp);
                        column++;
                    }
                }
                else {
                    INDEX = columnMatches[i].index + columnMatches[i].length;
                    length = firstRow.length;
                    if ((i + 1) < columnMatches.length) {
                        length = columnMatches[i + 1].index - INDEX;

                        var value = Helpers.strTrimSpaces(firstRow.substring(INDEX, length));

                        var tmp = new ContentBlock();
                        tmp.text = value;
                        tmp.index = INDEX + tableData.length;
                        tmp.length = length;
                        tmp.artifactType = MarkdownEnum.TableColumn;
                        tmp.fileName = fileName;
                        tmp.groups["ColumnName"] = value;
                        columns.push(tmp);
                        contentBlock.addInnerBlock(tmp);
                        column++;
                    }
                }
            }

            for (var tableRow of tableContent)
            {
                var row = tableRow.getGroup("row");
                var rowValues = ContentMatch.getMatches(row, ContentMatch.tableColumnSplit);
                noBorders = false;
                if (rowValues.length < columns.length)
                    noBorders = true;
                INDEX = 0;
                column = 0;
                for (let i = 0; i < rowValues.length; i++)
                {
                    var length = 0;
                    if (noBorders) {
                        length = rowValues[i].index - INDEX;
                        var value = Helpers.strTrimSpaces(row.substring(INDEX, length));
                        INDEX = rowValues[i].index + rowValues[i].length;
                        var columnName = columns[column].groups["ColumnName"];
                        if (column >= columns.length)
                            console.log("Issues Extracting Table Data");
                        var tmp = new ContentBlock();
                        tmp.text = value;
                        tmp.start = INDEX + tableRow.index;
                        tmp.length = length;
                        tmp.artifactType = MarkdownEnum.TableRow;
                        tmp.fileName = fileName;
                        tmp.groups = new Map(
                            [
                                ["0", value],
                                ["row", value],
                                ["rownumber", `${i}`],
                                ["columnname", columnName],
                                ["colnumber", `${column}`]
                            ]
                        );
                        columns[column].addInnerBlock(tmp);
                    }

                    column++;

                    if ((i + 1) == rowValues.length) {
                        length = row.length - INDEX;

                        value = row.substring(INDEX, length);
                        value = value.replace(ContentMatch.anyNewLines, "");
                        value = Helpers.strTrimSpaces(value);
                        var tmp = new ContentBlock();
                        tmp.text = value;
                        tmp.start = INDEX + tableRow.index;
                        tmp.length = length;
                        tmp.artifactType = MarkdownEnum.TableRow;
                        tmp.fileName = fileName;
                        tmp.groups = new Map(
                            [
                                ["0", value],
                                ["row", value],
                                ["rownumber", `${i}`],
                                ["columnname", columnName],
                                ["colnumber", `${column}`]
                            ]
                        );

                        columns[column].addInnerBlock(tmp);
                        column++;
                    }
                    else {
                        INDEX = rowValues[i].index + rowValues[i].length;
                        length = row.length;
                        if ((i + 1) < rowValues.length) {
                            length = rowValues[i + 1].index - INDEX;
                            var value = Helpers.strTrimSpaces(row.substring(INDEX, length));

                            if (column >= columns.length)
                                column = 0;

                            var columnName = columns[column].groups["ColumnName"];
                            var tmp = new ContentBlock();
                            tmp.text = value;
                            tmp.start = INDEX + tableRow.index;
                            tmp.length = length;
                            tmp.artifactType = MarkdownEnum.TableRow;
                            tmp.fileName = fileName;
                            tmp.groups = new Map(
                                [
                                    ["0", value],
                                    ["row", value],
                                    ["rownumber", `${i}`],
                                    ["columnname", columnName],
                                    ["colnumber", `${column}`]
                                ]
                            );
                            columns[column].addInnerBlock(tmp);
                        }
                        column++;
                    }
                }
            }
        }         
    }    

    public extractArtifacts(content: string, filename: string, codeFences?: ContentMatch[], refs?: ContentMatch[]) {
        let artifacts: ContentMatch[] = [];
        ContentMatch.getLinks(content, codeFences, refs).forEach(e => artifacts.push(e));
        // To Do - Lookup redirections for links.
        ContentMatch.getSnippets(content, codeFences).forEach(e => artifacts.push(e));
        ContentMatch.getBullets(content, codeFences).forEach(e => artifacts.push(e));
        ContentMatch.getTables(content).forEach(e => artifacts.push(e));
        ContentMatch.getNotes(content).forEach(e => artifacts.push(e));
        artifacts = artifacts.sort((a, b) => b.index - a.index);
        var INDEX2 = 0;
        var startIndex = 0;
        var thisStart = (this.start + this.text.length);

        for (let k = 0; k < artifacts.length; k++) {
            if (this.artifactType == MarkdownEnum.ConceptualTab && (artifacts[k].index + this.start) < (this.start + this.text.length)) {
                continue;
            }                

            var beforeArtifactLength = (artifacts[k].index - INDEX2);
            if (beforeArtifactLength > 0) {
                var beforeArtifact = content.substring(INDEX2, beforeArtifactLength);
                if (beforeArtifact.length > 0) {
                    this.extractParagraphs(beforeArtifact, filename);
                }                    

                var newIndex = artifacts[k].index + artifacts[k].length;
                if (newIndex > INDEX2) {
                    INDEX2 = newIndex;
                }                    
            }
            else {
                var newIndex = artifacts[k].index + artifacts[k].length;
                if (newIndex > INDEX2) {
                    INDEX2 = newIndex;
                }                    
            }

            if (artifacts[k].groups.has("link")) {
                if (ContentMatch.includeLabel.test(artifacts[k].getGroup("label")) && !ContentMatch.mediaFile.test(artifacts[k].getGroup("label"))) {
                    var includeBlocks = ContentBlock.extractIncludeBlocks(artifacts[k], filename);
                    includeBlocks = includeBlocks.sort((a, b) => b.start - a.start);
                    if (includeBlocks.length == 1 && includeBlocks[0].artifactType == MarkdownEnum.None) {
                        includeBlocks[0].allChildBlocks().forEach(e => e.copyParentInfo(this));
                    }
                        
                    for (var includeBlock of includeBlocks) {
                        includeBlock.start += (artifacts[k].index + thisStart);
                        includeBlock.innerBlocks.forEach(e => e.start += (artifacts[k].index + thisStart));
                        if (includeBlock.artifactType == MarkdownEnum.None) {
                            includeBlock.innerBlocks.forEach(e => this.addInnerBlock(e));
                        }
                        else {
                            this.addInnerBlock(includeBlock);
                        }
                    }
                }        
                else if (/!code/gim.test(artifacts[k].getGroup("label"))) {
                    var gLabel = artifacts[k].getGroup("label");
                    var gFile = artifacts[k].getGroup("file");
                    var sTag = "";

                    var tag = ContentMatch.getMatches(gLabel, ContentMatch.bangCode)[0];
                    if (tag !== undefined) {
                        sTag = tag.getGroup("tag");
                        artifacts[k].groups.set("currenttag", sTag);
                    }

                    var snippet = ContentMatch.getMatches(gFile, ContentMatch.altSnippet)[0];
                    if (snippet !== undefined) {
                        artifacts[k].groups["file"] = snippet.getGroup("file");
                        artifacts[k].groups["snippet"] = snippet.getGroup("snippet");
                        if (snippet.groups.has("name")) {
                            artifacts[k].groups["name"] = snippet.getGroup("name");
                        }
                            
                        if (artifacts[k].groups.has("QS_range")) {
                            artifacts[k].groups["range"] = artifacts[k].getGroup("QS_range");
                        }                            

                        if (artifacts[k].groups.has("QS_highlight")) {
                            artifacts[k].groups["highlight"] = artifacts[k].getGroup("QS_highlight");
                        }
                            
                    }

                    var codeFence = ContentBlock.extractSnippet(artifacts[k], this.fileName);
                    if (codeFence !== undefined) {
                        this.extractCodeFenceTokens(sTag, codeFence, snippet.getGroup("file"));
                    }                        
                }
                else {
                    var hrefPath = this.getHrefPath(artifacts[k].getGroup("file"));
                    if (!Helpers.strIsNullOrEmpty(hrefPath)) {
                        hrefPath = Helpers.getRedirect(hrefPath);
                        artifacts[k].groups.set("file", hrefPath);
                    }
                }

                var link = new ContentBlock();
                link.setLink(artifacts[k].groups, artifacts[k].index + thisStart, artifacts[k].length, filename)
                this.addInnerBlock(link);
            }
            else if (artifacts[k].groups.has("list")) {
                var list = new ContentBlock();
                list.text = artifacts[k].getGroup("list");
                list.artifactType = MarkdownEnum.BulletedList;
                list.fileName = filename;
                list.start = artifacts[k].index + thisStart;
                list.length = artifacts[k].length;
            
                if (artifacts[k].groups.has("spaces")) {
                    list.groups.set("spaces", artifacts[k].getGroup("spaces"));
                }
                    
                this.extractListRows(list, filename);
            }
            else if (artifacts[k].groups.has("nlist")) {
                var list = new ContentBlock();
                list.text = artifacts[k].getGroup("nlist");
                list.artifactType = MarkdownEnum.NumberedList;
                list.fileName = filename;
                list.start = artifacts[k].index + thisStart;
                list.length = artifacts[k].length;
            
                if (artifacts[k].groups.has("spaces")) {
                    list.groups.set("spaces", artifacts[k].getGroup("spaces"));
                }                    

                this.extractListRows(list, filename);
            }
            else if (artifacts[k].groups.has("table")) {
                var table = new ContentBlock();
                table.text = artifacts[k].getGroup("table");
                table.artifactType = MarkdownEnum.Table;
                table.fileName = filename;
                table.start = artifacts[k].index + thisStart;
                table.length = artifacts[k].length;
                this.extractTableData(table, filename);
            }
            else if (artifacts[k].groups.has("note")) {
                var note = new ContentBlock();

                note.text = artifacts[k].getGroup("note");
                note.artifactType = MarkdownEnum.Note;
                note.fileName = filename;
                note.start = artifacts[k].index + thisStart;
                note.length = artifacts[k].length;
                if (artifacts[k].groups.has("type"))
                    note.groups.set("type", artifacts[k].getGroup("type"));
                this.addInnerBlock(note);
            }
            else if (artifacts[k].groups.has("snippet")) {
                var file = Helpers.getFileName(artifacts[k].getGroup("file"));
                var codeFence = ContentBlock.extractSnippet(artifacts[k], filename);
                if (codeFence !== undefined) {
                    var tagName = "";
                    if (artifacts[k].groups.has("currenttag") && !Helpers.strIsNullOrEmpty(artifacts[k].getGroup("currenttag"))) {
                        tagName = artifacts[k].getGroup("currenttag").trim().toLowerCase();
                    }
                }

                this.extractCodeFenceTokens(tagName, codeFence, filename);
            }
            else {
                console.log(`Found artifact ${artifacts[k].groups.keys}`);
            }

            startIndex = thisStart + artifacts[k].index + artifacts[k].length;
        }

        var afterArtifacts = content.substring(INDEX2, content.length - INDEX2);
        if (afterArtifacts.length > 0) {
            this.extractParagraphs(afterArtifacts, filename, startIndex);
        }            
    }        

    public getHref(item): string{
        if (item.has("href") && undefined  !== item["href"] && !Helpers.strIsNullOrEmpty(item["href"])) {
            return item["href"].ToString();
        }

        return "";
    }

    public getHrefFromOrdered(item) : string{
        if (item.Contains("href") && undefined !== item["href"] && !Helpers.strIsNullOrEmpty(item["href"])) {
            return item["href"].ToString();
        }

        return "";
    }    

    public processNodes(items: any[], order: number = 0) : number {
        if (items == undefined)
            return 0;

        for (var item of items) {
            if (item.has("name")) {
                var thisItem = new ContentBlock();
                thisItem.fileName = this.fileName;
                thisItem.artifactType = MarkdownEnum.ToC_Entry;
                thisItem.text = `${item["name"]}`;
                this.parent = this;

                thisItem.copyParentInfo(this);
                thisItem.groups.set("ToCNodePath", this.getGroup("ToCNodePath") + "/" + `${item["name"]}`);
                thisItem.groups.set("ParentNodeName", this.text);
                thisItem.groups.set("TopNodeOrder", `${order}`);
                thisItem.groups.set("0", thisItem.text);
                var href = this.getHref(item);
                var path = this.getHrefPath(href);
                if (!Helpers.strIsNullOrEmpty(href)) {
                    thisItem.groups.set("href",href);
                }

                if (!Helpers.strIsNullOrEmpty(path)){
                    thisItem.groups.set("HrefPath", path);
                    thisItem.groups.set("ArticlePath", path);
                }

                if (item.has("displayName")) {
                    thisItem.groups.set("displayName", `${item["displayName"]}`);
                }
                    
                if (item.has("expanded")) {
                    thisItem.groups["expanded"] = `${item["expanded"]}`;
                }
                    

                thisItem.groups.set("label", thisItem.text);

                if (item.has("items")) {
                    if (item["items"] !== undefined) {
                        thisItem.artifactType = MarkdownEnum.ToC_Node;
                        var subItems = [item["items"]];
                        thisItem.groups.set("NodeName", this.text);
                        order = thisItem.processNodes(subItems, order);
                    }
                    else {
                        console.log(`"Found null items for ${item["name"]}`);
                    }                        
                }
                else{
                    order++;
                }

                this.innerBlocks.push(thisItem);                    
            }
        }

        return order;
    }
}
