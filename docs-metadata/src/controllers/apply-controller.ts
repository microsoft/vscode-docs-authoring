
import {commands, 
	env, 
	window, 
	workspace, 
	ExtensionContext, 
	OpenDialogOptions,
	Uri} from 'vscode';

import {exec} from 'child_process';
import { getExtensionPath } from '../extension';

export async function showApplyMetadataMessage(path:string)
{
	if(path.indexOf(".csv") === -1)
	{
		window.showInformationMessage(`Please find a Metadata Update Tool file to apply...`, 
								"Find MUT file","Cancel")
		.then(async selectedItem => {
			if(selectedItem === "Find MUT file"){
				let filePath = await showChooseMetadataCsvDialog(path);
				if(filePath === "")
				{
					showApplyCancellationMessage();
				}
				applyMetadata(filePath);
			} else {
				//operation canceled.
				showApplyCancellationMessage();
			}
		});
	} else {
		window.showInformationMessage(`Apply Metadata Update Tool(MUT) file ${path}?`, 
								"OK", "Change Location","Cancel")
		.then(async selectedItem => {
			if(selectedItem === "OK")
			{
				applyMetadata(path);
			} else if(selectedItem === "Change Location"){
				let filePath = await showChooseMetadataCsvDialog(path);
				applyMetadata(filePath);
			} else {
				//operation canceled.
				showApplyCancellationMessage();
			}
		});
	}

}

function applyMetadata(filePath:string)
{
	let command = `dotnet "${getExtensionPath() + "\\.muttools\\"}mdapplycore.dll" "${filePath}"`;
	exec(command, (err, stdout, stderr) => {
		if (err) {
			// node couldn't execute the command
			console.log(`Error: ${err}`);
			console.log(`${stderr}`);
			return;
		}
		
		// the *entire* stdout and stderr (buffered)
		console.log(`stdout: ${stdout}`);
		console.log(`stderr: ${stderr}`);
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