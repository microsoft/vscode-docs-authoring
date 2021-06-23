/* eslint-disable @typescript-eslint/interface-name-prefix */
/* eslint-disable prefer-const */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-console */
import { ContentBlock } from './content-block';
import { ContentMatch } from './content-match';
import { FileTypeEnum } from './filetype-enum';
import { existsSync } from 'fs';
const resolve = require('path').resolve;

export class Helpers {
	public static getFileName(str: string) {
		return str.split('\\').pop().split('/').pop();
	}

	public static strIsNullOrEmpty(str: string): boolean {
		return typeof str === 'string' && (str === undefined || str === '');
	}

	public static mapObject(obj: any): Map<string, any> {
		const keys = Object.keys(obj);
		return new Map(keys.map(key => [`${key}`, Reflect.get(obj, key)]));
	}

	public static mapObjectToStr(obj: any): Map<string, string> {
		const keys = Object.keys(obj);
		return new Map(keys.map(key => [`${key}`, `${Reflect.get(obj, key)}`]));
	}

	public static removeAt(array: any[], me: any) {
		array.forEach((item, index) => {
			if (item === me) array.splice(index, 1);
		});
	}

	public static fileExists(path: string): boolean {
		return existsSync(path);
	}

	public static fixPath(root: string, path: string): string {
		try {
			if (new RegExp(ContentMatch.rootedPath, 'gim').test(path))
				return path.replace(new RegExp(ContentMatch.startingSlash, 'gim'), '').replace('\\', '/');

			let tmpPath = path.replace(new RegExp(ContentMatch.startingSlashDot, 'gim'), '');
			tmpPath = tmpPath.replace(new RegExp(ContentMatch.queryStringStart, 'gim'), '');

			// TODO: this assumes Windows OS, VS Code is cross-plat and content devs are using this
			// On macOS and Linux, we need to use the proper bits from Node.JS path:
			// https://nodejs.dev/learn/nodejs-file-paths

			// eslint-disable-next-line prefer-const
			let tmpRoot = 'C:\\' + root.replace('/', '\\');
			tmpPath = tmpPath.replace('/', '\\');

			let newPath = `${resolve(tmpRoot + '\\' + tmpPath)}`;
			newPath = newPath.replace('C:\\', '').replace('\\', '/');

			return newPath;
		} catch (e) {
			console.log(e);
		}

		return '';
	}

	public static getSnippetContent(
		attributeValues: Map<string, string>,
		content: string,
		file: string
	) {
		const lines: ContentMatch[] = ContentMatch.splitIntoLines(content);

		if (attributeValues.has('range')) {
			const ranges = `${attributeValues.get('range')}`.split(',');
			let lineNumbers: Set<number> = new Set<number>();
			for (let range of ranges) {
				if (range.indexOf('-') >= 0) {
					let portions = range.split('-');
					if (portions.length !== 2) {
						console.log(`"Could not get ranges for ${range} for ${file}`);
						continue;
					}

					let start = -1;
					let end = -1;
					start = +portions[0];
					end = +portions[1];
					if (start >= 0 && end >= 0) {
						start--;
						for (let i = start; i < end; i++) lineNumbers.add(i);
					}
				} else {
					let line = -1;
					line = +range;
					if (line >= 0) {
						line--;
						lineNumbers.add(line);
					}
				}
			}

			let join: string[] = [];
			try {
				content = Array.from(lineNumbers.values())
					.filter(e => e >= 0 && e <= lines.length)
					.map(e => lines[e].getGroup('line'))
					.join('\r\n');
			} catch (e) {
				console.log(e);
			}
		} else if (attributeValues.has('id')) {
			let id = attributeValues.get('id');
			let startLine = lines.filter(e =>
				new RegExp(`(#\\s*region\\s*(Snippet)?${id}|<(Snippet)?${id}>)`, 'gim').test(
					e.getGroup('0')
				)
			)[0];
			let ends = lines.filter(e => new RegExp(`#\\s*endregion`, 'gim').test(e.getGroup('0')));
			let endLine = lines.filter(e =>
				new RegExp(`</(Snippet)?${id}>`, 'gim').test(e.getGroup('0'))
			)[0];

			if (
				startLine !== undefined &&
				((endLine !== undefined && startLine !== endLine) || ends.length > 0)
			) {
				let startIndex = lines.indexOf(startLine);
				let endIndex = -1;
				if (undefined === endLine && ends.length > 0) {
					for (let newEnd of ends) {
						endIndex = lines.indexOf(newEnd);
						if (endIndex > startIndex) {
							break;
						}
					}
				} else endIndex = lines.indexOf(endLine);

				while (lines[startIndex].getGroup('line').startsWith('#') && startIndex < endIndex) {
					startIndex++;
				}

				if (endIndex > startIndex) {
					content = lines
						.slice(startIndex, endIndex - startIndex)
						.map(e => e.getGroup('line'))
						.join('\r\n');
				} else console.log(`Could not get snippet ${id} for ${file}`);
			} else {
				console.log(`Could not get snippet ${id} for ${file}. Returning all content`);
			}
		}

		return content;
	}

	public static readInclude(filename: string): ContentBlock[] {
		return [];
	}

	public static readSnippetFile(snippetName: string, filename: string, baseFile: string): string {
		return '';
	}

	public static getRedirect(path: string): string {
		return '';
	}

	public static strTrimSpaces(input: string): string {
		return input.replace(/^\s*/gim, '').replace(/\s*$/gim, '');
	}

	public static trim(str, ch) {
		let start = 0;
		let end = str.length;
		while (start < end && str[start] === ch) ++start;
		while (end > start && str[end - 1] === ch) --end;
		return start > 0 || end < str.length ? str.substring(start, end) : str;
	}

	public static trimEnd(str, ch) {
		let start = 0;
		let end = str.length;
		while (end > start && str[end - 1] === ch) --end;
		return start > 0 || end < str.length ? str.substring(start, end) : str;
	}

	public static trimStart(str, ch) {
		let start = 0;
		let end = str.length;
		while (start < end && str[start] === ch) ++start;
		return start > 0 || end < str.length ? str.substring(start, end) : str;
	}

	public static getRange(start: number, end: number): number[] {
		return Array.from({ length: end - start + 1 }, (v, k) => k + start);
	}

	public static intersects(one: any[], two: any[]): boolean {
		return one.some(value => two.includes(value));
	}

	public static getFileType(path: string): FileTypeEnum {
		if (new RegExp(ContentMatch.includeFile, 'gim').test(path)) {
			return FileTypeEnum.Include;
		}

		if (new RegExp(ContentMatch.articleFile, 'gim').test(path)) {
			return FileTypeEnum.Article;
		}

		if (new RegExp(ContentMatch.indexFile, 'gim').test(path)) {
			return FileTypeEnum.Index;
		}

		if (new RegExp(ContentMatch.tocFile, 'gim').test(path)) {
			return FileTypeEnum.ToC;
		}
	}
}
