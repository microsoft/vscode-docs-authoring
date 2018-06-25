"use strict";

import { generateTimestamp } from "../helper/common";
import { cleanupDownloadFiles, downloadRepo } from "../helper/github";

export function applyTemplateCommand() {
    const commands = [
        { command: applyTemplate.name, callback: applyTemplate },
    ];
    return commands;
}

export async function applyTemplate() {
    // generate current date/time for timestamp, clean up template directory and download copy of the template repo.
    generateTimestamp();
    cleanupDownloadFiles(true);
    downloadRepo();
}
