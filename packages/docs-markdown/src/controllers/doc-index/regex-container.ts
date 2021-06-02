/* eslint-disable no-console */
/* eslint-disable import/no-unresolved */
/* eslint-disable prefer-const */
import { ContentMatch } from './content-match';

export class RegexContainer {
	private _end: number;
	public get end(): number {
		return this._end;
	}
	public set end(v: number) {
		this._end = v;
	}

	private _start: number;
	public get start(): number {
		return this._start;
	}
	public set start(v: number) {
		this._start = v;
	}

	private _source: string;
	public get source(): string {
		return this._source;
	}
	public set source(v: string) {
		this._source = v;
	}

	private _refCount: number;
	public get refCount(): number {
		return this._refCount;
	}
	public set refCount(v: number) {
		this._refCount = v;
	}

	private _parent: number;
	public get parent(): number {
		return this._parent;
	}
	public set parent(v: number) {
		this._parent = v;
	}

	private _value: string;
	public get value(): string {
		return this._value;
	}
	public set value(v: string) {
		this._value = v;
	}

	private _groupName: string;
	public get groupName(): string {
		return this._groupName;
	}
	public set groupName(v: string) {
		this._groupName = v;
	}

	static getRegexContainerForRegExp(start: number, end: number, source: string) {
		let result: RegexContainer = new RegexContainer();
		result.start = start;
		result.end = end;
		result.source = source;
		return result;
	}

	static getRegexCustomResultArray(value: string, parent: number) {
		let result: RegexContainer = new RegexContainer();
		result.value = value;
		result.parent = parent;
		return result;
	}

	static getRegexMatch(parent: number, refCount: number, start: number) {
		// eslint-disable-next-line prefer-const
		let result: RegexContainer = new RegexContainer();
		result.parent = parent;
		result.refCount = refCount;
		result.start = start;
		return result;
	}

	static _findCaptureGroupsInRegexTemplate(re: RegExp, input: string): RegexContainer[] {
		let refCount = 0;
		let matches: RegexContainer[] = [];
		let res: RegExpExecArray;
		let data: RegexContainer;
		re.lastIndex = 0;
		try {
			while ((res = re.exec(input)) !== null) {
				if (isCapturingStartItem(res[0])) {
					refCount++;
					data = RegexContainer.getRegexMatch(0, refCount, res.index);
					if (res.groups.name) {
						data.groupName = res.groups.name;
					}
					matches.push(data);
				} else if (input.charAt(res.index) === ')') {
					let idx = matches.length;
					while (idx-- > -1 && matches.length > idx) {
						if (matches[idx]?.end === undefined) {
							const match = matches[idx];
							if (match) {
								match.end = re.lastIndex;
								match.source = input.substring(match.start, match.end);
							}
							break;
						}
					}
					refCount--;
					let writeIdx = idx;
					while (idx-- > -1 && matches.length > idx) {
						if (matches[idx] !== undefined) {
							if (matches[idx]?.refCount === refCount) {
								matches[writeIdx].parent = idx + 1;
								break;
							}
						}
					}
				}
			}
			matches.unshift(RegexContainer.getRegexContainerForRegExp(0, input.length, input));
		} catch (error) {
			console.log(error);
			console.log(error.stack);
			throw error;
		}
		return matches;

		function isCapturingStartItem(str: string): boolean {
			if (str !== '(') {
				return str.search(/\(\?<\w/) !== -1;
			}
			return true;
		}
	}

	static execFull(re: RegExp, input: string, foundCaptureItems: RegexContainer[]): ContentMatch[] {
		let result: RegExpExecArray;
		let foundIdx;
		let groupName;
		const matches: ContentMatch[] = [];
		while ((result = re.exec(input)) !== null) {
			let array = createCustomResultArray(result);
			array.forEach((match, idx) => {
				if (!idx) {
					match.start = match.end = result.index;
					match.end += result[0].length;
					delete match.parent;
					return;
				}
				let parentStr = array[match.parent].value;
				foundIdx =
					match.parent < idx - 1
						? parentStr.lastIndexOf(match.value)
						: parentStr.indexOf(match.value);
				match.start = match.end = foundIdx + array[match.parent].start;
				match.end += match.value.length;
				if ((groupName = foundCaptureItems[idx].groupName)) {
					match.groupName = groupName;
				}
			});
			matches.push(ContentMatch.newContentMatchFromContainers(array, result));
			if (re.lastIndex === 0) {
				break;
			}
		}
		return matches;

		function createCustomResultArray(result: RegExpExecArray): RegexContainer[] {
			let captureVar = 0;
			return Array.from(result, data => {
				return RegexContainer.getRegexCustomResultArray(
					data || '',
					foundCaptureItems[captureVar++].parent
				);
			});
		}
	}

	static mapCaptureAndNameGroups(inputRegexSourceString) {
		let REGEX_CAPTURE_GROUPS_ANALYZER = /((((?<!\\)|^)\((\?((<(?<name>\w+)))|(\?<=.*?\))|(\?<!.*?\))|(\?!.*?\))|(\?=.*?\)))?)|((?<!\\)\)(([*+?](\?)?))?|({\d+(,)?(\d+)?})))/gm;
		return RegexContainer._findCaptureGroupsInRegexTemplate(
			REGEX_CAPTURE_GROUPS_ANALYZER,
			inputRegexSourceString
		);
	}

	static exec(re, input): ContentMatch[] {
		let foundCaptureItems = RegexContainer.mapCaptureAndNameGroups(re.source);
		return RegexContainer.execFull(re, input, foundCaptureItems);
	}
}
