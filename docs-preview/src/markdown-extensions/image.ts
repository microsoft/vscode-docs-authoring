import { output } from '../extension';

const IMAGE_OPEN_RE = /image\s+(((source|type|alt-text|lightbox|border|loc-scope|link)="(.*?))"\s*)+:::/gm;

export const imageOptions = {
	marker: ':',
	validate(params) {
		return params.trim().match(IMAGE_OPEN_RE) || params.trim().match(/image-end:::/g);
	},
	render(tokens, idx) {
		const start = IMAGE_OPEN_RE.exec(tokens[idx].info.trim());
		const SOURCE_RE = /source\s*=\s*"(.*?)"/gi;
		const LIGHTBOX_RE = /lightbox\s*=\s*"(.*?)"/gi;
		const BORDER_RE = /border\s*=\s*"(.*?)"/gi;
		const TYPE_RE = /type\s*=\s*"(.*?)"/gi;
		const LINK_RE = /link\s*=\s*"(.*?)"/gi;
		if (start) {
			const sourceMatch = SOURCE_RE.exec(start[0]);
			if (sourceMatch && sourceMatch.length > 0) {
				const source = sourceMatch[1];
				const lightboxMatch = LIGHTBOX_RE.exec(start[0]);
				const borderMatch = BORDER_RE.exec(start[0]);
				const typeMatch = TYPE_RE.exec(start[0]);
				const linkMatch = LINK_RE.exec(start[0]);

				let html = `<div class="mx-imgBorder"><p><img src="${source}"></p></div>`;
				if (borderMatch && borderMatch.length > 0 && 'false' === borderMatch[1].toLowerCase()) {
					html = `<img src="${source}">`;
				}

				if (typeMatch && typeMatch.length > 0 && typeMatch[1].toLowerCase() === 'icon') {
					if (borderMatch && borderMatch.length > 0 && 'true' === borderMatch[1].toLowerCase()) {
						html = `<div class="mx-imgBorder"><p><img src="${source}"></p></div>`;
					} else {
						html = `<img src="${source}">`;
					}
				}

				if (lightboxMatch && lightboxMatch.length > 0) {
					html = `<a href="${lightboxMatch[1]}#lightbox" data-linktype="relative-path">${html}</a>`;
				}

				if (linkMatch) {
					html = `<a href="${linkMatch[1]}" data-linktype="relative-path">${html}</a>`;
				}

				// opening tag
				return html;
			} else {
				return tokens[idx].info.trim();
			}
		} else {
			// closing tag
			return '';
		}
	}
};

// removes image-end and long description for rendering purposes
export function image_end(md) {
	const IMAGE_ALL_GLOBAL_RE = /(:::image\s+(((source|type|alt-text|lightbox|border|loc-scope|link)="((?!content|icon).*?))"(\s*)?)+:::)([^]+?:::image-end:::)/gim;
	const IMAGE_ALL_RE = /(:::image\s+(((source|type|alt-text|lightbox|border|loc-scope|link)="((?!content|icon).*?))"(\s*)?)+:::)([^]+?:::image-end:::)/im;
	const replaceImageEnd = (src: string) => {
		const matches = src.match(IMAGE_ALL_GLOBAL_RE);
		if (matches) {
			matches.forEach(match => {
				const found = match.match(IMAGE_ALL_RE);
				const regex = new RegExp(found[7]);
				src = src.replace(regex, '');
			});
		}
		return src;
	};

	const importImageEnd = state => {
		try {
			state.src = replaceImageEnd(state.src);
		} catch (error) {
			output.appendLine(error);
		}
	};
	md.core.ruler.before('normalize', 'imageclose', importImageEnd);
}

/* tslint:disable: one-variable-per-declaration prefer-const variable-name */

export function image_plugin(md, name, options) {
	options = options || {};
	const marker_str = options.marker;
	const render = options.render;
	const tripleColon = ':::';
	function imageContainer(state, silent) {
		let pos = state.pos;
		if (state.src.charAt(pos) !== marker_str) {
			return false;
		}
		pos++;
		if (state.src.charAt(pos) !== marker_str) {
			return false;
		}
		pos++;
		if (state.src.charAt(pos) !== marker_str) {
			return false;
		}
		pos++;
		const markup = state.src.slice(state.pos, pos);

		const endOfContainer = state.src.indexOf(tripleColon, pos);
		if (endOfContainer !== -1) {
			const params = state.src.slice(state.pos, endOfContainer + 3);

			if (!silent) {
				const token = state.push(`${name}_container`, 'img', 0);
				token.info = params;
			}
			state.pos = endOfContainer + 3;
			return true;
		}

		if (!silent) {
			state.pending += markup;
		}
		state.pos = pos;
		return true;
	}

	md.inline.ruler.push(`${name}_container`, imageContainer, {
		alt: []
	});
	md.renderer.rules[`${name}_container`] = render;
}
