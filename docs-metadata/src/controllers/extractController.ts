
import {commands, 
	env, 
	window, 
	workspace, 
	ExtensionContext, 
	OpenDialogOptions,
	Uri} from 'vscode';

	
export function showExtractionCancellationMessage()
{
	window.showInformationMessage("Metadata extraction cancelled.");
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