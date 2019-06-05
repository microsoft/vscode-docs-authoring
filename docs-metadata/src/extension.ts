import {commands, 
		env, 
		window, 
		workspace, 
		ExtensionContext, 
		OpenDialogOptions,
		Uri} from 'vscode';

export function activate(context: ExtensionContext) {

	let disposable = commands.registerCommand('extension.extract', async () => {
		
		let folderPath = await showFolderSelectionDialog();

		let args = await showArgsQuickInput();
		
		console.log(`extract folderPath: ${folderPath}, with args: ${args}`);

		//show a banner stating what is going to happen with ok|cancel
	});

	context.subscriptions.push(disposable);
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

// this method is called when your extension is deactivated
export function deactivate() {}
