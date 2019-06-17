
import {commands, 
	env, 
	Task,
	window, 
	workspace,
	ShellExecution, 
	ShellExecutionOptions,
	OpenDialogOptions,
	Uri} from 'vscode';

import {getRepoName} from "../helper/common";
import * as moment from "moment";
import { getExtensionPath } from '../extension';
import {exec} from 'child_process';

let fileName:string = "";
export function getMutFileName()
{
	if(fileName === "")
	{
		return workspace.rootPath ? workspace.rootPath : "./";
	}
	return fileName;
}

export function showExtractionCancellationMessage()
{
	window.showInformationMessage("Metadata extraction cancelled.");
}

export function showExtractConfirmationMessage(args:string, folderPath:string)
{
	var message = "";
		if(args)
		{
			message = `Extracting metadata for path: ${folderPath}, using arguments: "${args}"`;
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
				fileName = `${workspace.rootPath}/metadata/${getRepoName(Uri.file(folderPath))}_mut_extract_${moment().format('MMDDYYYYhmmA')}.csv`;
				let command = `mkdir "${workspace.rootPath}/metadata" | dotnet "${getExtensionPath() + "\\.muttools\\"}mdextractcore.dll" --path "${folderPath}" --recurse -o "${fileName}" ${args}`;
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
				
				  window.showInformationMessage(`Metadata extracted and placed in: ${fileName}`);
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
		placeHolder: '(Optional) Enter any additional command-line args. (i.e. "-t ms.author,author")'
	});

	return result;
}