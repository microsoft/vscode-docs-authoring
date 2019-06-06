
import {commands, 
	env, 
	window, 
	workspace, 
	ExtensionContext, 
	OpenDialogOptions,
	Uri} from 'vscode';

import {getRepoName} from "../helper/common";

export function showExtractionCancellationMessage()
{
	window.showInformationMessage("Metadata extraction cancelled.");
}

export function showExtractConfirmationMessage(args:string, folderPath:string)
{
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
}

export async function showFolderSelectionDialog()
{
	let folderPath = workspace.rootPath ? workspace.rootPath : '';
	const options: OpenDialogOptions = {
		canSelectMany: false,
		canSelectFiles: false,
		canSelectFolders: true,
		defaultUri:Uri.file(folderPath),
		openLabel: 'Select'
   };

   await window.showOpenDialog(options).then(fileUri => {
		if (fileUri && fileUri[0]) {
			folderPath = fileUri[0].fsPath;
		} else {
			folderPath = "";
		}
	});

	return folderPath;
}

export async function showArgsQuickInput()
{
	const result = await window.showInputBox({
		value: '',
		placeHolder: '(Optional) Enter any additional command-line args.'
	});

	return result;
}