"use strict";

import { ConfigurationTarget, workspace } from "vscode";
import { showStatusMessage } from "../helper/common";

// store users markdownlint settings on activation
const markdownlintProperty = "markdownlint.config";

export function addFrontMatterTitle() {
    const markdownlintData: any = workspace.getConfiguration().inspect(markdownlintProperty);
    const addFrontMatterTitleSetting = workspace.getConfiguration("markdown").addFrontMatterTitle;
    // preserve existing markdownlint.config settings if they exist
    if (markdownlintData.globalValue && addFrontMatterTitleSetting) {
        const existingUserSettings = markdownlintData.globalValue;
        Object.assign(existingUserSettings, { MD025: { front_matter_title: "" } });
        workspace.getConfiguration().update(markdownlintProperty, existingUserSettings, ConfigurationTarget.Global);
        showStatusMessage(`Added front_matter_title property to Markdownlint config setting.`);
    }
    // add md025 property and front_matter_title property directly (no existing settings)
    if (!markdownlintData.globalValue && addFrontMatterTitleSetting) {
        const frontMatterParameter = { MD025: { front_matter_title: "" } };
        workspace.getConfiguration().update(markdownlintProperty, frontMatterParameter, ConfigurationTarget.Global);
        showStatusMessage(`Added front_matter_title property to Markdownlint config setting.`);
    }
    // let user know that markdownlint.config file will not be updated
    if (!addFrontMatterTitleSetting) {
        showStatusMessage(`The addFrontMatterTitleSetting value is set to false.  MD025 rule will not be updated.`);
    }
}
