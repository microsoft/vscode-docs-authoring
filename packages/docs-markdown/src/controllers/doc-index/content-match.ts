import { ContentBlock } from './content-block';
import { Helpers } from './helpers';
import { dirname } from 'path';
import yaml = require('js-yaml');
import { RegexContainer } from './regex-container';

export class ContentMatch extends RegexContainer {
	static links: RegExp = /(?<link>(?<selector>> [\-\*]  )*!?((?<label>\[[^\]]*\]\([^\)]+\)\])|\[(?<label>[^\]]*)\])\((?<file>(?(?=[^()]*\()[^(]*\([^\)]*\)[^)#]*|[^)#]*))?(?<anchor>#[^\)]+)?\)\]*)/gim;
	static newLinks: RegExp = /(?<mdlink>(?<link>(?<selector>> [\-\*]  )*(\[(?<label>(?<innerExclaim>\s*!(?=\[))?(?(innerExclaim)\[[^\]\(]*\](?=\()\([^\)]+\)([^\]]|\[[^\]]+\](?![\r\n\(]))*|([^\]]|\[[^\]]+\](?![\r\n\(]))*))\])\((?<file>(?(?=[^()]*\()[^(]*\([^\)]*\)[^)#]*|[^)#]*))?(?<anchor>#[^\)]+)?\)\]*))/gim;
	static images_triple_colon: RegExp = /^\s*(?<link>:::image\s+type="(?<type>[^"]+)"\s+source="(?<file>[^"]+)"(\s+alt-text="(?<label>[^"]+)")?)/gim;
	static aHref: RegExp = /(?<link>\<a\s+(?:[^>]*?\s+)?href=["' ]+(?<file>[^"']+)['"]\s*>(?<label>[^<]+)?(<\s*img\s+src=[ "']+(?<image>[^"']+)["'](\s+alt=["' ]+(?<alt>[^"']+)["'])?[ \/>]+)?(.+)(?=<\/a>)<\/a>)/gim;
	static selectors: RegExp = /(?<link>(?<selector>> [\-\*]  )*!?\[(?<label>[^\]]+)\]\[(?<file>[^\]]+)\])/gim;
	static zonePivots: RegExp = /^\s*(?<zone>:::\s+(zone-end|zone\s+pivot="(?<name>[^"]+))")/gim;
	static includeLinks: RegExp = /(?<link>!?\[(?<label>[^\]]*)\]\((?<file>(?(?=[^()]*\()[^(]*\([^\)]*\)[^)#]*|[^)#]*))?(?<anchor>#[^\)]+)?\)\]*)/gim;
	static indexFile: RegExp = /(?<=index)\.(md|yml)/gim;
	static toCFile: RegExp = /toc\.(yml|md)/gim;
	static moduleUnitFile: RegExp = /(?<!index|toc)\.yml/gim;
	static articleFile: RegExp = /(?!index)\.md/gim;
	static configFile: RegExp = /\.json/gim;
	static includeLabel: RegExp = /!INCLUDE/gim;
	static includeFile: RegExp = /^[\.\/\\]+includes\//gim;
	static mediaFile: RegExp = /media\//gim;
	static auditEntryTitle: RegExp = /({(?<value>[^}]+)})/gim;
	static notRelative: RegExp = /^(\/|http)/gim;
	static number: RegExp = /^(?<number>\d)/gim;
	static yamlMime: RegExp = /### YamlMime:(?<type>[^\r\n ]+)/gim;
	static pathService: RegExp = /[^\/]+\/(?<service>[^\/]+)\/(?<subservice>[^\/]+)\//gim;
	static pipe: RegExp = /\|/gim;
	static yamlSeparator: RegExp = /^\s*---\s*\r\n/gim;
	static yamlSeparatorAlt: RegExp = /\s*---\s*\r\n/gim;
	static line: RegExp = /^(?<line>[^\r\n]+)?(?<newline>(\r?\n|\Z))/gim;
	static headers: RegExp = /^(?<![<>])(?<match>(?<header>#{1,4}(?![<>])[^\r\n]+)[\r\n]{1,2})/gim;
	static bangCode: RegExp = /!code-(?<tag>[^\[\(\s]+)/gim;
	static codeFences: RegExp = /^(?: |\t)*(?<fence>```)(?<currenttag>(?=\n|\r|\Z)|[^\r\n`\.]+)(?!```)(?=\r|\n|\Z|$)/gim;
	static codeFencesWithBroken: RegExp = /^(?: |\t)*(?<fence>```)(?<currenttag>(?=\n|\r|\Z)|[^\r\n`]+)(?!```)(?=\r|\n|\Z|$)/gim;
	static bulletRow: RegExp = /^(?<bullet>(?:[ ]{0,})(?<!-)(?:\d{1,2}\.|\*|\+|-{2}|-{1}(?=(?: {1,})))(?: )+[^\r\n]+(?:\r\n)(?:(?:^\r\n)*(?:^[ ]{1,3}[^\r\n]+(?:\r\n))*)*)/gim;
	static tableRow: RegExp = /(?<row>(^(?: *)(?<!\\)\|?([^\r\n\|]+(?<!\\)\|)+[^\r\n]*\r\n))/gim;
	static tableColumn: RegExp = /\|?(?<format>[- ]+)\|?/gim;
	static tableColumnSplit: RegExp = /(?<!\\)\|/gim;
	static externalLink: RegExp = /^(\/|http)/gim;
	static repoId: RegExp = /\((?<id>\d+)\)/gim;
	static docs: RegExp = /docs\.microsoft\.com/gim;
	static mS: RegExp = /(microsoft|azure|msdn|uservoice|aka|visualstudio|azuredatabricks|westus|eastus|powerbi|technet)/gim;
	static cLI: RegExp = /(\b|-)(?<![\\\./])cli(?![\-\.\\/])\b/gim;
	static portal: RegExp = /portal/gim;
	static pS: RegExp = /\b(PS|PowerShell)\b/gim;
	static bB: RegExp = /\[!div class="nextstepaction"\]/gim;
	static checkmarks: RegExp = /\[!div class="checklist"\]/gim;
	static nodeJS: RegExp = /(Node(\.js)?|JavaScript)/gim;
	static note: RegExp = /^(?<note>\s*\>\s\[!(?<type>(NOTE|TIP|IMPORTANT|CAUTION|WARNING))\]\s*\r\n(\s*\>[^\r\n]+)*)/gim;
	static numberedList: RegExp = /(?<nlist>(^(?<spaces>[ ]{0,})\d{1,2}\.(?=(?: {1,}))(?: )+[^\r\n]+(\r\n)((^\r\n)*(^[ ]{1,3}[^\r\n]+(\r\n))*)*)+)/gim;
	static bulletedList: RegExp = /(?<list>(^(?<spaces>[ ]{0,})(?<!-)(\*|\+|-{2}|-{1}(?=(?: {1,})))(?: )+[^\r\n]+(\r\n)((^\r\n)*(^[ ]{1,3}[^\r\n]+(\r\n))*)*)+)/gim;
	static linkRef: RegExp = /^(?<link>\[(?<label>[^\]]+)\]: (?<file>[^#\r\n]+)?(?<anchor>#[^\r\n]+)?)/gim;
	static table: RegExp = /(?<table>((^(?: *)\|?([^\r\n|]+\|)+[^\r\n]*\r\n)+))/gim;
	static snippet: RegExp = /:::\s*code\s+language\s*=\s*"(?<currenttag>[^"]+)"\s+source\s*=\s*"~*\/(?<snippet>[^\/]+)\/(?<file>[^"]+)"\s*(highlight\s*=\s*"(?<highlight>[^"]+)")*(range\s*=\s*"(?<range>[^"]+)"|id\s*="(?<name>[^"]+)")*/gim;
	static altSnippet: RegExp = /[\.\/~]+(?<snippet>[^\/]+)\/(?<file>[^\s]+)(\s*"(?<name>[^"]+)")*/gim;
	static metadataSplit: RegExp = /\s*---\s*\r?\n?/gim;
	static formatMetadata: RegExp = /[ &\-\\/#\?\$\.\^"']+/gim;
	static noNewLines: RegExp = /\r|\n/gim;
	static noduleUnit: RegExp = /^-\s(?<module>[^\r]+)\r\n/gim;
	static extensionsInUrl: RegExp = /(?'ext'\.\w{3,4})$|\?/gim;
	static extensions: RegExp = /(?'ext'\\.\\w+$)/gim;
	static cleanUpDBKey_underscore: RegExp = /[&\\\/#\?\$\^]+/gim;
	static cleanUpDBKey_remove: RegExp = /[\r\n "']+"/gim;
	static cleanUpDBColumnName_underscore: RegExp = /[&\-\(\)\[\]\\/#\?\$\^:\.;]+/gim;
	static toCBadNodes: RegExp = /^[ ]{2}/gim;
	static toCAddSpacesToLink: RegExp = /^(href|items)/gim;
	static cleanUpYaml_Blank: RegExp = /(?<!items):([\r\n]{1,2})/gim;
	static cleanUpYaml_Empty: RegExp = /\A*^[ ]*[\r\n]{1,2}/gim;
	static signUp: RegExp = /https:\/\/azure\.microsoft\.com\/free\/\?WT\.mc_id=A261C142F/gim;
	static tabAnchor: RegExp = /#tab/gim;
	static anyNewLines: RegExp = /[\r\n]+/gim;
	static metadataValue: RegExp = /(?<=^)(?<key>[^:]+):\s{0,1}(?<value>[^\r\n]+)/gim;
	static newLineX2: RegExp = /(\r\n){2,}/gim;
	static ufeff: RegExp = /\uFEFF/gim;
	static u200b: RegExp = /\u200B/gim;
	static relative: RegExp = /^(?<drive>[A-Za-z]):/gim;
	static onlyCarriageReturn: RegExp = /\r(?!\n)/gim;
	static onlyNewline: RegExp = /(?<!\r)\n/gim;
	static forwardSlash: RegExp = /\//gim;
	static cleanJSON: RegExp = /[^\u0020-\u007E]/gim;
	static json_schema: RegExp = /schemas\.microsoft\.com/gim;
	static rootedPath: RegExp = /^~"/gim;
	static startingSlash: RegExp = /^~[\/\\]/gim;
	static startingSlashDot: RegExp = /^\.\//gim;
	static queryStringStart: RegExp = /\?.+/gim;
	static cleanUpYaml_HasChildren: RegExp = /\{|\[/gim;
	static anchor: RegExp = /(?<!\/)(?<anchor>#[^)]+)/gim;
	static headerNumber: RegExp = /^[ ]*(?<number>[#]+)/gim;
	static notRelativeLink: RegExp = /^[^~\.\\\/]/gim;
	static partialPathreplace: RegExp = /(?<replace>(?<pre>[\/\\])index(\.md|\.yml))/gim;
	static partialPathHttp: RegExp = /^http(s)?:/gim;
	static partialPathExtension: RegExp = /\.(md|yml)$/gim;
	static gitHubUrl: RegExp = /https:\/\/github.com\/(?<owner>[^\/]+)\/(?<name>[^\/]+)\//gim;
	static partialPathEnUs: RegExp = /\/?en-us\/?/gim;
	static items: RegExp = /\Aitems:\r\n/gim;
	static arm: RegExp = /"type": "(?<namespace>([A-Za-z0-9]+\.)+[A-Za-z0-9]+)\/(?<property>[^"]+)"/gim;
	static containerFrom: RegExp = /\w*(?<!SELECT .*)(?:(?-i)FROM )(?!(["']?(mcr|acr|\Sazurecr))|[<{\[])(?<image>[^\/\s]+)/gim;
	static containerInline: RegExp = /(?<![\.\\\/@\[\-])(?<host>(microsoft\/))(?<tag>[\w][\w.-]{1,127})(?<version>(?<!http(s)?|xref)(:\S+)?)/gim;
	static containerOld: RegExp = /[^-[.\\/@a-zA-Z](\w*microsoft\/[\w\d\S]*(?!.*GitHub)(?!.*[gG][iI][tT][hH][uU][bB])).*/gim;

	private _index: number;
	public get index(): number {
		return this._index;
	}
	public set index(v: number) {
		this._index = v;
	}

	private _length: number;
	public get length(): number {
		return this._length;
	}
	public set length(v: number) {
		this._length = v;
	}

	private _startLine: number;
	public get startLine(): number {
		return this._startLine;
	}
	public set startLine(v: number) {
		this._startLine = v;
	}

	private _endLine: number;
	public get endLine(): number {
		return this._endLine;
	}
	public set endLine(v: number) {
		this._startLine = v;
	}

	public static newContentMatchFromContainers(
		array: RegexContainer[],
		result: RegExpExecArray
	): ContentMatch {
		let value: ContentMatch = new ContentMatch();
		value.start = result.index;
		value.length = result.length;
		value.end = result.index + result.length;
		value.groups = new Map(array.map(i => [i.groupName, i.value]));
		return value;
	}

	public containsContentBlock(block: ContentBlock) {
		return block.start >= this.index && block.start + block.length <= this.index + this.length;
	}

	public containsContentMatch(match: ContentMatch) {
		return match.index >= this.index && match.index + match.length <= this.index + this.length;
	}

	public intersects(start: number, end: number) {
		return (
			(start >= this.index && start <= this.index + this.length) ||
			(end >= this.index && end <= this.index + this.length)
		);
	}

	private _groups: Map<string, string>;
	public get groups(): Map<string, string> {
		return this._groups;
	}
	public set groups(v: Map<string, string>) {
		this._groups = v;
	}

	public getGroup(group: string): string {
		var returnValue = this.groups[group];
		if (undefined == returnValue) {
			returnValue = '';
		}

		return returnValue;
	}

	public getIncludeLinks(content: string, filename: string) {
		var links = ContentMatch.getMatches(content, ContentMatch.includeLinks).filter(
			e => e.groups.has('link') && ContentMatch.includeLabel.test(e.groups['link'])
		);

		for (let i = 0; i < links.length; i++) {
			var includeLink = links[i];

			if (ContentMatch.notRelative.test(includeLink.getGroup('file'))) {
				var fileName = Helpers.getFileName(filename);
				var hrefPath = Helpers.fixPath(dirname(filename), includeLink.getGroup('file'));
				includeLink.groups['HrefPath'] = hrefPath;
			}
		}

		return links;
	}

	public static getMatches(
		source: string,
		pattern: RegExp,
		codeFences: ContentMatch[] = []
	): ContentMatch[] {
		var matches = RegexContainer.exec(pattern, source);
		if (codeFences !== undefined) {
			matches = matches.filter(e => !ContentMatch.inCodeFence(e, codeFences));
		}

		return matches;
	}

	public static getLastIndexMetadata(content: string, filename: string): number {
		try {
			var lines = ContentMatch.getMatches(content, ContentMatch.yamlSeparator);
			if (lines.length <= 1) {
				if (lines.length == 0) {
					return 0;
				} else {
					var length = 1000;
					if (content.length < length) length = content.length;
					lines = ContentMatch.getMatches(
						content.substring(0, length),
						ContentMatch.yamlSeparatorAlt
					);
					if (lines.length == 1) return lines[0].index + lines[0].length;
					else if (lines.length > 1) return lines[1].index + lines[1].length;
					else {
						return 0;
					}
				}
			} else {
				return lines[1].index + lines[1].length;
			}
		} catch (e) {
			console.log(e);
			console.log(filename);
			return 0;
		}
	}

	public static getMetadata(content: string, fileName: string): string {
		var lastIndexMetadata = ContentMatch.getLastIndexMetadata(content, fileName);
		return content.substring(0, lastIndexMetadata);
	}

	public static readMetadata(content: string): Map<string, string> {
		if (!Helpers.strIsNullOrEmpty(content)) {
			return Helpers.mapObjectToStr(yaml.load(content));
		}
	}

	public static cleanUpColumnName(key: string): string {
		var underscore = ContentMatch.cleanUpDBColumnName_underscore;
		var remove = ContentMatch.cleanUpDBKey_remove;
		return key.replace(underscore, '_').replace(remove, '');
	}

	public static extractMetadata(source: string): Map<string, string> {
		var re = ContentMatch.metadataValue;
		var map = new Map<string, string>();
		for (var m of ContentMatch.getMatches(source, ContentMatch.metadataValue)) {
			m.groups.forEach((value: string, key: string) => {
				if (!Helpers.strIsNullOrEmpty(value)) {
					map.set(ContentMatch.cleanUpColumnName(key), value);
				}
			});
		}

		return map;
	}

	public cleanContent(content: string): string {
		if (!Helpers.strIsNullOrEmpty(content)) {
			content = content.replace(ContentMatch.onlyNewline, '\r\n');
			content = content.replace(ContentMatch.u200b, '');
			content = content.replace(ContentMatch.ufeff, '');
		}

		return content;
	}

	public static getHeaders(content: string): ContentMatch[] {
		return ContentMatch.getMatches(content, ContentMatch.headers);
	}

	public static getCodeFences(content: string): ContentMatch[] {
		var matches = ContentMatch.getMatches(content, ContentMatch.codeFences);
		var broken = ContentMatch.getMatches(content, ContentMatch.codeFencesWithBroken);

		if (matches.length % 2 == 1 || (broken.length > matches.length && broken.length % 2 == 0))
			return broken;
		else return matches;
	}

	public static inCodeFence(match: ContentMatch, codeFences: ContentMatch[]): boolean {
		try {
			for (let i = 0; i < codeFences.length; i += 2) {
				var startCodeFence = codeFences[i].index + codeFences[i].length;
				var endCodeFence = codeFences[i + 1].index + codeFences[i + 1].length;
				if (match.index > startCodeFence && match.index + match.length < endCodeFence) {
					return true;
				}
			}
		} catch (e) {
			if (!(codeFences.length % 2 == 1)) console.log(e);
		}

		return false;
	}

	public static getLinkRefs(source: string): ContentMatch[] {
		return ContentMatch.getMatches(source, ContentMatch.linkRef);
	}

	public static getZones(source: string): ContentMatch[] {
		return ContentMatch.getMatches(source, ContentMatch.zonePivots);
	}

	public static parseQueryString(query: string): Map<string, string> {
		const items = query.split('&');

		let result: Map<string, string> = new Map<string, string>();
		items.forEach(item => {
			const [rawKey, rawValue] = item.split('=');
			const key = decodeURIComponent(rawKey);
			const value = decodeURIComponent(rawValue);

			if (key !== undefined) {
				result.set('QS_' + key, value);
			}
		});

		return result;
	}

	public static getLinks(
		source: string,
		codeFences?: ContentMatch[],
		refs?: ContentMatch[]
	): ContentMatch[] {
		let keyedMatches: ContentMatch[] = [];
		var matches = ContentMatch.getMatches(source, ContentMatch.links, codeFences);
		for (var m of matches) {
			if (m.groups.has('file') && m.groups.has('anchor')) {
				let anchor: string = m.getGroup('anchor');
				let file: string = m.getGroup('file');
				if (ContentMatch.forwardSlash.test(anchor)) {
					file = file + anchor;
					var anchorMatch = ContentMatch.getMatches(file, ContentMatch.anchor)[0];
					if (anchorMatch != undefined) {
						m.groups.set('anchor', anchorMatch.getGroup('anchor'));
						m.groups.set('file', file.replace(anchorMatch.getGroup('anchor'), ''));
					} else {
						m.groups.delete('anchor');
						m.groups.set('file', file);
					}
				}
			}

			if (m.groups.has('file') && m.groups.get('file').indexOf('?') >= 0) {
				var portions = m.groups.get('file').split('?');
				m.groups.set('file', portions[0]);
				if (portions.length == 2) {
					var queryString = portions[1];
					var collection = ContentMatch.parseQueryString(queryString);
					ContentMatch.parseQueryString(m.groups.get('file')).forEach(
						(value: string, key: string) => {
							m.groups.set(key, value);
						}
					);
				}
			}
		}

		keyedMatches = keyedMatches.concat(matches);
		matches = ContentMatch.getMatches(source, ContentMatch.aHref);

		for (var m of matches) {
			if (m.groups.has('file') && m.groups.get('file').indexOf('?') >= 0) {
				var portions = m.groups.get('file').split('?');
				m.groups.set('file', portions[0]);
				if (portions.length == 2) {
					var queryString = portions[1];
					var collection = ContentMatch.parseQueryString(queryString);
					ContentMatch.parseQueryString(m.groups.get('file')).forEach(
						(value: string, key: string) => {
							m.groups.set(key, value);
						}
					);
				}
			}
		}

		matches = ContentMatch.getMatches(source, ContentMatch.images_triple_colon);
		keyedMatches = keyedMatches.concat(matches);

		if (null != refs && refs.length > 0) {
			matches = ContentMatch.getMatches(source, ContentMatch.selectors);
			for (var m of matches) {
				if (codeFences == undefined || !ContentMatch.inCodeFence(m, codeFences)) {
					if (m.groups.has('file')) {
						var refMatch = matches.filter(
							e => e.groups.has('label') && e.groups.get('label') == m.groups.get('file')
						)[0];
						if (refMatch !== undefined) {
							m.groups.set('file', refMatch.groups.get('file'));
							if (refMatch.groups.has('anchor')) {
								if (m.groups.has('anchor')) m.groups.set('anchor', refMatch.groups.get('anchor'));
								else m.groups.set('anchor', refMatch.groups.get('anchor'));
							}
						}
					}

					if (m.groups.has('file') && m.groups.get('file').indexOf('?') >= 0) {
						var portions = m.groups.get('file').split('?');
						m.groups.set('file', portions[0]);
						if (portions.length == 2) {
							var queryString = portions[1];
							var collection = ContentMatch.parseQueryString(queryString);
							ContentMatch.parseQueryString(m.groups.get('file')).forEach(
								(value: string, key: string) => {
									m.groups.set(key, value);
								}
							);
						}
					}

					keyedMatches.push(m);
				}
			}
		}

		return keyedMatches.sort((a, b) => {
			return b.index - a.index;
		});
	}

	public static getSnippets(source: string, codeFences?: ContentMatch[]): ContentMatch[] {
		return ContentMatch.getMatches(source, ContentMatch.snippet, codeFences);
	}

	public static getNotes(source: string, codeFences?: ContentMatch[]): ContentMatch[] {
		return ContentMatch.getMatches(source, ContentMatch.note, codeFences);
	}

	public static padPatternSpaces(pattern: string, spaces: number): string {
		var leadingSpaces = '{' + ' '.repeat(spaces) + ',}';
		var innerSpaces = '{' + ' '.repeat(spaces + 1) + ',' + ' '.repeat(spaces + 4) + '}';
		pattern = pattern.replace('{0,}', leadingSpaces);
		pattern = pattern.replace('{1,3}', innerSpaces);
		return pattern;
	}

	public static getBullets(
		source: string,
		codeFences?: ContentMatch[],
		spaces: number = -1
	): ContentMatch[] {
		let keyedMatches: ContentMatch[] = [];

		try {
			var pattern = ContentMatch.bulletedList;
			if (spaces != -1) pattern = new RegExp(ContentMatch.padPatternSpaces(pattern.source, spaces));

			var matches = ContentMatch.getMatches(source, pattern);

			for (var m of matches) {
				if (codeFences == undefined || !ContentMatch.inCodeFence(m, codeFences))
					keyedMatches.push(m);
			}

			pattern = ContentMatch.numberedList;
			if (spaces != -1) pattern = new RegExp(ContentMatch.padPatternSpaces(pattern.source, spaces));

			matches = ContentMatch.getMatches(source, pattern);

			for (var m of matches) {
				if (codeFences == undefined || !ContentMatch.inCodeFence(m, codeFences)) {
					var contains = keyedMatches.filter(e => e.containsContentMatch(m));
					if (contains.length == 0) {
						contains = keyedMatches.filter(e => m.containsContentMatch(e));
						for (var n of contains) Helpers.removeAt(keyedMatches, n);

						keyedMatches.push(m);
					}
				}
			}
		} catch (e) {
			console.log(e);
		}

		if (spaces == -1) {
			let inner: ContentMatch[] = [];
			for (var match of keyedMatches) {
				var addSpaces = 3;
				if (match.groups.has('spaces') && match.getGroup('spaces').length > 0) {
					addSpaces = match.groups['spaces'].Length + 3;
					var innerMatches = ContentMatch.getBullets(source, codeFences, addSpaces);
					if (innerMatches.length > 0) inner = inner.concat(innerMatches);
				}
			}

			if (inner.length > 0) keyedMatches = keyedMatches.concat(inner);
		}

		return keyedMatches.sort((a, b) => {
			return b.index - a.index;
		});
	}

	public static getTables(source: string): ContentMatch[] {
		return ContentMatch.getMatches(source, ContentMatch.table);
	}
}
