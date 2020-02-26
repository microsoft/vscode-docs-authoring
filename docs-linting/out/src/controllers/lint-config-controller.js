"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const common_1 = require("../helper/common");
// store users markdownlint settings on activation
const markdownlintProperty = "markdownlint.config";
function addFrontMatterTitle() {
    const markdownlintData = vscode_1.workspace.getConfiguration().inspect(markdownlintProperty);
    const addFrontMatterTitleSetting = vscode_1.workspace.getConfiguration("markdown").addFrontMatterTitle;
    // preserve existing markdownlint.config settings if they exist
    if (markdownlintData.globalValue && addFrontMatterTitleSetting) {
        const existingUserSettings = markdownlintData.globalValue;
        Object.assign(existingUserSettings, { MD025: { "front_matter_title": "" } });
        vscode_1.workspace.getConfiguration().update(markdownlintProperty, existingUserSettings, vscode_1.ConfigurationTarget.Global);
        common_1.showStatusMessage(`Added front_matter_title property to Markdownlint config setting.`);
    }
    // add md025 property and front_matter_title property directly (no existing settings)
    if (!markdownlintData.globalValue && addFrontMatterTitleSetting) {
        const frontMatterParameter = { MD025: { "front_matter_title": "" } };
        vscode_1.workspace.getConfiguration().update(markdownlintProperty, frontMatterParameter, vscode_1.ConfigurationTarget.Global);
        common_1.showStatusMessage(`Added front_matter_title property to Markdownlint config setting.`);
    }
    // let user know that markdownlint.config file will not be updated
    if (!addFrontMatterTitleSetting) {
        common_1.showStatusMessage(`The addFrontMatterTitleSetting value is set to false.  MD025 rule will not be updated.`);
    }
}
exports.addFrontMatterTitle = addFrontMatterTitle;
//# sourceMappingURL=lint-config-controller.js.map