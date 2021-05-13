/* eslint-disable import/no-unresolved */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/prefer-for-of */
/* eslint-disable prefer-const */
'use strict';

import { readFileSync, realpathSync } from 'fs';
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
import { OutputChannel } from 'vscode';

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
		let path = realpathSync('.');
		const json = readFileSync('./audit-rules.json', 'utf-8');
		const rules = JSON.parse(json) as AuditRule[];
		AuditRule.LoadRules(rules);
	} catch (error) {
		vscode.window.activeTerminal.sendText(error.toString());
	}

	if (!editor) {
		noActiveEditorMessage();
		return;
	} else {
		try {
			const output: OutputChannel = vscode.window.createOutputChannel('Docs: audit rules');
			output.show();
			const entireFile = editor.document.getText();
			// eslint-disa ble-next-line prefer-const
			let fileName = vscode.window.activeTextEditor.document.fileName;
			let blocks = ContentBlock.splitContentIntoBlocks(fileName, entireFile, false);
			let allBlocks = [];
			for (let block of blocks) {
				allBlocks.push(block);
				block.AllInnerBlocks().forEach(function (value: ContentBlock) {
					allBlocks.push(value);
				});
			}

			let metadataString = ContentMatch.getMetadata(entireFile, fileName);
			let metadata = ContentMatch.readMetadata(metadataString);
			if (metadata.keys.length === 0) {
				metadata = ContentMatch.extractMetadata(entireFile);
			}
			let topic = metadata.has('ms_topic') ? metadata.get('ms_topic') : '';
			if (topic === '') {
				output.appendLine('No MS.Topic detected for MVC guidance');
			} else {
				let theseRules = AuditRule.Rules.filter(e => e.ruleSet === 'MVC');
				theseRules = theseRules.filter(e => e.ruleGroup.toLowerCase() === topic.toLowerCase());
				theseRules = theseRules.filter(e => e.dependsOn === undefined || e.dependsOn == null);
				if (theseRules.length === 0) {
					vscode.window.activeTerminal.sendText('No MVC Guidance for ' + topic);
				} else {
					let theseAudits = [];
					for (let i = 0; i < theseRules.length; i++) {
						let audits = theseRules[i].test(blocks, fileName, metadata, entireFile, blocks);
						audits.forEach(function (value: AuditEntry) {
							output.appendLine(value.title + ':' + value.success);
							theseAudits.push(value);
						});
					}
				}
			}
		} catch (error) {
			console.log(error);
		}
	}
}
