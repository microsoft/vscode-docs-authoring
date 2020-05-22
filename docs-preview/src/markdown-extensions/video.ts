const regex = /^\[\!VIDEO\s+(.+)\]$/gim;
export const videoOptions = {
	marker: '>',
	validate(params) {
		return params.trim().match(regex);
	},
	render(tokens, idx) {
		const VIDEO_RE = /^\[\!VIDEO\s+(.+)\]$/gim;
		const videoMatches = VIDEO_RE.exec(tokens[idx].info.trim());
		if (videoMatches !== null) {
			return `<video width="640" height="320" controls><source src="${videoMatches[1]}"></video>`;
		} else {
			return '';
		}
	}
};
