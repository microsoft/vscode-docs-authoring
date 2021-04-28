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

const telemetryCommand: string = 'doc-index-verify';
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
	AuditRule.LoadRules(<AuditRule[]>JSON.parse(readFileSync('./audit-rules.json', 'utf-8')));

	if (!editor) {
		noActiveEditorMessage();
		return;
	} else {
		if (!isMarkdownFileCheck(editor, false)) {
			return;
		}

		const entireFile = editor.document.getText();
		let fileName = vscode.window.activeTextEditor.document.fileName;
		let blocks = ContentBlock.splitContentIntoBlocks(fileName, entireFile, false);
		let metadataString = ContentMatch.getMetadata(fileName, entireFile);
		let metadata = ContentMatch.readMetadata(metadataString);
		if (metadata.keys.length == 0) {
			metadata = ContentMatch.extractMetadata(entireFile);
		}
		let topic = metadata.has('ms.topic') ? metadata['ms.topic'] : '';
		if (topic == '') {
			vscode.window.activeTerminal.sendText('No MS.Topic detected for MVC guidance');
		} else {
			let rules = AuditRule.Rules.filter(
				e =>
					e.ruleGroup == 'MVC' &&
					e.ruleSet.toLowerCase() == topic.toLowerCase() &&
					e.dependsOn == undefined
			);
			if (rules.length == 0) {
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
	}
}
