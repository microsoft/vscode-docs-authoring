const regex = /:::no-loc\s+text="(.*?)":::/;

export const nolocOptions = {
	marker: ':',
	validate(params) {
		return params.trim().match(regex);
	},
	render(tokens, idx) {
		const nolocMatches = regex.exec(tokens[idx].info.trim());
		if (nolocMatches !== null) {
			return `${nolocMatches[1]}`;
		} else {
			return '';
		}
	}
};
