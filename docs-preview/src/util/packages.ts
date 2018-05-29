/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as path from "path";
import * as tmp from "tmp";
import * as util from "./common";
import { Logger } from "./logger";
import { PlatformInformation } from "./platformInforamtion";

export interface IPackage {
    description: string;
    url: string;
    fallbackUrl?: string;
    installPath?: string;
    platforms: string[];
    architectures: string[];
    binaries: string[];
    tmpFile: tmp.SynchrounousResult;

    // Path to use to test if the package has already been installed
    installTestPath?: string;
}

export interface IStatus {
    setMessage: (text: string) => void;
    setDetail: (text: string) => void;
}

export class PackageError extends Error {
    // Do not put PII (personally identifiable information) in the "message" field as it will be logged to telemetry
    constructor(public message: string,
                public pkg: IPackage = null,
                public innerError: any = null) {
        super(message);
    }
}
