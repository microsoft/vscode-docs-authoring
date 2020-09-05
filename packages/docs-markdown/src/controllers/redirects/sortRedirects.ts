import { naturalLanguageCompare } from '../../helper/common';
import { initiateRedirectCommand, updateRedirects } from './utilities';

export async function sortMasterRedirectionFile() {
	const { isEnvironmentReady, redirectsAndConfigOptions } = await initiateRedirectCommand();
	if (!isEnvironmentReady || !redirectsAndConfigOptions) {
		return;
	}

	const { config, editor, redirects } = redirectsAndConfigOptions;
	redirects.redirections.sort((a, b) => {
		return naturalLanguageCompare(a.source_path, b.source_path);
	});

	await updateRedirects(editor, redirects, config);
}
