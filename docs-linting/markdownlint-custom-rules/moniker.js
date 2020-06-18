/* eslint-disable @typescript-eslint/no-var-requires */

'use strict';

const common = require('./common');
const detailStrings = require('./strings');
const schemas = require('./schemas');
const { default: axios } = require('axios');

// schema linting
let allowedMonikerAttributes;
let monikerDataResponse;

function loadMonikerSchema() {
	axios
		.get(schemas.MONIKER_SCHEMA)
		.then(function (response) {
			monikerDataResponse = response.data;
			allowedMonikerAttributes = Object.keys(monikerDataResponse.properties);
		})
		.catch(function () {
			const errorMessage = detailStrings.failedResponse
				.replace('NAME', 'moniker')
				.replace('URL', schemas.MONIKER_SCHEMA);
			common.output.apppendLine(errorMessage);
		});
}

loadMonikerSchema();

module.exports = {
	names: ['DOCSMD006', 'docsmd.moniker'],
	description: `moniker linting.`,
	tags: ['validation'],
	function: function rule(params, onError) {
		const doc = params.lines.join('\n');
		const fullLooseMatches = doc.match(common.looseMoniker);
		const startAndEndMoniker = [];
		let maxLine = 0;
		if (params.lines) {
			maxLine = common.getMaxLineNotEmpty(params.lines);
		}
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
						//do we have an "moniker-end" tag?
						const matchingStartTag = text.line.match(common.startMoniker);
						const matchingEndTag = text.line.match(common.monikerEndTagMatch);
						if (matchingStartTag) {
							startAndEndMoniker.push({
								start: true,
								lineNumber: text.lineNumber,
								line: text.line
							});
						}
						if (matchingEndTag) {
							startAndEndMoniker.push({
								start: false,
								lineNumber: text.lineNumber,
								line: text.line
							});
						}

						if (params.lines && text.lineNumber === maxLine) {
							for (let index = 0; index < startAndEndMoniker.length; index++) {
								if (
									(startAndEndMoniker[index].start && index == startAndEndMoniker.length - 1) ||
									(startAndEndMoniker[index].start && startAndEndMoniker[index + 1].start)
								) {
									onError({
										lineNumber: startAndEndMoniker[index].lineNumber,
										detail: detailStrings.monikerEndTagRequired,
										context: startAndEndMoniker[index].line
									});
								}
								if (index + 1 < startAndEndMoniker.length) {
									if (startAndEndMoniker[index].start && !startAndEndMoniker[index + 1].start) {
										index++;
										continue;
									}
								}
							}
						}

						const monikerMatches = textBlock.match(common.looseMoniker);
						if (monikerMatches === null) {
							return;
						}
						monikerMatches.forEach(monikerMatch => {
							const content = fullLooseMatches.filter(match => match.includes(monikerMatch))[0];
							if (content) {
								const rangeMatch = common.rangeMoniker.exec(content);
								if (!rangeMatch || (rangeMatch && rangeMatch.length > 1 && rangeMatch[1] === '')) {
									onError({
										lineNumber: text.lineNumber,
										detail: detailStrings.monikerRange,
										context: text.line
									});
								}
								const attributeMatches = content.match(common.AttributeMatchGlobal);
								if (attributeMatches && attributeMatches.length > 0) {
									attributeMatches.forEach(attributeMatch => {
										const match = common.AttributeMatch.exec(attributeMatch);
										const attr = match[1].replace(`="<`, '').replace(`=">`, '');
										if (allowedMonikerAttributes) {
											const attributeInAllowedList = allowedMonikerAttributes.includes(
												attr.toLowerCase()
											);
											if (!attributeInAllowedList) {
												onError({
													lineNumber: text.lineNumber,
													detail: detailStrings.monikerNonAllowedAttribute.replace('___', attr),
													context: text.line
												});
											} else {
												const attributeNotMatchCasing = allowedMonikerAttributes.includes(attr);
												if (!attributeNotMatchCasing) {
													onError({
														lineNumber: text.lineNumber,
														detail: detailStrings.monikerCaseSensitive,
														context: text.line
													});
												}
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
