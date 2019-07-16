"use strict";

import { ConfigurationTarget, workspace } from "vscode";
import { showStatusMessage } from "../helper/common";

// store users markdownlint settings on activation
const markdownlintProperty = "markdownlint.config";

export function addFrontMatterTitle() {
    const markdownlintData: any = workspace.getConfiguration().inspect(markdownlintProperty);
    if (markdownlintData.globalValue) {
        const existingUserSettings = markdownlintData.globalValue;
        Object.assign(existingUserSettings, { MD025: { "front_matter_title": "" } });
        workspace.getConfiguration().update(markdownlintProperty, existingUserSettings, ConfigurationTarget.Global);
        showStatusMessage(`Added front_matter_title property to Markdownlint config setting.`);
    }
}
