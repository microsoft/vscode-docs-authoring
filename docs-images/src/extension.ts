import {
    commands,
    ExtensionContext,
    Uri,
    window,
    workspace,
    ProgressLocation,
    RelativePattern
} from "vscode";

import { ImageCompressor } from "./compressor";
import { resultToString, resultsToString } from "./utilities";

const output = window.createOutputChannel("Docs: Image compression");

export async function activate(context: ExtensionContext) {
    const config = workspace.getConfiguration("docsImages");
    const maxWidth = config.get<number>("maxWidth");
    const maxHeight = config.get<number>("maxHeight");

    [
        commands.registerCommand("docs.compressImage", async (uri: Uri) => {
            window.withProgress({
                location: ProgressLocation.Window
            }, async progress => {
                const compressor = new ImageCompressor(output, progress);
                const result = await compressor.compressImage(uri.fsPath, maxWidth, maxHeight);
                const resultStr = resultToString(result);
                
                output.appendLine(resultStr);
                progress.report({ message: resultStr });
            });
        }),
        commands.registerCommand("docs.compressImagesInFolder", async (uri: Uri) => {
            window.withProgress({
                location: ProgressLocation.Window
            }, async progress => {
                const compressor = new ImageCompressor(output, progress);
                const filePaths =
                    await workspace.findFiles(
                        new RelativePattern(
                            uri.path,
                            `**/*.{png,jpg,jpeg,gif,svg,webp}`));
                const results = await compressor.compressImagesInFolder(filePaths.map(u => u.fsPath), maxWidth, maxHeight);
                const resultStr = resultsToString(results);
                
                output.appendLine(resultStr);
                progress.report({ message: resultStr });
            });
        })
    ].forEach(cmd => context.subscriptions.push(cmd));
}

export function deactivate() {
    if (output) {
        output.hide();
        output.clear();
        output.dispose();
    }
 }
