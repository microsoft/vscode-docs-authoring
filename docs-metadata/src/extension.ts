import {
    commands,
    Extension,
    ExtensionContext,
    extensions,
    window,
} from "vscode";
import { showApplyMetadataMessage } from "./controllers/apply-controller";
import {
    getMutFileName,
    showArgsQuickInput,
    showExtractConfirmationMessage,
    showExtractionCancellationMessage,
    showFolderSelectionDialog,
} from "./controllers/extract-controller";
import * as util from "./util/common";
import { ExtensionDownloader } from "./util/ExtensionDownloader";
import { Logger } from "./util/logger";

let extensionPath = "";

export const output = window.createOutputChannel("docs-metadata");

export function getExtensionPath(): string {
    return extensionPath;
}

export async function activate(context: ExtensionContext) {

    extensionPath = context.extensionPath;
    const extensionId = "docsmsft.docs-metadata";
    const extension = extensions.getExtension(extensionId) || null;
    util.setExtensionPath(context.extensionPath);

    const logger = new Logger();

    const extractCommand = commands.registerCommand("docs.extract", async () => {

        await ensureRuntimeDependencies(extension, logger);

        const folderPath = await showFolderSelectionDialog();

        // a blank folderPath signifies a cancel.
        if (folderPath === "") {
            showExtractionCancellationMessage();
            return;
        }

        const args = await showArgsQuickInput();

        // undefined args represent a cancel.
        if (args === undefined) {
            showExtractionCancellationMessage();
            return;
        }

        showExtractConfirmationMessage(args, folderPath);

    });

    const applyCommand = commands.registerCommand("docs.apply", async () => {
        showApplyMetadataMessage(getMutFileName());
    });

    context.subscriptions.push(extractCommand);
    context.subscriptions.push(applyCommand);

}

export async function ensureRuntimeDependencies(extension: Extension<any>, logger: Logger): Promise<boolean> {
    return util.installFileExists(util.InstallFileType.Lock)
        .then((exists) => {
            if (!exists) {
                const downloader = new ExtensionDownloader(logger, extension.packageJSON);
                return downloader.installRuntimeDependencies();
            } else {
                return true;
            }
        });
}

// this method is called when your extension is deactivated
export function deactivate() { output.appendLine("Deactivating extension."); }
