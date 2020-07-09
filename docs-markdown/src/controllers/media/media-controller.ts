/* eslint-disable @typescript-eslint/no-var-requires */

import { insertVideo, insertURL, insertLink } from './insert';
import { selectLinkType, selectLinkTypeToolbar, selectMediaType } from './select';

export function insertLinksAndMediaCommands() {
	const commands = [
		{ command: insertVideo.name, callback: insertVideo },
		{ command: insertURL.name, callback: insertURL },
		{ command: insertLink.name, callback: insertLink },
		{ command: selectLinkType.name, callback: selectLinkType },
		{ command: selectLinkTypeToolbar.name, callback: selectLinkTypeToolbar },
		{ command: selectMediaType.name, callback: selectMediaType }
	];
	return commands;
}
