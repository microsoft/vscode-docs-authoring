/* eslint-disable @typescript-eslint/no-var-requires */

'use strict';

const common = require('./common');

module.exports = {
	names: ['DOCSMD008', 'docsmd.securelinks'],
	description: 'All links to Microsoft properties should be secure',
	tags: ['compliance'],
	function: function rule(params, onError) {
		params.tokens
			.filter(function filterToken(token) {
				return token.type === 'inline';
			})
			.forEach(function forToken(inline) {
				inline.children
					.filter(function filterChild(child) {
						return child.type === 'link_open';
					})
					.forEach(function forToken(link) {
						if (link.attrs[0] && link.attrs[0][0] === 'href') {
							const originalHref = link.attrs[0][1];
							const href = originalHref.toLowerCase();
							const match = href.match(common.linkPattern);
							if (match) {
								let range = null;
								const column = link.line.indexOf(originalHref);
								const length = href.length;
								range = [column, length];
								onError({
									lineNumber: link.lineNumber,
									detail: 'Link ' + href,
									context: link.line,
									range
								});
							}
						}
					});
			});
	}
};
