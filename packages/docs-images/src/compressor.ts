import { OutputChannel, Progress } from 'vscode';
import {
	getFileName,
	getFileSize,
	toHumanReadableString,
	calculatePercentReduction
} from './utilities';
import { Result } from './result';

import * as fs from 'fs';
import * as path from 'path';
import * as size from 'image-size';
import FileType from 'file-type';
import Jimp from 'jimp/es';
import imagemin from 'imagemin';
import imageminJpegtran from 'imagemin-jpegtran';
import imageminPng from 'imagemin-optipng';
import imageminGif from 'imagemin-gifsicle';
import imageminSvg from 'imagemin-svgo';
import imageminWebp from 'imagemin-webp';

enum Status {
	Idle,
	Initializing,
	AttemptingResize,
	AttemptingCompression,
	Done
}

export class ImageCompressor {
	private currentStatus: Status = Status.Idle;
	private isBatching = false;

	private readonly fileExtensionExpression: RegExp = /(?:\.([^.]+))?$/;
	private readonly imageExtensions: string[] = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'];

	constructor(
		private readonly output: OutputChannel,
		private readonly progress: Progress<{ message?: string; increment?: number }>
	) {
		this.output.show();
	}

	async compressImagesInFolder(
		filePaths: string[],
		maxWidth: number = 0,
		maxHeight: number = 0
	): Promise<Result[]> {
		this.isBatching = true;
		const compressTasks = filePaths.map(path => this.compressImage(path, maxWidth, maxHeight));
		const results = await Promise.all(compressTasks);
		return results;
	}

	async compressImage(
		filePath: string,
		maxWidth: number = 0,
		maxHeight: number = 0
	): Promise<Result> {
		this.updateStatus(Status.Initializing, `Attempting to compress "${filePath}".`);

		if (this.filePathHasValidExtension(filePath)) {
			const before = getFileSize(filePath);
			const wasResized = await this.tryApplyImageDimensions(filePath, maxWidth, maxHeight);
			const wasCompressed = await this.tryApplyImageCompression(filePath);
			const after = getFileSize(filePath);
			const reduction = calculatePercentReduction(before, after);

			return {
				wasCompressed: !!wasCompressed,
				wasResized: !!wasResized,
				file: getFileName(filePath),
				originalSize: before,
				before: toHumanReadableString(before),
				compressedSize: after,
				after: toHumanReadableString(after),
				reduction
			};
		} else {
			this.updateStatus(Status.Done, `Invalid image for compression "${filePath}".`);
		}

		return {
			file: getFileName(filePath),
			wasCompressed: false,
			wasResized: false
		} as Result;
	}

	private filePathHasValidExtension(filePath: string) {
		if (filePath) {
			const fileExtension = this.getFileExtension(filePath);
			return fileExtension && this.imageExtensions.some(ext => ext === fileExtension.toLowerCase());
		}

		return false;
	}

	private getFileExtension(filePath: string) {
		if (!filePath) {
			return null;
		}

		const result = this.fileExtensionExpression.exec(filePath);
		return result ? result[0] : null;
	}

	private async tryApplyImageDimensions(
		filePath: string,
		maxWidth: number = 0,
		maxHeight: number = 0
	) {
		const result = await this.tryAction(async () => {
			if (!!maxWidth || !!maxHeight) {
				let dimensions = size.imageSize(filePath);
				const workingMaxWidth = maxWidth > 0 ? maxWidth : dimensions.width ?? 0;
				const workingMaxHeight = maxHeight > 0 ? maxHeight : dimensions.height ?? 0;
				if (
					(dimensions && (dimensions.width ?? 0) > workingMaxWidth) ||
					(dimensions.height ?? 0) > workingMaxHeight
				) {
					this.updateStatus(
						Status.AttemptingResize,
						`Attempting to resize large image: ${dimensions.width}x${dimensions.height}.`
					);

					const image = await this.timeoutAfterDelay(() => Jimp.read(filePath), undefined);
					if (image) {
						const auto = Jimp.AUTO;
						await image.resize(maxWidth || auto, maxHeight || auto).writeAsync(filePath);

						dimensions = size.imageSize(filePath);
						this.updateStatus(
							Status.AttemptingResize,
							`Successfully resized image to: ${dimensions.width}x${dimensions.height}.`
						);

						return true;
					} else {
						this.updateStatus(Status.AttemptingResize, 'Timeout occurred, unable to resize image.');
						return false;
					}
				}
			}

			return false;
		}, Promise.resolve(false));

		return result;
	}

	private async timeoutAfterDelay<T>(
		getPromise: () => Promise<T>,
		defaultValue: T,
		delay: number = 5000
	) {
		const result = await this.tryAction(async () => {
			const promises: Promise<T>[] = [
				getPromise(),
				new Promise(resolve => setTimeout(() => resolve(defaultValue), delay))
			];
			const winningPromise = await Promise.race(promises);
			return winningPromise;
		}, undefined);

		return result;
	}

	private async tryApplyImageCompression(filePath: string) {
		const result = await this.timeoutAfterDelay(async () => {
			const plugins = [];
			const fileExtension = this.getFileExtension(filePath);
			const fileType = await FileType.fromFile(filePath);
			if (fileType && fileExtension && fileType.ext !== fileExtension.substr(1)) {
				this.writeMessage(
					`The "${filePath}" file has an incorrect file extension. It is actually a mime type of ${fileType.mime}!`
				);
				return false;
			}

			switch ((fileExtension || '').toLowerCase()) {
				case '.png':
					this.writeMessage(`Using .png compression plugin for: "${filePath}"`);
					plugins.push(
						imageminPng({
							// https://www.npmjs.com/package/imagemin-optipng#optimizationlevel
							optimizationLevel: 7
						})
					);
					break;
				case '.jpg':
				case '.jpeg':
					this.writeMessage(`Using .jpg & .jpeg compression plugin for: "${filePath}"`);
					plugins.push(
						imageminJpegtran({
							// https://www.npmjs.com/package/imagemin-jpegtran#api
							arithmetic: false
						})
					);
					break;
				case '.gif':
					this.writeMessage(`Using .gif compression plugin for: "${filePath}"`);
					plugins.push(
						imageminGif({
							// https://www.npmjs.com/package/imagemin-gifsicle#optimizationlevel
							optimizationLevel: 3
						})
					);
					break;
				case '.svg':
					this.writeMessage(`Using .svg compression plugin for: "${filePath}"`);
					plugins.push(imageminSvg()); // https://github.com/svg/svgo#what-it-can-do);
					break;
				case '.webp':
					this.writeMessage(`Using .webp compression plugin for: "${filePath}"`);
					plugins.push(
						imageminWebp({
							// https://www.npmjs.com/package/imagemin-webp#api
							lossless: true,
							metadata: 'all'
						})
					);
					break;
			}

			if (!plugins || !plugins.length) {
				this.writeMessage(`Unable to resolve plugin for: "${filePath}"`);
				return false;
			}

			const options: imagemin.Options = {
				destination: 'temp/images',
				glob: false,
				plugins
			};

			let wasCompressed = false;
			const results = await imagemin([filePath], options);
			if (!!results && results.length) {
				const result = results[0];
				if (!!result) {
					const tempPath = path.resolve(result.destinationPath);
					fs.copyFileSync(tempPath, result.sourcePath);
					fs.unlinkSync(tempPath);

					wasCompressed = true;
					this.updateStatus(Status.Done, `Successfully compressed ${this.toFileUri(filePath)}.`);
				}
			} else {
				this.updateStatus(Status.Done, `Unable to compress "${this.toFileUri(filePath)}".`);
			}

			return wasCompressed;
		}, false);

		return result;
	}

	private updateStatus(status: Status, message: string) {
		this.tryAction(() => {
			if (this.isBatching) {
				if (status > this.currentStatus) {
					this.currentStatus = status;
					const statusMsg = this.statusToMessage(status);
					this.writeMessage(statusMsg);
				}
			} else {
				this.writeMessage(message);
			}
		}, undefined);
	}

	private writeMessage(message: string) {
		this.tryAction(() => {
			this.output.appendLine(message);
			this.progress.report({ message });
		}, undefined);
	}

	private statusToMessage(status: Status): string {
		switch (status) {
			case Status.Initializing:
				return 'Initializing image compression';
			case Status.AttemptingResize:
				return 'Attempting image resize';
			case Status.AttemptingCompression:
				return 'Attempting image compression';
			case Status.Done:
				return 'Image compression complete';
			default:
				return 'Idle...';
		}
	}

	private toFileUri(filePath: string): string {
		return this.tryAction(() => {
			let pathName = path.resolve(filePath).replace(/\\/g, '/');

			// Windows drive letter must be prefixed with a slash
			if (pathName[0] !== '/') {
				pathName = `/${pathName}`;
			}

			return encodeURI(`file://${pathName}`);
		}, filePath);
	}

	private tryAction<T>(action: () => T, defaultValue: T): T {
		try {
			return action();
		} catch (error) {
			if (error instanceof Error) {
				this.output.appendLine(error.message);
			} else {
				// eslint-disable-next-line no-console
				console.error(error);
			}
		}

		return defaultValue;
	}
}
