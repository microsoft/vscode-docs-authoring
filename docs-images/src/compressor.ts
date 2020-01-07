import {
    OutputChannel,
    Progress
} from "vscode";
import { 
    getFileName,
    getFileSize,
    toHumanReadableString,
    calculatePercentReduction
} from "./utilities";
import { Result } from "./result";

import * as fs from "fs";
import * as path from "path";
import * as size from "image-size";
import * as jimp from "jimp";
import * as imagemin from "imagemin";
import * as imageminJpeg from "imagemin-jpegtran";
import * as imageminPng from "imagemin-optipng";
import * as imageminGif from "imagemin-gifsicle";
import * as imageminSvg from "imagemin-svgo";
import * as imageminWebp from "imagemin-webp";

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
    private readonly imageExtensions: string[] = [
        ".png",
        ".jpg",
        ".jpeg",
        ".gif",
        ".svg",
        ".webp"
    ];

    constructor(
        private readonly output: OutputChannel,
        private readonly progress: Progress<{ message?: string; increment?: number }>) {
            this.output.show();
        }


    async compressImagesInFolder(filePaths: string[], maxWidth: number = 0, maxHeight: number = 0): Promise<Result[]> {
        this.isBatching = true;
        const compressTasks =
            filePaths.map(path => this.compressImage(path, maxWidth, maxHeight));
        const results = await Promise.all(compressTasks);
        return results;
    }

    async compressImage(filePath: string, maxWidth: number = 0, maxHeight: number = 0): Promise<Result> {
        this.updateStatus(Status.Initializing, `Attempting to compress "${filePath}".`);
        
        if (this.filePathHasValidExtension(filePath)) {
            const before = getFileSize(filePath);
            const wasResized = await this.tryApplyImageDimensions(filePath, maxWidth, maxHeight);
            const wasCompressed = await this.tryApplyImageCompression(filePath);
            const after = getFileSize(filePath);
            const reduction = calculatePercentReduction(before, after);

            return {
                wasCompressed,
                wasResized,
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
            const result = this.fileExtensionExpression.exec(filePath);
            const fileExtension = result ? result[0] : null;

            return fileExtension
                && this.imageExtensions.some(ext => ext === fileExtension);
        }

        return false;
    }

    private async tryApplyImageDimensions(filePath: string, maxWidth: number = 0, maxHeight: number = 0) {
        if (!!maxWidth || !!maxHeight) {
            let dimensions = size.imageSize(filePath);
            const workingMaxWidth = maxWidth > 0 ? maxWidth : dimensions.width ?? 0;
            const workingMaxHeight = maxHeight > 0 ? maxHeight : dimensions.height ?? 0;
            if (dimensions &&
                (dimensions.width ?? 0) > workingMaxWidth ||
                (dimensions.height ?? 0) > workingMaxHeight) {
                this.updateStatus(Status.AttemptingResize, `Resizing large image ${dimensions.width}x${dimensions.height}.`);
                const image = await jimp.read(filePath);
                image.resize(
                    maxWidth || jimp.AUTO,
                    maxHeight || jimp.AUTO);

                await image.writeAsync(filePath);
                dimensions = size.imageSize(filePath);
                this.updateStatus(Status.AttemptingResize, `Resized image to ${dimensions.width}x${dimensions.height}.`);

                return true;
            }
        }
        
        return false;
    }

    private async tryApplyImageCompression(filePath: string) {
        const options: imagemin.Options = {
            destination: "temp/images",
            glob: false,
            plugins: [
                imageminJpeg(), // https://www.npmjs.com/package/imagemin-jpegtran#api
                imageminPng({   // https://www.npmjs.com/package/imagemin-optipng#optimizationlevel
                    optimizationLevel: 5
                }),
                imageminGif({   // https://www.npmjs.com/package/imagemin-gifsicle#optimizationlevel
                    optimizationLevel: 2
                }),
                imageminSvg(),  // https://github.com/svg/svgo#what-it-can-do
                imageminWebp()  // https://www.npmjs.com/package/imagemin-webp#api
            ]
        };

        let wasCompressed = false;
        const results = await imagemin([ filePath ], options);
        if (!!results && results.length) {
            const result = results[0];
            if (!!result) {
                const tempPath = path.resolve(result.destinationPath);
                fs.copyFileSync(tempPath, result.sourcePath);
                fs.unlinkSync(tempPath);

                wasCompressed = true;
                this.updateStatus(Status.Done, `Successfully compressed "${filePath}".`);
            }
        }

        return wasCompressed;
    }

    private updateStatus(status: Status, message: string) {
        if (this.isBatching) {
            if (status > this.currentStatus) {
                this.currentStatus = status;
                const statusMsg = this.statusToMessage(status);
                this.output.appendLine(statusMsg);
                this.progress.report({ message: statusMsg });
            }
        } else {
            this.output.appendLine(message);
            this.progress.report({ message });
        }
    }

    private statusToMessage(status: Status): string {
        switch (status) {
            case Status.Initializing: return "Initializing image compression";
            case Status.AttemptingResize: return "Attempting image resize";
            case Status.AttemptingCompression: return "Attempting image compression";
            case Status.Done: return "Image compression complete";
            default: return "Idle...";
        }
    }
}