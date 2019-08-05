
import {commands,
		window, 
		workspace,
		OpenDialogOptions,
		Uri,
		ViewColumn} from 'vscode';

import {getRepoName, execPromise, metadataDirectory, openFolderInExplorerOrFinder } from "../util/common";
import * as moment from "moment";
import { getExtensionPath } from '../extension';
import { PlatformInformation } from '../util/platform';

const outputChannel = window.createOutputChannel('docs-metadata');

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
			message = `Extracting metadata "${args}" for path: ${folderPath}.`;
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
		.then(async selectedItem => {
			if(selectedItem !== "OK")
			{
				//operation canceled.
				showExtractionCancellationMessage();
			} else {
				let repoName = getRepoName(Uri.file(folderPath));
				if(repoName != undefined)
				{
					fileName = `${metadataDirectory}/${repoName}_mut_extract_${moment().format('MMDDYYYYhmmA')}.txt`;
				} else {
					fileName = `${metadataDirectory}/mut_extract_${moment().format('MMDDYYYYhmmA')}.txt`;
				}
				const platform = await PlatformInformation.GetCurrent();
				fileName = (platform.isWindows()) ? fileName.replace(/\//g, "\\") : fileName.replace(/\\/g, "/");
				if(args !== ""){ args = "-t " + args; }
				let command = `mkdir -p "${metadataDirectory}" | dotnet "${getExtensionPath() + "/.muttools/"}mdextractcore.dll" --path "${folderPath}" --recurse -o "${fileName}" ${args}`;
				await execPromise(command).then(result => {
					window.showInformationMessage(`Metadata extracted and placed in: ${fileName}`, "Open Folder")
					.then(async selectedItem => {
						if(selectedItem === "Open Folder")
						{
							await openFolderInExplorerOrFinder(metadataDirectory);
						}
					});
					workspace.openTextDocument(fileName).then(doc => {
						window.showTextDocument(doc, ViewColumn.Two);
					});
					outputChannel.append(result.stdout);
					outputChannel.show(true);
				}).catch(result => {
					if(result.stderr.indexOf(`'dotnet' is not recognized`) > -1)
					{
						window.showInformationMessage(`It looks like you need to install the DotNet runtime.`, 
								"Install DotNet","Cancel")
						.then(async selectedItem => {
							if(selectedItem === "Install DotNet")
							{
								commands.executeCommand('vscode.open', Uri.parse('https://dotnet.microsoft.com/download'))
							}
						});
					} else if(result.stderr.indexOf(`specified framework`) > -1)
					{
						window.showErrorMessage(`Extraction unsuccessful. Please make sure you have .Net core 2.2 or greater installed.`, 
								"Install DotNet","Cancel")
						.then(async selectedItem => {
							if(selectedItem === "Install DotNet")
							{
								commands.executeCommand('vscode.open', Uri.parse('https://dotnet.microsoft.com/download'))
							}
						});
					}
				});
				
				  
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
		placeHolder: 'Type a specific tag to extract, or Enter to extract all tags.'
	});

	return result;
}