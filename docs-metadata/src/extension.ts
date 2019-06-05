import {commands, 
		env, 
		window, 
		workspace, 
		ExtensionContext, 
		OpenDialogOptions,
		Uri} from 'vscode';

import {showExtractionCancellationMessage, 
		showArgsQuickInput, 
		showFolderSelectionDialog} from "./controllers/extractController";

import {getRepoName} from "./helper/common";

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
		
		//show a banner stating what is going to happen with ok|cancel
		var message = "";
		if(args)
		{
			message = `Extracting metadata ${args} for path: ${folderPath}.`;
		} else {
			let rootPath = workspace.rootPath ? workspace.rootPath : '';
			if(folderPath === rootPath)
			{
				message = `Extracting all existing metadata for repo "${getRepoName(Uri.file(rootPath))}".`;
			} else {
				message = `Extracting all existing metadata for folder ${folderPath}.`;
			}
		}
		window.showInformationMessage(message, "OK", "Cancel")
		.then(selectedItem => {
			if(selectedItem !== "OK")
			{
				//operation canceled.
				showExtractionCancellationMessage();
			} else {
				//TODO: send the args to mdextractcore
			}
		});

	});

	let applyCommand = commands.registerCommand('extension.apply', async () => {
		console.log('apply');
	});
	
	context.subscriptions.push(extractCommand);
	context.subscriptions.push(applyCommand);
}



// this method is called when your extension is deactivated
export function deactivate() {}
