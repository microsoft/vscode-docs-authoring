/* eslint-disable import/no-unresolved */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/member-ordering */
/* eslint-disable prefer-const */
import { ContentMatch } from './content-match';
import { Helpers } from './helpers';
import { LinkTypes } from './linktypes-enum';
import { MarkdownEnum } from './markdown-enum';
import { Stack } from 'stack-typescript';
import { dirname, relative } from 'path';
import { Notebook } from './notebook';
import { getIncludeText, getSnippetText } from '../include-controller';

export class ContentBlock {
	private _name: string;
	public get name(): string {
		return this._name;
	}
	public set name(v: string) {
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

	private _text: string;
	public get text(): string {
		return this._text;
	}
	public set text(v: string) {
		this._text = v;
	}

	private _artifactType: MarkdownEnum;
	public get artifactType(): MarkdownEnum {
		return this._artifactType;
	}
	public set artifactType(v: MarkdownEnum) {
		this._artifactType = v;
	}

	public get start(): number {
		return this._index;
	}
	public set start(v: number) {
		this._index = v;
	}

	private _length: number;
	public get length(): number {
		return this._length;
	}
	public set length(v: number) {
		this._length = v;
	}

	private _groups: Map<string, string>;
	public get groups(): Map<string, string> {
		return this._groups;
	}
	public set groups(v: Map<string, string>) {
		this._groups = v;
	}

	private _fromInclude: boolean;
	public get fromInclude(): boolean {
		return this._fromInclude;
	}
	public set fromInclude(v: boolean) {
		this._fromInclude = v;
	}

	private _addedContentLengthFromInclude: number;
	public get addedContentLengthFromInclude(): number {
		return this._addedContentLengthFromInclude;
	}
	public set addedContentLengthFromInclude(v: number) {
		this._addedContentLengthFromInclude = v;
	}

	private _fileName: string;
	public get fileName(): string {
		return this._fileName;
	}
	public set fileName(v: string) {
		this._fileName = v;
	}

	private _blockText: string;
	public get blockText(): string {
		return this._blockText;
	}
	public set blockText(v: string) {
		this._blockText = v;
	}

	private _innerBlocks: ContentBlock[] = [];
	public get innerBlocks(): ContentBlock[] {
		return this._innerBlocks;
	}
	public set innerBlocks(v: ContentBlock[]) {
		this._innerBlocks = v;
	}

	private _allInnerBlocksList: ContentBlock[] = [];
	public get allInnerBlocksList(): ContentBlock[] {
		return this._allInnerBlocksList;
	}
	public set allInnerBlocksList(v: ContentBlock[]) {
		this._allInnerBlocksList = v;
	}

	private _parent: ContentBlock;
	public get parent(): ContentBlock {
		return this._parent;
	}
	public set parent(v: ContentBlock) {
		this._parent = v;
	}

	private _index: number;
	public get index(): number {
		return this._index;
	}
	public set index(v: number) {
		this._index = v;
	}

	private _indexInCollection: number;
	public get indexInCollection(): number {
		return this._indexInCollection;
	}
	public set indexInCollection(v: number) {
		this._indexInCollection = v;
	}

	private _isParagraph: boolean;
	public get isParagraph(): boolean {
		return this._isParagraph;
	}
	public set isParagraph(v: boolean) {
		this._isParagraph = v;
	}

	public get headerNumber(): number {
		if (this.groups.has('HeaderNumberValue')) {
			let num: number = +this.groups.get('HeaderNumberValue');
			return num;
		} else return -1;
	}

	private _startLine: number;
	public get startLine(): number {
		return this._startLine;
	}
	public set startLine(v: number) {
		this._startLine = v;
	}

	public containsContentBlock(block: ContentBlock) {
		return block.start >= this.index && block.start + block.length <= this.index + this.length;
	}

	public containsContentMatch(match: ContentMatch) {
		return match.index >= this.index && match.index + match.length <= this.index + this.length;
	}

	private _endLine: number;
	public get endLine(): number {
		return this._endLine;
	}
	public set endLine(v: number) {
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
			: (source as T);
	}

	constructor() {
		this.groups = new Map<string, string>();
	}

	public setCodeFence(text: string, tag: string, filename: string = '') {
		this.text = text;
		this.artifactType = MarkdownEnum.CodeFence;
		this.fileName = filename;
		this.groups = new Map([
			['0', text],
			['code', text],
			['tag', tag]
		]);
	}

	public setText(text: string) {
		this.text = text;
		this.groups = new Map([['0', text]]);
	}

	public setTextWithIndex(text: string, i: number, l: number, filename: string = '') {
		this.text = text;
		this.groups = new Map([['0', text]]);
		this.fileName = filename;
		this.start = i;
		this.length = l;
	}

	public getGroup(group: string): string {
		let returnValue = this.groups.get(group);
		if (undefined === returnValue) {
			returnValue = '';
		}

		return returnValue;
	}

	public setLink(link: Map<string, string>, i: number, l: number, filename: string = '') {
		this.groups = new Map(link);
		this.fileName = filename;
		this.start = i;
		this.length = l;
		this.artifactType = MarkdownEnum.Link;

		let file = this.groups.get('file');
		if (file !== undefined && !new RegExp(ContentMatch.externalLink, 'gim').test(file)) {
			let root = dirname(this.fileName);
			let fixedPath = Helpers.fixPath(root, file);
			if (fixedPath !== undefined) this.groups.set('hrefpath', fixedPath);
		} else if (file !== undefined && file.search(/\/azure\/.+/gim) !== undefined) {
			this.groups.set(
				'hrefpath',
				file.replace(/(http(s)?:\/\/docs\.microsoft\.com)?\/azure\//gim, 'articles/')
			);
		}

		let hrefPath = this.groups.get('hrefPath');
		if (hrefPath !== undefined) {
			this.groups.set('filename', Helpers.getFileName(hrefPath));
		}

		if (file !== undefined) {
			if (file.indexOf('/') === 0) {
				this.groups.set('linkType', LinkTypes.Internal.toString());
			} else if (file.indexOf('github') >= 0) {
				this.groups.set('linkType', LinkTypes.GitHub.toString());
			} else if (!Helpers.strIsNullOrEmpty(this.getGroup('selector'))) {
				this.groups.set('linkType', LinkTypes.Selector.toString());
			} else if (new RegExp(ContentMatch.includeFile, 'gim').test(this.getGroup('file'))) {
				this.groups.set('linkType', LinkTypes.Include.toString());
			} else if (new RegExp(ContentMatch.mediaFile, 'gim').test(this.getGroup('file'))) {
				this.groups.set('linkType', LinkTypes.Media.toString());
			} else if (new RegExp(ContentMatch.signUp, 'gim').test(this.getGroup('file'))) {
				this.groups.set('linkType', LinkTypes.SignUp.toString());
			} else this.groups.set('linkType', LinkTypes.External.toString());
		}

		this.groups.set('0', this.groups.get('link'));
		this.text = this.groups.get('link');
	}

	public static *depthFirstTreeTraversal(
		root: ContentBlock,
		children: (node: ContentBlock) => ContentBlock[]
	): IterableIterator<ContentBlock> {
		let stack = new Stack<ContentBlock>();
		stack.push(root);
		while (stack.length !== 0) {
			let current = stack.pop();
			// If you don't care about maintaining child order then remove the Reverse.
			for (let child of children(current).reverse()) stack.push(child);

			yield current;
		}
	}

	public AllInnerBlocks(): ContentBlock[] {
		let list: ContentBlock[] = [];
		for (let item of ContentBlock.depthFirstTreeTraversal(this, e => e.innerBlocks)) {
			list.push(item);
		}

		return list;
	}

	public static getAllChildBlocks(
		startingBlock: ContentBlock,
		result: ContentBlock[]
	): ContentBlock[] {
		let inner = startingBlock.innerBlocks;
		for (let child of inner) {
			result.push(child);

			// this will internally add to result
			ContentBlock.getAllChildBlocks(child, result);
		}

		return result;
	}

	public static getAllParentBlocks(node: ContentBlock, parentlist: ContentBlock[]): ContentBlock[] {
		if (node.parent === null) return parentlist;

		parentlist.push(node.parent);
		ContentBlock.getAllParentBlocks(node.parent, parentlist);
		return parentlist;
	}

	public allChildBlocks(): ContentBlock[] {
		let start: ContentBlock[] = [];
		return ContentBlock.getAllChildBlocks(this, start);
	}

	public allParentBlocks() {
		let start: ContentBlock[] = [];
		return ContentBlock.getAllParentBlocks(this, start);
	}

	public getParent(type: MarkdownEnum): ContentBlock {
		let parent = this.parent;
		let checkedParents: ContentBlock[] = [];
		checkedParents.push(parent);
		while (parent !== null && parent.artifactType !== type) {
			parent = parent.parent;

			if (checkedParents.indexOf(parent) >= 0) break;

			checkedParents.push(parent);
		}

		return parent;
	}

	public topParent(): ContentBlock {
		if (null !== this.parent) return this.parent.topParent();
		else return this;
	}

	public setIncludeFile(filename: string) {
		this.fromInclude = true;
		this.fileName = filename;
		this.innerBlocks.forEach(e => e.setIncludeFile(filename));
	}

	public static extractIncludeBlocks(artifact: ContentMatch, filename: string): ContentBlock[] {
		let file = artifact.getGroup('file');
		let includeFilename = Helpers.absolute(dirname(filename), file);
		let attributeValues: Map<string, string> = new Map<string, string>();
		if (!Helpers.fileExists(includeFilename)) {
			let snippetContent: string = artifact.getGroup('snippet');
			if (!Helpers.strIsNullOrEmpty(snippetContent)) {
				attributeValues = ContentMatch.getSnippetAttributes(snippetContent);
				if (attributeValues.has('source')) {
					includeFilename = attributeValues.get('source');
				}

				includeFilename = relative(filename, includeFilename);
				if (!Helpers.fileExists(includeFilename)) return undefined;
			} else return undefined;
		}

		let content = '';
		getIncludeText(includeFilename).then(text => {
			content = text;
		});
		let includeBlocks = ContentBlock.splitContentIntoBlocks(includeFilename, content, false);
		if (attributeValues.size > 0) {
			let lineNumbers: Set<number> = new Set<number>();
			content = Helpers.getSnippetContent(attributeValues, content, file);
			let tag = '';
			if (attributeValues.has('language')) {
				tag = attributeValues.get('language');
			}

			let block = new ContentBlock();
			block.text = content;
			block.artifactType = MarkdownEnum.CodeFence;
			block.start = 0;
			block.length = content.length;
			block.fileName = includeFilename;
			block.fromInclude = true;
			block.groups = new Map([
				['0', content],
				['code', content],
				['tag', tag]
			]);
			let blocks: ContentBlock[] = [];
			blocks.push(block);
			return blocks;
		} else {
			return includeBlocks;
		}
	}

	public static splitIntoLines(content: string): ContentMatch[] {
		return ContentMatch.getMatches(content, ContentMatch.line);
	}

	public static getHeaderBlocks(content: string, codeFences?: ContentMatch[], fileName?: string) {
		let Headers = ContentMatch.getHeaders(content);
		let Blocks: ContentBlock[] = [];
		let LastIndexMetadata = ContentMatch.getLastIndexMetadata(content, fileName);
		let hasHeaders = true;
		let hasH1 = false;
		let currentParent = null;
		hasHeaders = !(Headers.length === 0 || codeFences.length % 2 === 1);
		let first: ContentMatch = null;
		if (hasHeaders) {
			first = Headers[0];
			let header = first.getGroup('header');
			hasH1 = !(
				new RegExp(ContentMatch.links, 'gim').test(header) &&
				new RegExp(ContentMatch.tabAnchor, 'gim').test(header)
			);
		}

		if (!hasHeaders || !hasH1) {
			let currentParent = new ContentBlock();
			currentParent.text = '';
			currentParent.groups = new Map<string, string>([
				['0', ''],
				['HeaderIndex', '-1'],
				['HeaderNumber', 'H0'],
				['HeaderName', 'None']
			]);

			currentParent.blockText = content.substring(LastIndexMetadata);

			if (hasHeaders) {
				currentParent.blockText = '';
				currentParent.start = 0;
				currentParent.length = 0;

				if (null !== first) {
					currentParent.length = first.index;
					currentParent.blockText = content.substring(0, first.index);
				}
			}

			Blocks.push(currentParent);
		}

		let nonCodeHeaders = Headers.filter(
			e => !ContentMatch.inCodeFence(e, codeFences) && e.index >= LastIndexMetadata
		);
		for (let i = 0; i < nonCodeHeaders.length; i++) {
			let match = nonCodeHeaders[i];
			let header = match.getGroup('header');

			let hMatch = ContentMatch.getMatches(header, ContentMatch.headerNumber)[0];
			let headerNumber = header.split('#').length - 1;
			if (hMatch !== undefined) {
				headerNumber = hMatch.getGroup('number').length;
			}

			let index = match.index;
			let text = '';

			if (i + 1 < nonCodeHeaders.length) {
				text = content.substring(index, nonCodeHeaders[i + 1].index);
			} else {
				text = content.substring(index, content.length);
			}

			let length = 0;
			if (i + 1 < nonCodeHeaders.length) length = nonCodeHeaders[i + 1].index - match.index;
			else length = content.length - match.index;

			let currentBlock = new ContentBlock();
			let blockText = text.substring(header.length);
			currentBlock.blockText = blockText;
			currentBlock.artifactType = MarkdownEnum.Header;
			currentBlock.text = header;
			currentBlock.index = i;
			currentBlock.start = match.index;
			currentBlock.groups = new Map<string, string>([
				['0', header],
				['HeaderIndex', `${i}`],
				['HeaderNumber', `$H{headerNumber}`],
				['HeaderName', header],
				['HeaderNumberValue', `${headerNumber}`]
			]);

			if (
				new RegExp(ContentMatch.links, 'gim').test(header) &&
				new RegExp(ContentMatch.tabAnchor, 'gim').test(header)
			) {
				let conceptualTab = currentBlock;
				currentBlock.artifactType = MarkdownEnum.ConceptualTab;
				currentBlock.groups.set('name', header);
			}

			Blocks.push(currentBlock);
		}

		return Blocks;
	}

	public static splitContentIntoBlocks(
		filename: string,
		content: string,
		isInclude: boolean
	): ContentBlock[] {
		let AllCodeFences = ContentMatch.getCodeFences(content);
		let HeaderBlocks = ContentBlock.getHeaderBlocks(content, AllCodeFences);
		HeaderBlocks.forEach(e => (e.fileName = filename));
		let linkRefs = ContentMatch.getLinkRefs(content);
		let externalContentAdded = 0;
		if (AllCodeFences.length % 2 === 1) {
			console.log('Odd number of code fences!');
			return [];
		}

		for (let i = 0; i < HeaderBlocks.length; i++) {
			let header = HeaderBlocks[i].getGroup('HeaderName');
			if (externalContentAdded > 0) {
				HeaderBlocks[i].start += externalContentAdded;
			}
			HeaderBlocks[i].extractInnerBlocks(filename, linkRefs);
			if (HeaderBlocks[i].addedContentLengthFromInclude > 0) {
				HeaderBlocks[i].length += HeaderBlocks[i].addedContentLengthFromInclude;
				externalContentAdded += HeaderBlocks[i].addedContentLengthFromInclude;
			}
			// if (isInclude) HeaderBlocks[i].setIncludeFile(filename);
		}

		return HeaderBlocks;
	}

	public static populateBlockDetails(content: string, filename: string, blocks: ContentBlock[]) {
		let zones = ContentMatch.getZones(content);
		let zoneList: string[] = [];
		let tabList: string[] = [];
		let artifactsInTabs: ContentBlock[] = [];
		let artifactsInZones: ContentBlock[] = [];
		for (let zone of zones) {
			let name = zone.getGroup('name');
			if (!Helpers.strIsNullOrEmpty(name)) zoneList.push(name);
		}

		let conceptualTabs = blocks.filter(e => e.artifactType === MarkdownEnum.ConceptualTab);
		for (let tab of conceptualTabs) {
			let name = tab.getGroup('name');
			if (!Helpers.strIsNullOrEmpty(name)) tabList.push(name);
		}

		// Set up zone pivot information.
		for (let block of blocks) {
			let zone = zones.filter(e => e.containsContentBlock(block))[0];
			if (block.artifactType !== MarkdownEnum.ConceptualTab) {
				let tab = blocks
					.filter(e => e.artifactType === MarkdownEnum.ConceptualTab)
					.filter(f => f.containsContentBlock(block))[0];
				if (tab !== undefined) {
					block.tab = tab.getGroup('name');
					artifactsInTabs.push(block);
				}
			}

			if (null !== zone) {
				block.zone = zone.getGroup('name');
				artifactsInZones.push(block);
			}
		}

		let HeaderBlocks = blocks
			.filter(e => e.artifactType === MarkdownEnum.Header)
			.sort((a, b) => a.start - b.start);

		if (HeaderBlocks.length === 0) return;

		let stack = new Stack<ContentBlock>();
		stack.push(HeaderBlocks[0]);
		for (let i = 1; i < HeaderBlocks.length; i++) {
			let thisHeader = HeaderBlocks[i];
			if (
				new RegExp(ContentMatch.links, 'gim').test(thisHeader.text) &&
				new RegExp(ContentMatch.tabAnchor, 'gim').test(thisHeader.text)
			) {
				stack.top.innerBlocks.push(thisHeader);
				thisHeader.parent = stack.top;
				continue;
			}

			if (thisHeader.headerNumber === stack.top.headerNumber) {
				stack.pop();
				if (stack.length > 0) {
					stack.top.innerBlocks.push(thisHeader);
					thisHeader.parent = stack.top;
				}
				stack.push(thisHeader);
			} else if (thisHeader.headerNumber > stack.top.headerNumber) {
				stack.top.innerBlocks.push(thisHeader);
				thisHeader.parent = stack.top;
				stack.push(thisHeader);
			} else {
				while (stack.length > 0 && thisHeader.headerNumber <= stack.top.headerNumber) {
					stack.pop();
				}

				if (stack.length > 0) {
					stack.top.innerBlocks.push(thisHeader);
					thisHeader.parent = stack.top;
				}
				stack.push(thisHeader);
			}
		}

		HeaderBlocks.forEach(e => (e.innerBlocks = e.innerBlocks.sort((a, b) => a.start - b.start)));
	}

	public copyParentInfo(parent: ContentBlock) {
		try {
			let info_to_copy: string[] = [
				'HeaderNumberValue',
				'HeaderNumber',
				'HeaderIndex',
				'HeaderName',
				'ToCNodePath',
				'TopNodeName'
			];
			parent.groups.forEach((value, key) => {
				if (info_to_copy.indexOf(key) > 0) {
					let index = info_to_copy.indexOf(key);
					this.groups.set(key, value);
				}
			});

			this.indexInCollection = parent.innerBlocks.length;
			parent = parent;
		} catch (e) {
			console.log(e);
		}
	}

	public addInnerBlock(block: ContentBlock) {
		if (block.length > 0) {
			if (
				block.artifactType !== MarkdownEnum.Header &&
				block.artifactType !== MarkdownEnum.ToC_Node &&
				block.artifactType !== MarkdownEnum.ToC_TopNode
			)
				block.copyParentInfo(this);
			let inner = this.innerBlocks
				.filter(e => e.fileName.toLowerCase() === block.fileName.toLowerCase())
				.filter(
					f => block.start >= f.start && block.start + block.length - 1 <= f.start + f.length - 1
				)
				.sort((a, b) => a.length - b.length)[0];
			if (inner !== undefined) inner.addInnerBlock(block);
			else {
				let newChildBlocks = this.innerBlocks
					.filter(
						f =>
							f.fileName.toLowerCase() === block.fileName.toLowerCase() &&
							f.start >= block.start &&
							f.start + f.length - 1 <= block.start + block.length - 1
					)
					.sort((a, b) => a.length - b.length);

				for (let child of newChildBlocks) {
					Helpers.removeAt(this.innerBlocks, child);
					block.addInnerBlock(child);
				}

				this.innerBlocks.push(block);
			}
		}
	}

	public addIncludeBlocks(
		includeBlocks: ContentBlock[],
		artifact: ContentMatch,
		filename: string,
		thisStart: number
	): number {
		let tmpStart = 0;
		let currentStart = thisStart;
		if (undefined !== includeBlocks && includeBlocks.length > 0) {
			includeBlocks = includeBlocks.sort((a, b) => a.start - b.start);
			if (includeBlocks.length === 1 && includeBlocks[0].artifactType === MarkdownEnum.None)
				includeBlocks[0].allChildBlocks().forEach(element => {
					element.copyParentInfo(this);
				});

			for (let includeBlock of includeBlocks) {
				includeBlock.start += artifact.index + currentStart;
				includeBlock.innerBlocks.forEach(e => (e.start += artifact.index + currentStart));
				if (includeBlock.artifactType === MarkdownEnum.None) {
					includeBlock.innerBlocks.forEach(e => this.addInnerBlock(e));
					// parent.TopParent().AllBlocks.AddRange(includeBlock.AllChildBlocks());
				} else {
					this.addInnerBlock(includeBlock);
				}

				tmpStart += includeBlock.length;
			}

			thisStart += tmpStart;
			this.addedContentLengthFromInclude += tmpStart;
			artifact.length = 0;
			return thisStart;
		} else return -1;
	}

	public addSnippet(
		codeFence: ContentBlock,
		artifact: ContentMatch,
		filename: string,
		thisStart: number
	): number {
		let currentStart = thisStart;
		if (undefined !== codeFence) {
			codeFence.copyParentInfo(this);
			codeFence.start += artifact.index + currentStart;
			this.extractCodeFenceTokens(codeFence.getGroup('tag'), codeFence, filename);
			artifact.length = 0;
			thisStart += codeFence.length;
			this.addedContentLengthFromInclude += codeFence.length;
			return thisStart;
		} else return -1;
	}

	public extractCodeFenceTokens(tag: string, codeFence: ContentBlock, fileName?: string) {
		let content = codeFence.text;
		this.addInnerBlock(codeFence);

		// This will need rewritten with interfaccs
	}

	public static extractSnippet(artifact: ContentMatch, filename: string): ContentBlock {
		let snippetContent = artifact.getGroup('snippet');
		let snippetFileName = artifact.getGroup('file');
		let attributeValues = new Map<string, string>();
		if (Helpers.strIsNullOrEmpty(snippetContent)) {
			if (Helpers.strIsNullOrEmpty(snippetFileName)) {
				console.log(`Cannot retrieve code for ${artifact.getGroup('0')}`);
				return undefined;
			}
		} else {
			attributeValues = ContentMatch.getSnippetAttributes(snippetContent);
			if (attributeValues.has('source')) {
				snippetFileName = attributeValues.get('source');
			}
		}

		let content = '';
		if (!Helpers.strIsNullOrEmpty(snippetFileName)) {
			let [snippetName, snippetFileName] = ContentMatch.getSnippetDetails(snippetContent, filename);
			if (!Helpers.strIsNullOrEmpty(snippetName) && !Helpers.strIsNullOrEmpty(snippetFileName)) {
				let snippet = '';
				getSnippetText(snippetName, snippetFileName).then(text => {
					snippet = text;
				});
				if (!Helpers.strIsNullOrEmpty(snippet)) {
					content = Helpers.getSnippetContent(attributeValues, content, filename);
					let tag = '';
					if (attributeValues.has('language')) {
						tag = attributeValues.get('language');
					}

					let blocks: ContentBlock[] = [];
					let block = new ContentBlock();
					block.text = content;
					block.start = 0;
					block.length = content.length;
					block.fileName = snippetFileName;
					block.fromInclude = true;
					block.groups = new Map([
						['0', content],
						['code', content],
						['tag', tag]
					]);
					blocks.push(block);
					return blocks[0];
				}
			}
		} else console.log(`Could not get filename for snippet ${snippetContent}`);

		return undefined;
	}

	public static extractNotebook(artifact: ContentMatch, filename: string): ContentBlock {
		let snippetContent = artifact.getGroup('snippet');
		let snippetFileName = artifact.getGroup('file');
		let tag = artifact.getGroup('label');
		let name = artifact.getGroup('QS_name');
		if (tag.indexOf('-') > 0) {
			tag = tag.split('-')[-1];
		}

		if (Helpers.strIsNullOrEmpty(snippetContent)) {
			console.log(`Cannot retrieve code for ${artifact.getGroup('0')}`);
			return undefined;
		}

		let snippetName = '';
		[snippetName, snippetFileName] = ContentMatch.getSnippetDetails(snippetContent, filename);
		let content = '';
		if (!Helpers.strIsNullOrEmpty(snippetName) && !Helpers.strIsNullOrEmpty(snippetFileName)) {
			let snippet = '';
			getSnippetText(snippetName, snippetFileName).then(text => {
				snippet = text;
			});
			let lines = ContentMatch.splitIntoLines(snippet);
			if (!Helpers.strIsNullOrEmpty(name)) {
				try {
					const notebook: Notebook = new Notebook(snippet);
					if (notebook.cells.length > 0) {
						let cells = notebook.cells.filter(
							e => name.toLowerCase() === e.getName().toLowerCase()
						);
						if (cells.length > 0) {
							let content = cells
								.map(element => {
									element.source;
								})
								.join('\r\n');
						} else console.log(`Could not get Cell ${name} from ${snippetContent}`);
					}
				} catch (error) {
					const stackTrace = !!error.stack ? error.stack : '';
					console.log(error);
				}
			}

			if (!Helpers.strIsNullOrEmpty(content)) {
				let blocks: ContentBlock[] = [];
				let block = new ContentBlock();
				block.text = content;
				block.start = 0;
				block.length = content.length;
				block.fileName = snippetFileName;
				block.fromInclude = true;
				block.groups = new Map([
					['0', content],
					['code', content],
					['tag', tag],
					['name', name]
				]);
				blocks.push(block);
				return blocks[0];
			}
		}

		return undefined;
	}

	public extractInnerBlocks(filename: string, refs?: ContentMatch[]) {
		let content = this.blockText;
		let codeFences = ContentMatch.getCodeFences(content);

		if (!Helpers.strIsNullOrEmpty(content)) {
			if (codeFences.length % 2 === 0 && codeFences.length !== 0) {
				let INDEX = 0;
				for (let j = 0; j < codeFences.length; j += 2) {
					let tag = '';
					if (
						codeFences[j].groups.has('currenttag') &&
						!Helpers.strIsNullOrEmpty(codeFences[j].getGroup('currenttag'))
					) {
						tag = codeFences[j].getGroup('currenttag').trim().toLowerCase();
					}

					let beforeCodeBlock = content.substring(INDEX, codeFences[j].index);

					this.extractArtifacts(beforeCodeBlock, filename, codeFences, refs, INDEX + this.start);

					INDEX = codeFences[j + 1].index + codeFences[j + 1].length;
					let insidecodeblock = content.substring(codeFences[j].index, INDEX);
					let codeFence = new ContentBlock();
					codeFence.setCodeFence(insidecodeblock, tag);
					codeFence.start = codeFences[j].index + this.start;
					codeFence.length = INDEX - codeFences[j].index;
					this.fileName = filename;

					this.extractCodeFenceTokens(tag, codeFence, filename);
				}

				let afterCodeBlocks = content.substring(INDEX, content.length);
				this.extractArtifacts(afterCodeBlocks, filename, codeFences, refs, INDEX + this.start);
			} else if (codeFences.length === 0) {
				this.extractArtifacts(content, filename, codeFences, refs);
			} else {
				console.log('Odd Number of Code Fences');
				this.extractArtifacts(content, filename, codeFences, refs);
			}
		}
	}

	public getHrefPath(href: string): string {
		let path = '';
		if (
			!Helpers.strIsNullOrEmpty(href) &&
			!new RegExp(ContentMatch.externalLink, 'gim').test(href)
		) {
			href = href.split('?')[0].split('#')[0];
			if (Helpers.strIsNullOrEmpty(this.fileName)) return '';
			let root = this.fileName.replace(Helpers.getFileName(this.fileName), '');
			path = Helpers.fixPath(root, href);
		}
		return path;
	}

	public extractParagraphs(content: string, fileName?: string, startIndex: number = 0) {
		// Todo : Test if this works.
		// Make sure indexes are correct with newlines taken out.
		content = content.replace(/\r\n$/gim, '');
		let paragraphs = ContentMatch.getMatches(content, ContentMatch.newLineX2);
		let p = '';
		let c = new ContentBlock();
		let INDEX = 0;
		let thisStart = this.start + this.text.length;
		if (startIndex !== 0) thisStart = startIndex;

		for (let i = 0; i < paragraphs.length; i++) {
			p = content.substring(INDEX, paragraphs[i].index);
			c = new ContentBlock();
			c.blockText = content;
			c.text = content;
			c.start = INDEX + thisStart;
			c.length = p.length;
			c.groups.set('0', c.text);
			c.fileName = fileName;
			c.artifactType = MarkdownEnum.Paragraph;
			c.isParagraph = true;
			this.addInnerBlock(c);
			INDEX = paragraphs[i].index + paragraphs[i].length;
		}

		let after = content.substring(INDEX, content.length);
		c = new ContentBlock();
		c.blockText = content;
		c.text = content;
		c.start = INDEX + thisStart;
		c.length = content.length - INDEX;
		c.fileName = fileName;
		c.artifactType = MarkdownEnum.Paragraph;
		c.isParagraph = true;
		c.groups.set('0', c.text);
		this.addInnerBlock(c);
	}

	public extractListRows(contentBlock: ContentBlock, fileName?: string) {
		this.addInnerBlock(contentBlock);
		let content = contentBlock.text;
		let pattern = ContentMatch.bulletRow;
		if (contentBlock.groups.has('spaces')) {
			let spaces = contentBlock.getGroup('spaces').length;
			if (spaces > 0) pattern = new RegExp(ContentMatch.padPatternSpaces(pattern.source, spaces));
		}

		for (let bulletRow of ContentMatch.getMatches(content, pattern)) {
			if (
				bulletRow.groups.has('bullet') &&
				!Helpers.strIsNullOrEmpty(bulletRow.getGroup('bullet'))
			) {
				let c = new ContentBlock();
				c.text = bulletRow.getGroup('bullet');
				c.index = bulletRow.index + contentBlock.start;
				c.length = bulletRow.length;
				c.fileName = this.fileName;
				c.artifactType =
					contentBlock.artifactType === MarkdownEnum.NumberedList
						? MarkdownEnum.NumberedListRow
						: MarkdownEnum.BulletedListRow;
				contentBlock.addInnerBlock(c);
			}
		}
	}

	public extractTableData(contentBlock: ContentBlock, fileName?: string) {
		let content = contentBlock.text;
		let contentMatches = ContentMatch.getMatches(content, ContentMatch.tableRow);
		if (contentMatches.length > 2) {
			this.addInnerBlock(contentBlock);
			let columns: ContentBlock[] = [];
			let tableData = contentMatches[0];
			let formatData = contentMatches[1];
			if (tableData !== undefined) console.log('Table Data cannot be NULL!!');

			let tableContent = contentMatches.slice(2);
			let columnsCount = 0;
			if (formatData !== undefined) {
				let columnInfo = ContentMatch.getMatches(
					formatData.getGroup('row'),
					ContentMatch.tableColumn
				);
				columnsCount = columnInfo.length;
			} else console.log('Issues Extracting Table Data');

			let firstRow = tableData.getGroup('row');
			let columnMatches = ContentMatch.getMatches(firstRow, ContentMatch.pipe);
			if (columnMatches.length === 0) console.log('Table Columns were NULL!');
			let noBorders = false;
			if (columnMatches.length < columnsCount) noBorders = true;

			let INDEX = 0;
			let column = 0;
			let length = 0;
			let value = '';
			let columnName = '';
			for (let i = 0; i < columnMatches.length; i++) {
				if (noBorders) {
					length = columnMatches[i].index;
					let value = Helpers.strTrimSpaces(firstRow.substring(INDEX, length));
					INDEX = columnMatches[i].index + columnMatches[i].length;

					if (column >= columnsCount) console.log('Issues Extracting Table Data');

					let tmp = new ContentBlock();
					tmp.text = value;
					tmp.start = INDEX + tableData.index + contentBlock.start;
					tmp.length = length;
					tmp.artifactType = MarkdownEnum.TableColumn;
					tmp.fileName = fileName;
					tmp.groups.set('ColumnName', value);
					columns.push(tmp);
					contentBlock.addInnerBlock(tmp);
					column++;

					if (i + 1 === columnMatches.length) {
						length = firstRow.length;

						value = firstRow.substring(INDEX, length);
						value = value.replace(ContentMatch.anyNewLines, '');
						value = Helpers.strTrimSpaces(value);
						tmp = new ContentBlock();
						tmp.text = value;
						tmp.index = INDEX + tableData.index + contentBlock.start;
						tmp.length = length;
						tmp.artifactType = MarkdownEnum.TableColumn;
						tmp.fileName = fileName;
						tmp.groups.set('ColumnName', value);
						columns.push(tmp);
						contentBlock.addInnerBlock(tmp);
						column++;
					}
				} else {
					INDEX = columnMatches[i].index + columnMatches[i].length;
					length = firstRow.length;
					if (i + 1 < columnMatches.length) {
						length = columnMatches[i + 1].index;

						let value = Helpers.strTrimSpaces(firstRow.substring(INDEX, length));

						let tmp = new ContentBlock();
						tmp.text = value;
						tmp.index = INDEX + tableData.length + contentBlock.start;
						tmp.length = length;
						tmp.artifactType = MarkdownEnum.TableColumn;
						tmp.fileName = fileName;
						tmp.groups.set('ColumnName', value);
						columns.push(tmp);
						contentBlock.addInnerBlock(tmp);
						column++;
					}
				}
			}

			for (let tableRow of tableContent) {
				let row = tableRow.getGroup('row');
				let rowValues = ContentMatch.getMatches(row, ContentMatch.tableColumnSplit);
				noBorders = false;
				if (rowValues.length < columns.length) noBorders = true;
				INDEX = 0;
				column = 0;
				for (let i = 0; i < rowValues.length; i++) {
					let length = 0;
					if (noBorders) {
						length = rowValues[i].index;
						let value = Helpers.strTrimSpaces(row.substring(INDEX, length));
						INDEX = rowValues[i].index + rowValues[i].length;
						let columnName = columns[column].groups.get('ColumnName');
						if (column >= columns.length) console.log('Issues Extracting Table Data');
						let tmp = new ContentBlock();
						tmp.text = value;
						tmp.start = INDEX + tableRow.index + contentBlock.start;
						tmp.length = length;
						tmp.artifactType = MarkdownEnum.TableRowValue;
						tmp.fileName = fileName;
						tmp.groups = new Map([
							['0', value],
							['row', value],
							['rownumber', `${i}`],
							['columnname', columnName],
							['colnumber', `${column}`]
						]);
						columns[column].addInnerBlock(tmp);

						column++;

						if (i + 1 === rowValues.length) {
							length = row.length - INDEX;

							value = row.substring(INDEX, length);
							value = value.replace(ContentMatch.anyNewLines, '');
							value = Helpers.strTrimSpaces(value);
							let tmp = new ContentBlock();
							tmp.text = value;
							tmp.start = INDEX + tableRow.index + contentBlock.start;
							tmp.length = length;
							tmp.artifactType = MarkdownEnum.TableRowValue;
							tmp.fileName = fileName;
							tmp.groups = new Map([
								['0', value],
								['row', value],
								['rownumber', `${i}`],
								['columnname', columnName],
								['colnumber', `${column}`]
							]);

							columns[column].addInnerBlock(tmp);
							column++;
						}
					} else {
						INDEX = rowValues[i].index + rowValues[i].length;
						length = row.length;
						if (i + 1 < rowValues.length) {
							length = rowValues[i + 1].index;
							let value = Helpers.strTrimSpaces(row.substring(INDEX, length));

							if (column >= columns.length) column = 0;

							let columnName = columns[column].groups.get('ColumnName');
							let tmp = new ContentBlock();
							tmp.text = value;
							tmp.start = INDEX + tableRow.index + contentBlock.start;
							tmp.length = length;
							tmp.artifactType = MarkdownEnum.TableRowValue;
							tmp.fileName = fileName;
							tmp.groups = new Map([
								['0', value],
								['row', value],
								['rownumber', `${i}`],
								['columnname', columnName],
								['colnumber', `${column}`]
							]);
							columns[column].addInnerBlock(tmp);
						}
						column++;
					}
				}
			}
		}
	}

	public extractArtifacts(
		content: string,
		filename: string,
		codeFences?: ContentMatch[],
		refs?: ContentMatch[],
		setStart: number = -1
	) {
		let artifacts: ContentMatch[] = [];
		ContentMatch.getLinks(content, codeFences, refs).forEach(e => artifacts.push(e));
		ContentMatch.getCodeCallouts(content, codeFences).forEach(e => artifacts.push(e));
		// To Do - Lookup redirections for links.
		ContentMatch.getSnippets(content, codeFences).forEach(e => artifacts.push(e));
		ContentMatch.getBullets(content, codeFences).forEach(e => artifacts.push(e));
		ContentMatch.getTables(content).forEach(e => artifacts.push(e));
		ContentMatch.getNotes(content).forEach(e => artifacts.push(e));
		artifacts = artifacts.sort((a, b) => a.index - b.index);
		let INDEX2 = 0;
		let startIndex = 0;
		let thisStart = this.start;

		if (setStart > 0) {
			thisStart = setStart;
		}

		thisStart += `${this.text}`.length;

		let tagName = '';
		for (let k = 0; k < artifacts.length; k++) {
			if (
				this.artifactType === MarkdownEnum.ConceptualTab &&
				artifacts[k].index + this.start < this.start + this.text.length
			) {
				continue;
			}

			let beforeArtifactLength = artifacts[k].index;
			if (beforeArtifactLength > 0) {
				let beforeArtifact = content.substring(INDEX2, beforeArtifactLength);
				if (beforeArtifact.length > 0) {
					this.extractParagraphs(beforeArtifact, filename, startIndex);
				}

				let newIndex = artifacts[k].index + artifacts[k].length;
				if (newIndex > INDEX2) {
					INDEX2 = newIndex;
				}
			} else {
				let newIndex = artifacts[k].index + artifacts[k].length;
				if (newIndex > INDEX2) {
					INDEX2 = newIndex;
				}
			}

			if (artifacts[k].groups.has('link')) {
				if (
					new RegExp(ContentMatch.includeLabel, 'gim').test(artifacts[k].getGroup('label')) &&
					!new RegExp(ContentMatch.mediaFile, 'gim').test(artifacts[k].getGroup('label'))
				) {
					let newStart = this.addIncludeBlocks(
						ContentBlock.extractIncludeBlocks(artifacts[k], filename),
						artifacts[k],
						filename,
						thisStart
					);
					if (newStart >= 0) {
						thisStart = newStart;
					} else {
						newStart = this.addSnippet(
							ContentBlock.extractSnippet(artifacts[k], filename),
							artifacts[k],
							filename,
							thisStart
						);
						if (newStart >= 0) {
							thisStart = newStart;
						} else console.log(`Issue with Snippet and Include for ${filename}`);
					}
				} else if (`${artifacts[k].getGroup('label')}`.toLowerCase().indexOf('!notebook-') >= 0) {
					let notebookBlock = ContentBlock.extractNotebook(artifacts[k], filename);
					if (undefined !== notebookBlock) {
						notebookBlock.copyParentInfo(this);
						notebookBlock.start += artifacts[k].index + thisStart;
						this.extractCodeFenceTokens(notebookBlock.getGroup('tag'), notebookBlock, filename);
						thisStart += notebookBlock.length;
						this.addedContentLengthFromInclude += notebookBlock.length;
						artifacts[k].length = 0;
					}
				} else {
					let hrefPath = this.getHrefPath(artifacts[k].getGroup('file'));
					if (!Helpers.strIsNullOrEmpty(hrefPath)) {
						hrefPath = Helpers.getRedirect(hrefPath);
						artifacts[k].groups.set('file', hrefPath);
					}
				}

				let link = new ContentBlock();
				link.setLink(
					artifacts[k].groups,
					artifacts[k].index + thisStart,
					artifacts[k].length,
					filename
				);
				this.addInnerBlock(link);
			} else if (artifacts[k].groups.has('list')) {
				let list = new ContentBlock();
				list.text = artifacts[k].getGroup('list');
				list.artifactType = MarkdownEnum.BulletedList;
				list.fileName = filename;
				list.start = artifacts[k].index + thisStart;
				list.length = artifacts[k].length;

				if (artifacts[k].groups.has('spaces')) {
					list.groups.set('spaces', artifacts[k].getGroup('spaces'));
				}

				this.extractListRows(list, filename);
			} else if (artifacts[k].groups.has('nlist')) {
				let list = new ContentBlock();
				list.text = artifacts[k].getGroup('nlist');
				list.artifactType = MarkdownEnum.NumberedList;
				list.fileName = filename;
				list.start = artifacts[k].index + thisStart;
				list.length = artifacts[k].length;

				if (artifacts[k].groups.has('spaces')) {
					list.groups.set('spaces', artifacts[k].getGroup('spaces'));
				}

				this.extractListRows(list, filename);
			} else if (artifacts[k].groups.has('table')) {
				let table = new ContentBlock();
				table.text = artifacts[k].getGroup('table');
				table.artifactType = MarkdownEnum.Table;
				table.fileName = filename;
				table.start = artifacts[k].index + thisStart;
				table.length = artifacts[k].length;
				this.extractTableData(table, filename);
			} else if (artifacts[k].groups.has('callout')) {
				let codecallout = new ContentBlock();
				codecallout.text = artifacts[k].getGroup('callout');
				codecallout.artifactType = MarkdownEnum.CodeCallOut;
				codecallout.fileName = filename;
				codecallout.start = artifacts[k].index + thisStart;
				codecallout.length = artifacts[k].length;
				this.addInnerBlock(codecallout);
			} else if (artifacts[k].groups.has('note')) {
				let note = new ContentBlock();

				note.text = artifacts[k].getGroup('note');
				note.artifactType = MarkdownEnum.Note;
				note.fileName = filename;
				note.start = artifacts[k].index + thisStart;
				note.length = artifacts[k].length;
				if (artifacts[k].groups.has('type')) {
					note.groups.set('type', artifacts[k].getGroup('type'));
				}
				this.addInnerBlock(note);
			} else if (artifacts[k].groups.has('snippet')) {
				let newStart = this.addSnippet(
					ContentBlock.extractSnippet(artifacts[k], filename),
					artifacts[k],
					filename,
					thisStart
				);
				if (newStart >= 0) {
					thisStart = newStart;
				} else {
					newStart = this.addIncludeBlocks(
						ContentBlock.extractIncludeBlocks(artifacts[k], filename),
						artifacts[k],
						filename,
						thisStart
					);
					if (newStart >= 0) {
						thisStart = newStart;
					} else console.log(`Issue with Snippet and Include for ${filename}`);
				}
			} else {
				console.log(`Found artifact ${artifacts[k].groups.keys}`);
			}

			startIndex = thisStart + artifacts[k].index + artifacts[k].length;
		}

		let afterArtifacts = content.substring(INDEX2, content.length);
		if (afterArtifacts.length > 0) {
			this.extractParagraphs(afterArtifacts, filename, startIndex);
		}
	}

	public getHref(item): string {
		if (item.has('href')) {
			let value = item.get('href');
			if (value !== undefined && !!Helpers.strIsNullOrEmpty(value)) {
				return value;
			}
		}
		return '';
	}

	public getHrefFromOrdered(item): string {
		if (
			item.Contains('href') &&
			undefined !== item.get('href') &&
			!Helpers.strIsNullOrEmpty(item.get('href'))
		) {
			return item.get('href').ToString();
		}

		return '';
	}

	public processNodes(items: any[], order: number = 0): number {
		if (items === undefined) return 0;

		for (let item of items) {
			if (item.has('name')) {
				let thisItem = new ContentBlock();
				thisItem.fileName = this.fileName;
				thisItem.artifactType = MarkdownEnum.ToC_Entry;
				thisItem.text = `${item.get('name')}`;
				this.parent = this;

				thisItem.copyParentInfo(this);
				thisItem.groups.set(
					'ToCNodePath',
					this.getGroup('ToCNodePath') + '/' + `${item.get('name')}`
				);
				thisItem.groups.set('ParentNodeName', this.text);
				thisItem.groups.set('TopNodeOrder', `${order}`);
				thisItem.groups.set('0', thisItem.text);
				let href = this.getHref(item);
				let path = this.getHrefPath(href);
				if (!Helpers.strIsNullOrEmpty(href)) {
					thisItem.groups.set('href', href);
				}

				if (!Helpers.strIsNullOrEmpty(path)) {
					thisItem.groups.set('HrefPath', path);
					thisItem.groups.set('ArticlePath', path);
				}

				if (item.has('displayName')) {
					thisItem.groups.set('displayName', `${item.get('displayName')}`);
				}

				if (item.has('expanded')) {
					thisItem.groups.set('expanded', `${item.get('expanded')}`);
				}

				thisItem.groups.set('label', thisItem.text);

				if (item.has('items')) {
					if (item.get('items') !== undefined) {
						thisItem.artifactType = MarkdownEnum.ToC_Node;
						let subItems = [item.get('items')];
						thisItem.groups.set('NodeName', this.text);
						order = thisItem.processNodes(subItems, order);
					} else {
						console.log(`"Found null items for ${item.get('name')}`);
					}
				} else {
					order++;
				}

				this.innerBlocks.push(thisItem);
			}
		}

		return order;
	}

	public static AllBlocks: ContentBlock[];
}
