'use strict';

import * as vscode from 'vscode';
import { checkExtension, generateTimestamp } from '../helper/common';
import { sendTelemetryData } from '../helper/telemetry';

const telemetryCommand: string = 'applyTemplate';

export function applyTemplateCommand() {
	const commands = [{ command: applyTemplate.name, callback: applyTemplate }];
	return commands;
}

export function applyTemplate() {
	sendTelemetryData(telemetryCommand, '');
	const extensionName = 'docsmsft.docs-article-templates';
	const { msTimeValue } = generateTimestamp();
	const friendlyName = 'docsmsft.docs-article-templates'.split('.').reverse()[0];
	const inactiveMessage = `[${msTimeValue}] - The ${friendlyName} extension is not installed.`;
	if (checkExtension(extensionName, inactiveMessage)) {
		vscode.commands.executeCommand('applyTemplate');
	}
}
