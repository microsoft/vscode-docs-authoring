export function encodeSpecialXrefCharacters(content: string) {
	content = content.replace(/\*/g, '%2A');
	content = content.replace(/#/g, '%23');
	content = content.replace(/`/g, '%60');
	return content;
}
