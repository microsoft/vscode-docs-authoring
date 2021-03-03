'use strict';

import { readFileSync } from 'fs';
import { Position, TextDocument, Uri, window, workspace } from 'vscode';
import { generateTimestamp, showStatusMessage } from '../helper/common';
import { alias, gitHubID, missingValue } from '../helper/user-settings';

export function applyDocsTemplate(templatePath: string) {
	const newFile = Uri.parse('untitled:' + 'New-Topic.md');
	workspace.openTextDocument(newFile).then((textDocument: TextDocument) => {
		window.showTextDocument(textDocument, 1, false).then(
			textEditor => {
				const content = readFileSync(templatePath, 'utf8');
				textEditor.edit(edit => {
					try {
						let updatedContent;
						const { msDateValue } = generateTimestamp();
						// replace metadata placeholder values with user settings and dynamic values then write template content to new file.
						if (!gitHubID && !alias) {
							updatedContent = content
								.replace('{@date}', msDateValue)
								.replace('{github-id}', missingValue)
								.replace('{ms-alias}', missingValue);
							edit.insert(new Position(0, 0), updatedContent);
						} else if (!gitHubID) {
							updatedContent = content
								.replace('{@date}', msDateValue)
								.replace('{github-id}', missingValue)
								.replace('{ms-alias}', alias);
							edit.insert(new Position(0, 0), updatedContent);
						} else if (!alias) {
							updatedContent = content
								.replace('{@date}', msDateValue)
								.replace('{github-id}', gitHubID)
								.replace('{ms-alias}', missingValue);
							edit.insert(new Position(0, 0), updatedContent);
						} else {
							updatedContent = content
								.replace('{@date}', msDateValue)
								.replace('{github-id}', gitHubID)
								.replace('{ms-alias}', alias);
							edit.insert(new Position(0, 0), updatedContent);
						}
					} catch (error) {
						showStatusMessage(error);
					}
				});
			},
			(error: any) => {
				showStatusMessage(error);
			}
		);
	});
}
