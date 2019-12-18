import {
    commands,
    ExtensionContext,
    Uri,
    window,
    workspace,
    ProgressLocation
} from "vscode";

import { ImageCompressor } from "./compressor";
import { resultToString } from "./utilities";

const output = window.createOutputChannel("Docs: Image compression");

export async function activate(context: ExtensionContext) {
    const compressCommand =
        commands.registerCommand("docs.compressImage", async (uri: Uri) => {
            window.withProgress({
                location: ProgressLocation.Window
            }, async progress => {
                const compressor = new ImageCompressor(output, progress);
                const config = workspace.getConfiguration("docsImages");
                const maxWidth = config.get<number>("maxWidth");
                const maxHeight = config.get<number>("maxHeight");

                const result = await compressor.compressImage(uri.fsPath, maxWidth, maxHeight);
                const resultStr = resultToString(result);
                
                output.appendLine(resultStr);
                progress.report({ message: resultStr });
            });
        });

    context.subscriptions.push(compressCommand);
}

export function deactivate() {
    if (output) {
        output.hide();
        output.clear();
        output.dispose();
    }
 }
