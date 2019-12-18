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

export class ImageCompressor {
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

    async compressImage(filePath: string, maxWidth: number = 0, maxHeight: number = 0): Promise<Result> {
        this.updateStatus(`Attempting to compress "${filePath}".`);
        
        if (this.filePathHasValidExtension(filePath)) {
            const before = getFileSize(filePath);
            const wasResized = await this.applyImageDimensions(filePath, maxWidth, maxHeight);
            const wasCompressed = await this.applyImageCompression(filePath);
            const after = getFileSize(filePath);
            const reduction = calculatePercentReduction(before, after);

            return {
                wasCompressed,
                wasResized,
                file: getFileName(filePath),
                before: toHumanReadableString(before),
                after: toHumanReadableString(after),
                reduction
            };
        } else {
            this.updateStatus(`Invalid image for compression "${filePath}".`);
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

    private async applyImageDimensions(filePath: string, maxWidth: number = 0, maxHeight: number = 0) {
        if (!!maxWidth || !!maxHeight) {
            let dimensions = size.imageSize(filePath);
            if (dimensions && (dimensions.width ?? 0) > maxWidth || (dimensions.height ?? 0) > maxHeight) {
                this.updateStatus(`Resizing large image ${dimensions.width}x${dimensions.height}.`);
                const image = await jimp.read(filePath);
                image.resize(
                    maxWidth || jimp.AUTO,
                    maxHeight || jimp.AUTO);

                await image.writeAsync(filePath);
                dimensions = size.imageSize(filePath);
                this.updateStatus(`Resized image to ${dimensions.width}x${dimensions.height}.`);

                return true;
            }
        }
        
        return false;
    }

    private async applyImageCompression(filePath: string) {
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
                this.updateStatus(`Successfully compressed "${filePath}".`);
            }
        }

        return wasCompressed;
    }

    private updateStatus(message: string) {
        this.output.appendLine(message);
        this.progress.report({ message });
    }
}