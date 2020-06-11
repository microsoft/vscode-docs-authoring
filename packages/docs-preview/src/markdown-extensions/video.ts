const regex = /video\s+source="(.*?)":::/gim;
export const videoOptions = {
	marker: ':',
	validate(params) {
		return params.trim().match(regex);
	},
	render(tokens, idx) {
		const videoMatches = regex.exec(tokens[idx].info.trim());
		if (videoMatches !== null) {
			return `<video width="640" height="320" controls><source src="${videoMatches[1]}"></video>`;
		} else {
			return '';
		}
	}
};

const legacyVideoRegex = /^\[\!VIDEO\s+(.*?)\]$/gim;
export const legacyVideoOptions = {
	marker: '>',
	validate(params) {
		return params.trim().match(legacyVideoRegex);
	},
	render(tokens, idx) {
		const videoMatches = legacyVideoRegex.exec(tokens[idx].info.trim());
		if (videoMatches !== null) {
			return `<video width="640" height="320" controls><source src="${videoMatches[1]}"></video>`;
		} else {
			return '';
		}
	}
};
