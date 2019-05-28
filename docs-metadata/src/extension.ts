import {commands, env, window, workspace, ExtensionContext} from 'vscode';

export function activate(context: ExtensionContext) {

	const command = 'extension.sayHello';
	const commandHandler = (name?: string = 'world') => {
		console.log(`Hello ${name}!!!`);
	  };

	let disposable = commands.registerCommand('extension.extract', async (arg1: any) => {
		//TODO: extract metadata
		
		//get the selected subfolder, or use root if no selection is made
		//ref: https://github.com/Microsoft/vscode/issues/3553
		await commands.executeCommand('workbench.action.files.copyPathOfActiveFile');
		//await commands.executeCommand('copyRelativeFilePath');
		let folderPath = await env.clipboard.readText();
		if(folderPath.toLowerCase().indexOf(workspace.rootPath) === -1)
		{
			folderPath = workspace.rootPath;
		} else {
			folderPath = folderPath.substring(0, folderPath.lastIndexOf("\\"));
		}
		console.log(`extract folderPath: ${folderPath}`);

		//get the values added after "Docs Metadata: Extract" from the command pallette
		console.log(arg1);

		//show a banner stating what is going to happen with ok|cancel
	});

	context.subscriptions.push(disposable);
	context.subscriptions.push(commands.registerCommand(command, commandHandler));
}

// this method is called when your extension is deactivated
export function deactivate() {}
