'use strict';

import { readFileSync } from 'fs';
import { Disposable, ExtensionContext } from 'vscode';
import TelemetryReporter from 'vscode-extension-telemetry';

export let reporter: TelemetryReporter;

export class Reporter extends Disposable {
	constructor(context: ExtensionContext) {
		super(() => reporter.dispose());
		const packageInfo = getPackageInfo(context);
		reporter =
			packageInfo &&
			new TelemetryReporter(packageInfo.name, packageInfo.version, packageInfo.aiKey);
	}
}

interface PackageInfo {
	name: string;
	version: string;
	aiKey: string;
}

function readJson(path: string) {
	const json = readFileSync(path, 'utf8');
	return JSON.parse(json);
}

function getPackageInfo(context: ExtensionContext): PackageInfo {
	const extensionPackage = readJson(context.asAbsolutePath('./package.json'));
	return {
		name: extensionPackage.name,
		version: extensionPackage.version,
		aiKey: extensionPackage.aiKey
	};
}
