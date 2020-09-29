'use strict';

import * as vscode from 'vscode';
import { checkExtensionInstalled, generateTimestamp } from '../helper/common';
import { sendTelemetryData } from '../helper/telemetry';

export const DocsValidationExtensionName = 'docsmsft.docs-build';

export function validateRepositoryCommand() {
	const commands = [{ command: validateRepository.name, callback: validateRepository }];
	return commands;
}

export function validateRepository() {
	const { msTimeValue } = generateTimestamp();
	const friendlyName = DocsValidationExtensionName.split('.').reverse()[0];
	const inactiveMessage = `[${msTimeValue}] - The ${friendlyName} extension is not installed.`;
	if (checkExtensionInstalled(DocsValidationExtensionName, inactiveMessage)) {
		vscode.commands.executeCommand('docs.build');
	}
	sendTelemetryData('validateRepository', '');
}
