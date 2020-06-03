/* eslint-disable @typescript-eslint/no-var-requires */

'use strict';

const common = require('./common');
const detailStrings = require('./strings');

module.exports = {
	names: ['DOCSMD006', 'docsmd.moniker'],
	description: `Moniker linting.`,
	tags: ['validation'],
	function: function rule(params, onError) {
		const doc = params.lines.join('\n');
		const fullLooseMatches = doc.match(common.looseMoniker);
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
						const textBlock = text.content;
						const monikerMatches = textBlock.match(common.looseMoniker);
						if (monikerMatches === null) {
							return;
						}
						monikerMatches.forEach(monikerMatch => {
							const content = fullLooseMatches.filter(match => match.includes(monikerMatch))[0];
							if (content) {
								const notMonikerEndTagMatch = content.match(common.endMoniker);
								if (!notMonikerEndTagMatch) {
									const rangeMatch = common.rangeMoniker.exec(content);
									if (!rangeMatch || rangeMatch[1] === '') {
										onError({
											lineNumber: text.lineNumber,
											detail: detailStrings.monikerRange,
											context: text.line
										});
									}
								}
								const monikerMatches = content.match(common.openMoniker);
								if (monikerMatches.length < 2 || !content.match(common.notMonikerEndTagMatch)) {
									onError({
										lineNumber: text.lineNumber,
										detail: detailStrings.monikerEnd,
										context: text.line
									});
								}
								const attributeMatches = content.match(common.AttributeMatchGlobal);
								if (attributeMatches && attributeMatches.length > 0) {
									attributeMatches.forEach(attributeMatch => {
										const match = common.AttributeMatch.exec(attributeMatch);
										const attr = match[1].replace(`="<`, '').replace(`=">`, '');

										const attributeInAllowedList = common.allowedMonikerAttributes.includes(
											attr.toLowerCase()
										);
										if (!attributeInAllowedList) {
											onError({
												lineNumber: text.lineNumber,
												detail: detailStrings.monikerNonAllowedAttribute.replace('___', attr),
												context: text.line
											});
										} else {
											const attributeNotMatchCasing = common.allowedMonikerAttributes.includes(
												attr
											);
											if (!attributeNotMatchCasing) {
												onError({
													lineNumber: text.lineNumber,
													detail: detailStrings.monikerCaseSensitive,
													context: text.line
												});
											}
										}
									});
								}
							}
						});
					});
			});
	}
};
