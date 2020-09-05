/* eslint-disable @typescript-eslint/no-var-requires */

'use strict';

const common = require('./common');
const detailStrings = require('./strings');

module.exports = {
	names: ['DOCSMD004', 'docsmd.syntax'],
	description: 'triple colon syntax linting.',
	tags: ['validation'],
	function: function rule(params, onError) {
		params.tokens
			.filter(function filterToken(token) {
				return token.type === 'inline';
			})
			.forEach(function forToken(inline) {
				inline.children
					.filter(function filterChild(child) {
						return child.type === 'text';
					})
					.forEach(function forChild(text) {
						const content = text.content.toLowerCase();
						// Begin linting when a colon is at the beginning of a line.
						if (content.match(common.singleColon)) {
							// Condition: After three colons and a space, text is not a supported extension.
							if (
								content.match(common.tripleColonSyntax) &&
								!content.match(common.supportedExtensions)
							) {
								onError({
									lineNumber: text.lineNumber,
									detail: detailStrings.syntaxUnsupportedExtension,
									context: text.line
								});
							}
						}
					});
			});
	}
};
