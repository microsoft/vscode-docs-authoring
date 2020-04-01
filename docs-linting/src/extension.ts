"use strict";

/* The module 'vscode' contains the VS Code extensibility API
 The LoadToolbar function will populate items in the toolbar, but only when the extension loads the first time.
 The common file provides functions that are useful across all commands.
 Logging, Error Handling, VS Code window updates, etc.
*/

import { ConfigurationTarget, ExtensionContext, window, workspace } from "vscode";
import { addFrontMatterTitle } from "./controllers/lint-config-controller";
import { generateTimestamp } from "./helper/common";

export const output = window.createOutputChannel("docs-linting");
export let extensionPath: string;

/**
 * Provides the commands to the extension. This method is called when extension is activated.
 * Extension is activated the very first time the command is executed.
 * preview commands -
 * formatting commands -
 *
 * param {vscode.ExtensionContext} the context the extension runs in, provided by vscode on activation of the extension.
 */
export function activate(context: ExtensionContext) {
    extensionPath = context.extensionPath;
    const { msTimeValue } = generateTimestamp();
    output.appendLine(`[${msTimeValue}] - Activating docs linting extension.`);

    // Markdownlint custom rule check
    checkMarkdownlintCustomProperty();

    // Update markdownlint.config to fix MD025 issue
    addFrontMatterTitle();
}

/**
 * Method to check for the docs custom markdownlint value.
 * Checks for markdownlint.customRules property.  If markdownlint isn't installed, do nothing.  If markdownlint is installed, check for custom property values.
 */
export function checkMarkdownlintCustomProperty() {
    const { msTimeValue } = generateTimestamp();
    const customProperty = "markdownlint.customRules";
    const customRuleset = "{docsmsft.docs-linting}/markdownlint-custom-rules/rules.js";
    const docsMarkdownRuleset = "{docsmsft.docs-markdown}/markdownlint-custom-rules/rules.js";
    const customPropertyData: any = workspace.getConfiguration().inspect(customProperty);
    // new list for string comparison and updating.
    const existingUserSettings: string[] = [];
    if (customPropertyData) {
        // if the markdownlint.customRules property exists, pull the global values (user settings) into a string.
        if (customPropertyData.globalValue) {
            const valuesToString = customPropertyData.globalValue.toString();
            let individualValues = valuesToString.split(",");
            individualValues.forEach((setting: string) => {
                if (setting === customRuleset) {
                    existingUserSettings.push(setting);
                }
            });

            // if the customRuleset already exist, write a notification to the output window and continue.
            if (existingUserSettings.indexOf(customRuleset) > -1) {
                output.appendLine(`[${msTimeValue}] - Docs custom markdownlint ruleset is already set at a global level.`);
            } else {
                // if the customRuleset does not exists, append it to the other values in the list if there are any or add it as the only value.
                existingUserSettings.push(customRuleset);
                // update the user settings with new/updated values and notify user.
                // if a user has specific workspace settings for customRules, vscode will use those. this is done so we don't override non-docs repos.
                workspace.getConfiguration().update(customProperty, existingUserSettings, ConfigurationTarget.Global);
                output.appendLine(`[${msTimeValue}] - Docs custom markdownlint ruleset added to user settings.`);
            }

            // remove docs-markdown ruleset setting if necessary
            if (individualValues.indexOf(docsMarkdownRuleset) > -1) {
                individualValues = existingUserSettings.filter((userSetting) => {
                    return userSetting !== docsMarkdownRuleset;
                });
                workspace.getConfiguration().update(customProperty, individualValues, ConfigurationTarget.Global);
                output.appendLine(`[${msTimeValue}] - docs-markdown custom markdownlint ruleset removed from user settings.`);
            }

        }
        // if no custom rules exist, create array and add docs custom ruleset.
        if (customPropertyData.globalValue === undefined) {
            const customPropertyValue = [customRuleset];
            workspace.getConfiguration().update(customProperty, customPropertyValue, ConfigurationTarget.Global);
            output.appendLine(`[${msTimeValue}] - Docs custom markdownlint ruleset added to user settings.`);
        }
    }
}

// this method is called when your extension is deactivated
export function deactivate() {
    output.appendLine("Deactivating docs-linting extension.");
}
