import * as vscode from 'vscode';
import { extensionId } from './constants';

export function getExtension() {
	let extension: vscode.Extension<any> | undefined;
	const ext = vscode.extensions.getExtension(extensionId);
	if (!ext) {
		throw new Error('Extension was not found.');
	}
	if (ext) {
		extension = ext;
	}
	return extension;
}

export class State {
	private static _extContext: vscode.ExtensionContext;

	public static get extensionContext(): vscode.ExtensionContext {
		return this._extContext;
	}

	public static set extensionContext(ec: vscode.ExtensionContext) {
		this._extContext = ec;
	}
}

export function getExtensionVersion() {
	const extension = getExtension();
	const version: string = extension ? extension.packageJSON.version : '';
	return version;
}
