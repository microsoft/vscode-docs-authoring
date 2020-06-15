'use strict';

import { ConfigurationTarget, workspace } from 'vscode';
import { showStatusMessage, output, generateTimestamp } from '../helper/common';

// store users markdownlint settings on activation
const markdownlintProperty = 'markdownlint.config';

export function removeBlankLineInsideBlockQuote() {
	const markdownlintData: any = workspace.getConfiguration().inspect(markdownlintProperty);
	// preserve existing markdownlint.config settings if they exist
	if (markdownlintData.globalValue) {
		const existingUserSettings = markdownlintData.globalValue;
		Object.assign(existingUserSettings, { MD028: false });
		workspace
			.getConfiguration()
			.update(markdownlintProperty, existingUserSettings, ConfigurationTarget.Global);
		showStatusMessage(`disabled MD028 rule in Markdownlint config setting.`);
	}
	// add md028 property and front_matter_title property directly (no existing settings)
	if (!markdownlintData.globalValue) {
		const blankLineInsideBlockQuoterParameter = { MD028: false };
		workspace
			.getConfiguration()
			.update(
				markdownlintProperty,
				blankLineInsideBlockQuoterParameter,
				ConfigurationTarget.Global
			);
		showStatusMessage(`disabled MD028 rule in Markdownlint config setting.`);
	}
}

export function addFrontMatterTitle() {
	const markdownlintData: any = workspace.getConfiguration().inspect(markdownlintProperty);
	const addFrontMatterTitleSetting = workspace.getConfiguration('markdown').addFrontMatterTitle;
	// preserve existing markdownlint.config settings if they exist
	if (markdownlintData.globalValue && addFrontMatterTitleSetting) {
		const existingUserSettings = markdownlintData.globalValue;
		Object.assign(existingUserSettings, { MD025: { front_matter_title: '' } });
		workspace
			.getConfiguration()
			.update(markdownlintProperty, existingUserSettings, ConfigurationTarget.Global);
		showStatusMessage(`Added front_matter_title property to Markdownlint config setting.`);
	}
	// add md025 property and front_matter_title property directly (no existing settings)
	if (!markdownlintData.globalValue && addFrontMatterTitleSetting) {
		const frontMatterParameter = { MD025: { front_matter_title: '' } };
		workspace
			.getConfiguration()
			.update(markdownlintProperty, frontMatterParameter, ConfigurationTarget.Global);
		showStatusMessage(`Added front_matter_title property to Markdownlint config setting.`);
	}
	// let user know that markdownlint.config file will not be updated
	if (!addFrontMatterTitleSetting) {
		showStatusMessage(
			`The addFrontMatterTitleSetting value is set to false.  MD025 rule will not be updated.`
		);
	}
}

/**
 * Method to check for the docs custom markdownlint value.
 * Checks for markdownlint.customRules property.  If markdownlint isn't installed, do nothing.  If markdownlint is installed, check for custom property values.
 */
export function checkMarkdownlintCustomProperty() {
	const { msTimeValue } = generateTimestamp();
	const customProperty = 'markdownlint.customRules';
	const customRuleset = '{docsmsft.docs-linting}/markdownlint-custom-rules/rules.js';
	const docsMarkdownRuleset = '{docsmsft.docs-markdown}/markdownlint-custom-rules/rules.js';
	const customPropertyData: any = workspace.getConfiguration().inspect(customProperty);
	// new list for string comparison and updating.
	const existingUserSettings: string[] = [];
	if (customPropertyData) {
		// if the markdownlint.customRules property exists, pull the global values (user settings) into a string.
		if (customPropertyData.globalValue) {
			const valuesToString = customPropertyData.globalValue.toString();
			let individualValues = valuesToString.split(',');
			individualValues.forEach((setting: string) => {
				if (setting === customRuleset) {
					existingUserSettings.push(setting);
				}
			});

			// if the customRuleset already exist, write a notification to the output window and continue.
			if (existingUserSettings.indexOf(customRuleset) > -1) {
				output.appendLine(
					`[${msTimeValue}] - Docs custom markdownlint ruleset is already set at a global level.`
				);
			} else {
				// if the customRuleset does not exists, append it to the other values in the list if there are any or add it as the only value.
				existingUserSettings.push(customRuleset);
				// update the user settings with new/updated values and notify user.
				// if a user has specific workspace settings for customRules, vscode will use those. this is done so we don't override non-docs repos.
				workspace
					.getConfiguration()
					.update(customProperty, existingUserSettings, ConfigurationTarget.Global);
				output.appendLine(
					`[${msTimeValue}] - Docs custom markdownlint ruleset added to user settings.`
				);
			}

			// remove docs-markdown ruleset setting if necessary
			if (individualValues.indexOf(docsMarkdownRuleset) > -1) {
				individualValues = existingUserSettings.filter(userSetting => {
					return userSetting !== docsMarkdownRuleset;
				});
				workspace
					.getConfiguration()
					.update(customProperty, individualValues, ConfigurationTarget.Global);
				output.appendLine(
					`[${msTimeValue}] - docs-markdown custom markdownlint ruleset removed from user settings.`
				);
			}
		}
		// if no custom rules exist, create array and add docs custom ruleset.
		if (customPropertyData.globalValue === undefined) {
			const customPropertyValue = [customRuleset];
			workspace
				.getConfiguration()
				.update(customProperty, customPropertyValue, ConfigurationTarget.Global);
			output.appendLine(
				`[${msTimeValue}] - Docs custom markdownlint ruleset added to user settings.`
			);
		}
	}
}
