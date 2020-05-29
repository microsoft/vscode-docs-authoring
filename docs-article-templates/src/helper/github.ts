'use-strict';

import Axios from 'axios';
import { showStatusMessage, templateDirectory } from '../helper/common';

export async function logRepoData() {
	const repoUrl = `https://github.com/MicrosoftDocs/content-templates`;
	const result = await Axios.get(repoUrl);
	showStatusMessage(`Content-templates repo URL and http response: ${repoUrl}, ${result.status}`);
	showStatusMessage(`Local template directory: ${templateDirectory}`);
}
