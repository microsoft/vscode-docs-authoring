/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';
import { Logger } from './logger';
import { PackageError, PackageManager, Status } from './packages';
import {
	deleteInstallFile,
	InstallFileType,
	output,
	touchInstallFile,
	installFileExists
} from './common';
import { Extension } from 'vscode';
import { PlatformInformation } from './PlatformInformation';

/*
 * Class used to download the runtime dependencies of the C# Extension
 */
export class ExtensionDownloader {
	public constructor(private logger: Logger, private packageJSON: any) {}

	public installRuntimeDependencies(): Promise<boolean> {
		this.logger.log('Installing reStructuredText dependencies...');
		this.logger.show();

		const statusItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
		const status: Status = {
			setDetail: text => {
				statusItem.tooltip = text;
				statusItem.show();
			},
			setMessage: text => {
				statusItem.text = text;
				statusItem.show();
			}
		};

		let platformInfo: PlatformInformation;
		let packageManager: PackageManager;
		let installationStage = 'touchBeginFile';
		let errorMessage = '';
		let success = false;

		const telemetryProps: any = {};

		return touchInstallFile(InstallFileType.Begin)
			.then(() => {
				installationStage = 'getPlatformInfo';
				return PlatformInformation.GetCurrent();
			})
			.then(info => {
				platformInfo = info;
				packageManager = new PackageManager(info, this.packageJSON);
				this.logger.appendLine();

				// Display platform information and RID followed by a blank line
				this.logger.appendLine(`Platform: ${info.toString()}`);
				this.logger.appendLine();

				installationStage = 'downloadPackages';

				const config = vscode.workspace.getConfiguration();
				const proxy = config.get<string>('http.proxy') || '';
				const strictSSL = config.get('http.proxyStrictSSL', true);

				return packageManager.DownloadPackages(this.logger, status, proxy, strictSSL);
			})
			.then(() => {
				this.logger.appendLine();

				installationStage = 'installPackages';
				return packageManager.InstallPackages(this.logger, status);
			})
			.then(() => {
				installationStage = 'touchLockFile';
				return touchInstallFile(InstallFileType.Lock);
			})
			.then(() => {
				installationStage = 'completeSuccess';
				success = true;
			})
			.catch(error => {
				if (error instanceof PackageError) {
					// we can log the message in a PackageError to telemetry as we do not put PII in PackageError messages
					telemetryProps['error.message'] = error.message;

					if (error.innerError) {
						errorMessage = error.innerError.toString();
					} else {
						errorMessage = error.message;
					}

					if (error.pkg) {
						telemetryProps['error.packageUrl'] = error.pkg.url;
					}
				} else {
					// do not log raw errorMessage in telemetry as it is likely to contain PII.
					errorMessage = error.toString();
				}

				this.logger.appendLine(`Failed at stage: ${installationStage}`);
				this.logger.appendLine(errorMessage);
			})
			.then(() => {
				// tslint:disable-next-line: no-string-literal
				telemetryProps.installStage = installationStage;
				telemetryProps['platform.architecture'] = platformInfo.architecture;
				telemetryProps['platform.platform'] = platformInfo.platform;
				if (platformInfo.distribution) {
					telemetryProps['platform.distribution'] = platformInfo.distribution.toTelemetryString();
				}

				this.logger.appendLine();
				installationStage = '';
				this.logger.appendLine('Finished');

				statusItem.dispose();
			})
			.then(() => {
				// We do this step at the end so that we clean up the begin file in the case that we hit above catch block
				// Attach a an empty catch to this so that errors here do not propogate
				return deleteInstallFile(InstallFileType.Begin).catch(error => {
					output.appendLine(error);
				});
			})
			.then(() => {
				return success;
			});
	}
}

export async function ensureRuntimeDependencies(
	extension: Extension<any>,
	logger: Logger
): Promise<boolean> {
	return installFileExists(InstallFileType.Lock).then(exists => {
		if (!exists) {
			const downloader = new ExtensionDownloader(logger, extension.packageJSON);
			return downloader.installRuntimeDependencies();
		} else {
			return true;
		}
	});
}
