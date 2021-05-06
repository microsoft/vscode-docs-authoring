/* eslint-disable import/no-unresolved */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable prefer-const */
'use strict';

import { readFileSync } from 'fs';
import {
	insertContentToEditor,
	isMarkdownFileCheck,
	noActiveEditorMessage
} from '../../helper/common';
import { format } from '../../helper/format';
import { sendTelemetryData } from '../../helper/telemetry';
import { AuditEntry } from './audit-entry';
import { AuditRule } from './audit-rule';
import * as vscode from 'vscode';
import { ContentMatch } from './content-match';
import { ContentBlock } from './content-block';

let commandOption: string;

export function insertDocIndexCommand() {
	return [
		{
			command: verify.name,
			callback: verify
		}
	];
}

/**
 * Run doc-index verification
 */
export function verify() {
	const editor = vscode.window.activeTextEditor;

	try {
		// const json = readFileSync('./audit-rules.json', 'utf-8');
		// const rules = JSON.parse(json) as AuditRule[];
		AuditRule.LoadRules();
	} catch (error) {
		vscode.window.activeTerminal.sendText(error.toString());
	}

	if (!editor) {
		noActiveEditorMessage();
		return;
	} else {
		try {
			const entireFile = editor.document.getText();
			// eslint-disa ble-next-line prefer-const
			let fileName = vscode.window.activeTextEditor.document.fileName;
			let blocks = ContentBlock.splitContentIntoBlocks(fileName, entireFile, false);
			let metadataString = ContentMatch.getMetadata(fileName, entireFile);
			let metadata = ContentMatch.readMetadata(metadataString);
			if (metadata.keys.length === 0) {
				metadata = ContentMatch.extractMetadata(entireFile);
			}
			let topic = metadata.has('ms.topic') ? metadata['ms.topic'] : '';
			if (topic === '') {
				vscode.window.activeTerminal.sendText('No MS.Topic detected for MVC guidance');
			} else {
				let rules = AuditRule.Rules.filter(
					e =>
						e.ruleGroup === 'MVC' &&
						e.ruleSet.toLowerCase() === topic.toLowerCase() &&
						e.dependsOn === undefined
				);
				if (rules.length === 0) {
					vscode.window.activeTerminal.sendText('No MVC Guidance for ' + topic);
				} else {
					for (let i = 0; i < rules.length; i++) {
						let theseAudits = rules[i].test(blocks, fileName, metadata, entireFile, blocks);
						for (let j = 0; j < theseAudits.length; j++) {
							vscode.window.activeTerminal.sendText(theseAudits[j].title);
						}
					}
				}
			}
		} catch (error) {
			console.log(error);
		}
	}
}
