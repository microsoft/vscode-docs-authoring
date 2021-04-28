import { ContentBlock } from './content-block';
import { ContentMatch } from './content-match';
import { FileTypeEnum } from './filetype-enum';
const resolve = require('path').resolve;

export class Helpers {
	public static getFileName(str: string) {
		return str.split('\\').pop().split('/').pop();
	}

	public static strIsNullOrEmpty(str: string): boolean {
		return typeof str === 'string' && (str === null || str === '');
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
			if (ContentMatch.rootedPath.test(path))
				return path.replace(ContentMatch.startingSlash, '').replace('\\', '/');

			var tmpPath = path.replace(ContentMatch.startingSlashDot, '');
			tmpPath = tmpPath.replace(ContentMatch.queryStringStart, '');

			// TODO: this assumes Windows OS, VS Code is cross-plat and content devs are using this
			// On macOS and Linux, we need to use the proper bits from Node.JS path:
			// https://nodejs.dev/learn/nodejs-file-paths

			var tmpRoot = 'C:\\' + root.replace('/', '\\');
			tmpPath = tmpPath.replace('/', '\\');

			var newPath = `${resolve(tmpRoot + '\\' + tmpPath)}`;
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
		return Array.from({ length: end - start }, (v, k) => k + start);
	}

	public static intersects(one: any[], two: any[]): boolean {
		return one.some(value => two.includes(value));
	}

	public static getFileType(path: string): FileTypeEnum {
		if (ContentMatch.includeFile.test(path)) {
			return FileTypeEnum.Include;
		}

		if (ContentMatch.articleFile.test(path)) {
			return FileTypeEnum.Article;
		}

		if (ContentMatch.indexFile.test(path)) {
			return FileTypeEnum.Index;
		}

		if (ContentMatch.tocFile.test(path)) {
			return FileTypeEnum.ToC;
		}
	}
}
