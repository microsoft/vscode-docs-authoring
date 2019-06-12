import {commands, 
		workspace,
		extensions,
		Extension, 
		ExtensionContext} from 'vscode';

import {showExtractionCancellationMessage, 
		showArgsQuickInput, 
		showFolderSelectionDialog,
		showExtractConfirmationMessage} from "./controllers/extract-controller";

import * as util from './util/common';
import { ExtensionDownloader } from './util/ExtensionDownloader';

import { Logger } from './util/logger';

import {showApplyMetadataMessage} from "./controllers/apply-controller";


let extensionPath = "";

export function getExtensionPath(): string {
	return extensionPath;
}

export async function activate(context: ExtensionContext) {

	extensionPath = context.extensionPath;
	const extensionId = 'docsmsft.docs-metadata';
	const extension = extensions.getExtension(extensionId);
	util.setExtensionPath(context.extensionPath);

	const logger = new Logger();

	await ensureRuntimeDependencies(extension, logger);

	let extractCommand = commands.registerCommand('extension.extract', async () => {
		
		let folderPath = await showFolderSelectionDialog();

		//a blank folderPath signifies a cancel.
		if(folderPath === ""){ 
			showExtractionCancellationMessage();
			return; 
		}

		let args = await showArgsQuickInput();

		//undefined args represent a cancel.
		if(args === undefined){ 
			showExtractionCancellationMessage();
			return; 
		}
		
		showExtractConfirmationMessage(args, folderPath);

	});

	let applyCommand = commands.registerCommand('extension.apply', async () => {
		let metadataCsvPath = workspace.rootPath ? workspace.rootPath : "./";
		showApplyMetadataMessage(metadataCsvPath);
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

function platformIsSupported(logger: Logger): boolean {
	var getos = require('getos')
 
	let dist: string;
	let platform: string;
	getos(function(e,os) {
	  if(e) {
		  logger.log("Failed to learn the OS.");
		  logger.log(e);
		  return;
	  }
	  logger.log("Your OS is:" +JSON.stringify(os));
	  dist = os.dist;
	  platform = os.os;
	});

	if (platform === 'darwin' || platform === 'win32') {
		return true;
	}

	if (!dist) {
		logger.log("Unknown distribution.");
		return false;
	}

	const supportedPlatforms = Configuration.getSupportedPlatforms();
    supportedPlatforms.forEach(item => {
		if (dist.toLowerCase().indexOf(item) > -1 ) {
			logger.log("Supported distribution.");
			return true;
		}
	});

	logger.log("Not-supported distribution.")
	return false;
}

// this method is called when your extension is deactivated
export function deactivate() {}
