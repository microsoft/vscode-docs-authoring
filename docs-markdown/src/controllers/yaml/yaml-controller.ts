'use strict';

import { createParentNode } from './createParentNode';
import { checkForPreviousEntry } from './checkForPreviousEntry';

let commandOption: string;

export async function insertTocEntry() {
	commandOption = 'tocEntry';
	await checkForPreviousEntry(false);
}

export async function insertTocEntryWithOptions() {
	commandOption = 'tocEntryWithOptions';
	await checkForPreviousEntry(true);
}

export async function insertExpandableParentNode() {
	commandOption = 'expandableParentNode';
	await createParentNode();
}

export function yamlCommands() {
	const commands = [
		{ command: insertTocEntry.name, callback: insertTocEntry },
		{
			command: insertTocEntryWithOptions.name,
			callback: insertTocEntryWithOptions
		},
		{
			command: insertExpandableParentNode.name,
			callback: insertExpandableParentNode
		}
	];
	return commands;
}
