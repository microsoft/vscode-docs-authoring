'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {commands, 
        window, 
        workspace,
        ExtensionContext,
        TextDocument} from 'vscode';
import * as path from 'path';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "sonic-viewer" is now active!');

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with  registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = commands.registerCommand('extension.sayHello', () => {
        // The code you place here will be executed every time your command is executed

        // Display a message box to the user
        window.showInformationMessage('Hello World!');
    });

    context.subscriptions.push(disposable);

    // context.subscriptions.push(window.onDidChangeTextEditorSelection((event) => {
    //     if (isMarkdownFile(event.textEditor.document)) {
    //     }
    // }));

    return {
        extendMarkdownIt(md) {
            var filePath = window.activeTextEditor.document.fileName;
            var workingPath = filePath.replace(path.basename(filePath), '')
            return md.use(require('markdown-it-include'), {root:workingPath, includeRe:/\[!include\s*\[\s*.+?\s*]\(\s*(.+?)\s*\)\s*]/i})
                     .use(require('markdown-it-include'), {root:workingPath, includeRe:/\[!code-cs\s*\[\s*.+?\s*]\(\s*(.+?)\s*\)\s*]/i});
        }
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
}

export function isMarkdownFile(document: TextDocument) {
    return document.languageId === "markdown"; // prevent processing of own documents
}
