import { OutputChannel, window } from 'vscode';

export class Logger {
	private static _outputChannel: OutputChannel;

	static initialize() {
		if (!this._outputChannel) {
			// Only init once
			this._outputChannel = window.createOutputChannel('Docs Visual Areas');
		}
	}

	static getChannel() {
		this.initialize();
		return this._outputChannel;
	}

	// eslint-disable-next-line @typescript-eslint/ban-types
	static info(value: string | object | undefined, indent = false, title = '') {
		if (title) {
			this._outputChannel.appendLine(title);
		}
		const message = prepareMessage(value, indent);
		this._outputChannel.appendLine(message);
	}
}

// eslint-disable-next-line @typescript-eslint/ban-types
function prepareMessage(value: string | object | undefined, indent: boolean) {
	const prefix = indent ? '  ' : '';
	let text = '';
	if (typeof value === 'object') {
		if (Array.isArray(value)) {
			text = `${prefix}${JSON.stringify(value, null, 2)}`;
		} else {
			Object.entries(value).map(item => {
				text += `${prefix}${item[0]} = ${item[1]}\n`;
			});
		}
		return text;
	}
	text = `${prefix}${value}`;
	return text;
}

Logger.initialize();
