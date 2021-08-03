import { readWriteFileWithProgress } from './utilities';

/**
 * Converts http:// to https:// for all microsoft links.
 */
export function microsoftLinks(
	progress: any,
	file: string,
	files: string[] | null,
	index: number | null
) {
	const message = 'Microsoft Links';
	if (file.endsWith('.md')) {
		return readWriteFileWithProgress(progress, file, message, files, index, (data: string) => {
			data = handleLinksWithRegex(data);
			return data;
		});
	} else {
		return Promise.resolve();
	}
}

/**
 * replaces input data with regex values for microsoft links.
 * Looks for data that contains microsoft links for docs, azure, msdn, and technet.
 * Replace the http with https, and remove language specific url.
 * @param data takes data string as arg
 */
export function handleLinksWithRegex(data: string) {
	const akaRegex = /http:\/\/aka.ms/g; /* lgtm[js/regex/missing-regexp-anchor] */
	data = data.replace(akaRegex, 'https://aka.ms');
	const microsoftRegex = /http:\/\/microsoft\.com/g; /* lgtm[js/regex/missing-regexp-anchor] */
	data = data.replace(microsoftRegex, 'https://microsoft.com');
	const goMicrosoftRegex =
		/http:\/\/go\.microsoft\.com/g; /* lgtm[js/regex/missing-regexp-anchor] */
	data = data.replace(goMicrosoftRegex, 'https://go.microsoft.com');
	const visualstudioRegex =
		/http:\/\/visualstudio\.com/g; /* lgtm[js/regex/missing-regexp-anchor] */
	data = data.replace(visualstudioRegex, 'https://visualstudio.com');
	const officeRegex = /http:\/\/office\.com/g; /* lgtm[js/regex/missing-regexp-anchor] */
	data = data.replace(officeRegex, 'https://office.com');
	const docsRegex = /http:\/\/docs\.microsoft\.com/g; /* lgtm[js/regex/missing-regexp-anchor] */
	data = data.replace(docsRegex, 'https://docs.microsoft.com');
	const azureRegex = /http:\/\/azure\.microsoft\.com/g; /* lgtm[js/regex/missing-regexp-anchor] */
	data = data.replace(azureRegex, 'https://azure.microsoft.com');
	const azureRegex2 = /http:\/\/azure\.com/g; /* lgtm[js/regex/missing-regexp-anchor] */
	data = data.replace(azureRegex2, 'https://azure.com');
	const msdnRegex = /http:\/\/msdn\.microsoft\.com/g; /* lgtm[js/regex/missing-regexp-anchor] */
	data = data.replace(msdnRegex, 'https://msdn.microsoft.com');
	const msdnRegex2 = /http:\/\/msdn\.com/g; /* lgtm[js/regex/missing-regexp-anchor] */
	data = data.replace(msdnRegex2, 'https://msdn.com');
	const technetRegex =
		/http:\/\/technet\.microsoft\.com/g; /* lgtm[js/regex/missing-regexp-anchor] */
	data = data.replace(technetRegex, 'https://technet.microsoft.com');
	const technetRegex2 = /http:\/\/technet\.com/g; /* lgtm[js/regex/missing-regexp-anchor] */
	data = data.replace(technetRegex2, 'https://technet.com');
	const downloadRegex =
		/http:\/\/download\.microsoft\.com/g; /* lgtm[js/regex/missing-regexp-anchor] */
	data = data.replace(downloadRegex, 'https://download.microsoft.com');
	const docsRegexLang =
		/https:\/\/docs\.microsoft\.com\/[A-Za-z]{2}-[A-Za-z]{2}\//g; /* lgtm[js/regex/missing-regexp-anchor] */
	data = data.replace(docsRegexLang, 'https://docs.microsoft.com/');
	const azureRegexLang =
		/https:\/\/azure\.microsoft\.com\/[A-Za-z]{2}-[A-Za-z]{2}\//g; /* lgtm[js/regex/missing-regexp-anchor] */
	data = data.replace(azureRegexLang, 'https://azure.microsoft.com/');
	const msdnRegexLang =
		/https:\/\/msdn\.microsoft\.com\/[A-Za-z]{2}-[A-Za-z]{2}\//g; /* lgtm[js/regex/missing-regexp-anchor] */
	data = data.replace(msdnRegexLang, 'https://msdn.microsoft.com/');
	const technetRegexLang =
		/https:\/\/technet\.microsoft\.com\/[A-Za-z]{2}-[A-Za-z]{2}\//g; /* lgtm[js/regex/missing-regexp-anchor] */
	data = data.replace(technetRegexLang, 'https://technet.microsoft.com/');
	return data;
}
