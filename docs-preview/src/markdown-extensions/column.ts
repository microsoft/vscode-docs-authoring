import { output } from '../helper/common';

export const columnOptions = {
	marker: ':',
	validate(params) {
		return params.trim().match(/column(\s+span="([1-9]+)?")?:::/g);
	},
	render(tokens, idx) {
		const RE = /column((\s+)span="([1-9]+)?")?:::/g;
		const start = RE.exec(tokens[idx].info.trim());
		if (start) {
			if (start[3]) {
				return `<div class='column span${start[3]}'>`;
			} else {
				// opening tag
				return "<div class='column'>";
			}
		} else {
			return '';
		}
	}
};

export const columnEndOptions = {
	marker: ':',
	validate(params) {
		return params.trim().match(/column-end:::/g);
	},
	render(tokens, idx) {
		const RE = /column-end:::/g;
		const end = RE.exec(tokens[idx].info.trim());
		if (end) {
			// closing tag
			return '</div>';
		} else {
			return '';
		}
	}
};

export function column_end(md, options) {
	const COLUMN_RE = /(?!:::column(\s+span="([1-9]+)?")?:::[\s\S])[ ]{5}[^]+?:::column-end:::/g;
	const CODEBLOCK_RE = /[ ]{5}/g;
	const COLUMN_END_RE = /(:::column-end:::)/g;
	const removeCodeblockSpaces = (src: string) => {
		const matches = src.match(COLUMN_RE);
		if (matches) {
			matches.map(element => {
				const position = src.indexOf(element);
				let codeBlockOutput = element.replace(CODEBLOCK_RE, '');
				codeBlockOutput = codeBlockOutput.replace(COLUMN_END_RE, '\r\n:::column-end:::');
				src =
					src.slice(0, position) +
					codeBlockOutput +
					src.slice(position + element.length, src.length);
			});
		}

		return src;
	};

	const customCodeBlock = state => {
		try {
			state.src = removeCodeblockSpaces(state.src);
		} catch (error) {
			output.appendLine(error);
		}
	};
	md.core.ruler.before('normalize', 'custom_codeblock', customCodeBlock);
}
