'use strict';

import { commands, ExtensionContext } from 'vscode';
import { output } from './helper/common';
import { mailerCommand } from './controllers/mail-controller';

export async function activate(context: ExtensionContext) {
	const ControllerCommands: any = [];
	mailerCommand().forEach(cmd => ControllerCommands.push(cmd));
	ControllerCommands.map((cmd: any) => {
		const commandName = cmd.command;
		const command = commands.registerCommand(commandName, cmd.callback);
		context.subscriptions.push(command);
	});
}

// this method is called when your extension is deactivated
export function deactivate() {
	output.appendLine('Deactivating extension.');
}
