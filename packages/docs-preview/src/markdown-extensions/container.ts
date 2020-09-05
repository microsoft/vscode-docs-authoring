/* tslint:disable: one-variable-per-declaration prefer-const variable-name */

export function container_plugin(md, name, options) {
	options = options || {};
	const marker_str = options.marker;
	const marker_len = marker_str.length;
	const marker_char = marker_str.charCodeAt(0);
	const validate = options.validate;
	const render = options.render;

	function container(state, startLine, endLine, silent) {
		let pos;
		let nextLine;
		let token;
		let auto_closed = false;
		let start = state.bMarks[startLine] + state.tShift[startLine];
		let max = state.eMarks[startLine];

		// Check out the first character quickly,
		// this should filter out most of non-containers
		//
		if (marker_char !== state.src.charCodeAt(start)) {
			return false;
		}

		// Check out the rest of the marker string
		//
		for (pos = start; pos <= max; pos++) {
			if (marker_str !== state.src[pos]) {
				break;
			}
		}

		pos -= (pos - start) % marker_len;

		const markup = state.src.slice(start, pos);
		const params = state.src.slice(pos, max);
		if (!validate(params)) {
			return false;
		}

		// Since start is found, we can report success here in validation mode
		//
		if (silent) {
			return true;
		}

		// Search for the end of the block
		//
		nextLine = startLine;

		for (;;) {
			if (nextLine >= endLine) {
				// unclosed block should be autoclosed by end of document.
				// also block seems to be autoclosed by end of parent
				break;
			}

			if (auto_closed) {
				break;
			}

			start = pos + 2;
			max = state.eMarks[nextLine];

			for (let hpos = start; hpos <= max; hpos++) {
				if (marker_str !== state.src[hpos]) {
					continue;
				}

				// found!
				auto_closed = true;
				break;
			}

			if (auto_closed) {
				break;
			}

			nextLine++;
		}

		const old_parent = state.parentType;
		const old_line_max = state.lineMax;
		state.parentType = 'container';

		// this will prevent lazy continuations from ever going past our end marker
		state.lineMax = nextLine;

		token = state.push('container_' + name + '_open', 'div', 1);
		token.markup = markup;
		token.block = true;
		token.info = params;
		token.map = [startLine, nextLine];

		state.md.block.tokenize(state, startLine + 1, nextLine);

		token = state.push('container_' + name + '_close', 'div', -1);
		token.markup = state.src.slice(start, pos);
		token.block = true;

		state.parentType = old_parent;
		state.lineMax = old_line_max;
		state.line = nextLine + (auto_closed ? 1 : 0);

		return true;
	}

	md.block.ruler.before('code', 'container_' + name, container, {
		alt: []
	});
	md.renderer.rules['container_' + name + '_open'] = render;
	md.renderer.rules['container_' + name + '_close'] = render;
}
