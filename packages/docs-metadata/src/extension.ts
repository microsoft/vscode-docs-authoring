import { commands, ExtensionContext, extensions, window } from 'vscode';
import { showApplyMetadataMessage } from './controllers/apply-controller';
import {
	getMutFileName,
	showArgsQuickInput,
	showExtractConfirmationMessage,
	showExtractionCancellationMessage,
	showFolderSelectionDialog
} from './controllers/extract-controller';
import { Logger } from './util/logger';
import { setExtensionPath, output } from './util/common';
import { ensureRuntimeDependencies } from './util/ExtensionDownloader';

let extensionPath = '';

export async function activate(context: ExtensionContext) {
	extensionPath = context.extensionPath;
	const extensionId = 'docsmsft.docs-metadata';
	const extension = extensions.getExtension(extensionId) || null;
	setExtensionPath(context.extensionPath);

	const logger = new Logger();

	const extractCommand = commands.registerCommand('docs.extract', async () => {
		await ensureRuntimeDependencies(extension, logger);

		const folderPath = await showFolderSelectionDialog();

		// a blank folderPath signifies a cancel.
		if (folderPath === '') {
			showExtractionCancellationMessage();
			return;
		}

		const args = await showArgsQuickInput();

		// undefined args represent a cancel.
		if (args === undefined) {
			showExtractionCancellationMessage();
			return;
		}

		showExtractConfirmationMessage(args, folderPath);
	});

	const applyCommand = commands.registerCommand('docs.apply', async () => {
		showApplyMetadataMessage(getMutFileName());
	});

	context.subscriptions.push(extractCommand);
	context.subscriptions.push(applyCommand);
}

// this method is called when your extension is deactivated
export function deactivate() {
	output.appendLine('Deactivating extension.');
}
