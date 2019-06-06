
import {commands, 
	env, 
	window, 
	workspace, 
	ExtensionContext, 
	OpenDialogOptions,
	Uri} from 'vscode';

export async function showApplyMetadataMessage(folderPath:string)
{
	window.showInformationMessage(`Apply MUT file ${folderPath}?`, 
								"OK", "Change Location","Cancel")
	.then(selectedItem => {
		if(selectedItem === "OK")
		{
			//Todo... apply the metadata using mdapplycore
		} else if(selectedItem === "Change Location"){
			let filePath = showChooseMetadataCsvDialog(folderPath);
			//Todo... apply the metadata using mdapplycore and the file path.
		} else {
			//operation canceled.
			showApplyCancellationMessage();
		}
	});
}

export function showApplyCancellationMessage()
{
	window.showInformationMessage("Metadata apply cancelled.");
}

export async function showChooseMetadataCsvDialog(folderPath:string)
{
	const options: OpenDialogOptions = {
		canSelectMany: false,
		defaultUri:Uri.file(folderPath),
		openLabel: 'Apply Metadata',
		filters: {
			'CSV files': ['csv']
		}
   };
   
   let filePath = "";
   await window.showOpenDialog(options).then(fileUri => {
		if (fileUri && fileUri[0]) {
			filePath = fileUri[0].fsPath;
		}
	});

	return filePath;
}