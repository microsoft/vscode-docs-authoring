"use strict";

import { ConfigurationTarget, workspace } from "vscode";

// store users markdownlint settings on activation
let currentMarkdownlintSettings: string[] = [];

export function disableHeaderRule() {
    // the markdownlint property we need to update
    const markdownlintProperty = "markdownlint.config";
    // heading value we need to disable, should append this to the current settings if they exists
    // may want to use another array for reset
    const headingFalse = { MD025: false };
    // all info from the property
    const markdownlintData: any = workspace.getConfiguration().inspect(markdownlintProperty);
    if (markdownlintData) {
        // check for headingFalse
        // if exist and false, do nothing and return
        // if exist and true, update true to false
        // if does not exist, add headingFalue
    } else {
        // just add heading false
    }
    // method to update the property
    workspace.getConfiguration().update(markdownlintProperty, headingFalse, ConfigurationTarget.Global);
}

export function resetHeaderRule() {
    const markdownlintProperty = "markdownlint.config";
    // rest markdownlint config to original state
    workspace.getConfiguration().update(markdownlintProperty, currentMarkdownlintSettings, ConfigurationTarget.Global);
}