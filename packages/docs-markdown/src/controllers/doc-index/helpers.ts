/* eslint-disable import/no-unresolved */
/* eslint-disable no-console */
import { ContentBlock } from './content-block';
import { ContentMatch } from './content-match';
import { FileTypeEnum } from './filetype-enum';
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
