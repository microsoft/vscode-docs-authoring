'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import {
    commands,
    window,
    ExtensionContext,
    TextDocument
} from 'vscode';

import { resolve, basename } from 'path';
import { readFileSync } from 'fs';

const INCLUDE_RE = /\[!include\s*\[\s*.+?\s*]\(\s*(.+?)\s*\)\s*]/i
const CODE_RE = /\[\!code-(.*)\[(.*)\]\((.*)\)\]/gmi
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
            let filePath = window.activeTextEditor.document.fileName;
            const workingPath = filePath.replace(basename(filePath), '')
            return md.use(require('markdown-it-include'), { root: workingPath, includeRe: INCLUDE_RE })
                .use(codeSnippets, { root: workingPath })
        }
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
}

export function isMarkdownFile(document: TextDocument) {
    return document.languageId === "markdown"; // prevent processing of own documents
}

function codeSnippets(md, options) {
    const replaceCodeSnippetWithContents = (src, rootdir) => {
        let captureGroup = CODE_RE.exec(src)
        //captureGroup[1] = programming langugage (cs, js, ruby etc..)
        //captureGroup[3] = relativePathFileName
        const filePath = resolve(rootdir, captureGroup[3].trim());
        let mdSrc = readFileSync(filePath, 'utf8');
        //```cs
        // ...
        // code block
        // ...
        //```
        mdSrc = `\`\`\`${captureGroup[1].trim()}\r\n${mdSrc}\r\n\`\`\``
        src = src.slice(0, captureGroup.index) + mdSrc + src.slice(captureGroup.index + captureGroup[0].length, src.length);
        return src;
    }

    const importCodeSnippet = (state) => {
        try {
            state.src = replaceCodeSnippetWithContents(state.src, options.root)
        } catch (error) {
            console.log(error)
        }
    }

    md.core.ruler.before('normalize', 'codesnippet', importCodeSnippet);
}