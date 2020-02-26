"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* The module 'vscode' contains the VS Code extensibility API
 The LoadToolbar function will populate items in the toolbar, but only when the extension loads the first time.
 The common file provides functions that are useful across all commands.
 Logging, Error Handling, VS Code window updates, etc.
*/
const vscode_1 = require("vscode");
const lint_config_controller_1 = require("./controllers/lint-config-controller");
const common_1 = require("./helper/common");
exports.output = vscode_1.window.createOutputChannel("docs-linting");
/**
 * Provides the commands to the extension. This method is called when extension is activated.
 * Extension is activated the very first time the command is executed.
 * preview commands -
 * formatting commands -
 *
 * param {vscode.ExtensionContext} the context the extension runs in, provided by vscode on activation of the extension.
 */
function activate(context) {
    exports.extensionPath = context.extensionPath;
    const { msTimeValue } = common_1.generateTimestamp();
    exports.output.appendLine(`[${msTimeValue}] - Activating docs linting extension.`);
    // Markdownlint custom rule check
    checkMarkdownlintCustomProperty();
    // Update markdownlint.config to fix MD025 issue
    lint_config_controller_1.addFrontMatterTitle();
}
exports.activate = activate;
/**
 * Method to check for the docs custom markdownlint value.
 * Checks for markdownlint.customRules property.  If markdownlint isn't installed, do nothing.  If markdownlint is installed, check for custom property values.
 */
function checkMarkdownlintCustomProperty() {
    const { msTimeValue } = common_1.generateTimestamp();
    const customProperty = "markdownlint.customRules";
    const customRuleset = "{docsmsft.docs-linting}/markdownlint-custom-rules/rules.js";
    const customPropertyData = vscode_1.workspace.getConfiguration().inspect(customProperty);
    // new list for string comparison and updating.
    const existingUserSettings = [];
    if (customPropertyData) {
        // if the markdownlint.customRules property exists, pull the global values (user settings) into a string.
        if (customPropertyData.globalValue) {
            const valuesToString = customPropertyData.globalValue.toString();
            const individualValues = valuesToString.split(",");
            individualValues.forEach((setting) => {
                existingUserSettings.push(setting);
            });
            // if the customRuleset already exist, write a notification to the output window and continue.
            if (existingUserSettings.indexOf(customRuleset) > -1) {
                exports.output.appendLine(`[${msTimeValue}] - Docs custom markdownlint ruleset is already set at a global level.`);
            }
            else {
                // if the customRuleset does not exists, append it to the other values in the list if there are any or add it as the only value.
                existingUserSettings.push(customRuleset);
                // update the user settings with new/updated values and notify user.
                // if a user has specific workspace settings for customRules, vscode will use those. this is done so we don't override non-docs repos.
                vscode_1.workspace.getConfiguration().update(customProperty, existingUserSettings, vscode_1.ConfigurationTarget.Global);
                exports.output.appendLine(`[${msTimeValue}] - Docs custom markdownlint ruleset added to user settings.`);
            }
        }
        // if no custom rules exist, create array and add docs custom ruleset.
        if (customPropertyData.globalValue === undefined) {
            const customPropertyValue = [customRuleset];
            vscode_1.workspace.getConfiguration().update(customProperty, customPropertyValue, vscode_1.ConfigurationTarget.Global);
            exports.output.appendLine(`[${msTimeValue}] - Docs custom markdownlint ruleset added to user settings.`);
        }
    }
}
exports.checkMarkdownlintCustomProperty = checkMarkdownlintCustomProperty;
// this method is called when your extension is deactivated
function deactivate() {
    exports.output.appendLine("Deactivating docs-linting extension.");
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map