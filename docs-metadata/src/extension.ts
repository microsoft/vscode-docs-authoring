import {commands, 
		workspace, 
		ExtensionContext} from 'vscode';

import {showExtractionCancellationMessage, 
		showArgsQuickInput, 
		showFolderSelectionDialog,
		showExtractConfirmationMessage} from "./controllers/extract-controller";

import {showApplyMetadataMessage} from "./controllers/apply-controller";

export function activate(context: ExtensionContext) {

	let extractCommand = commands.registerCommand('extension.extract', async () => {
		
		let folderPath = await showFolderSelectionDialog();

		//a blank folderPath signifies a cancel.
		if(folderPath === ""){ 
			showExtractionCancellationMessage();
			return; 
		}

		let args = await showArgsQuickInput();

		//undefined args represent a cancel.
		if(args === undefined){ 
			showExtractionCancellationMessage();
			return; 
		}
		
		showExtractConfirmationMessage(args, folderPath);

	});

	let applyCommand = commands.registerCommand('extension.apply', async () => {
		let metadataCsvPath = workspace.rootPath ? workspace.rootPath : "./";
		showApplyMetadataMessage(metadataCsvPath);
	});
	
	context.subscriptions.push(extractCommand);
	context.subscriptions.push(applyCommand);
}



// this method is called when your extension is deactivated
export function deactivate() {}
