/* eslint-disable @typescript-eslint/no-var-requires */

'use strict';

const common = require('./common');
const detailStrings = require('./strings');
const schemas = require('./schemas');
const { default: axios } = require('axios');

// schema linting
let allowedRowAttributes;
let rowDataResponse;

function loadRowSchema() {
	axios
		.get(schemas.ROW_SCHEMA)
		.then(function (response) {
			rowDataResponse = response.data;
			allowedRowAttributes = Object.keys(rowDataResponse.properties);
		})
		.catch(function () {
			const errorMessage = detailStrings.failedResponse
				.replace('NAME', 'row')
				.replace('URL', schemas.ROW_SCHEMA);
			common.output.apppendLine(errorMessage);
		});
}

loadRowSchema();

module.exports = {
	names: ['DOCSMD001', 'docsmd.row'],
	description: 'row linting.',
	tags: ['validation'],
	function: function rule(params, onError) {
		const doc = params.lines.join('\n');
		const fullLooseMatches = doc.match(common.looseRow);
		const startAndEndRow = [];
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
						//do we have an "row-end" tag?
						const matchingStartTag = text.line.match(common.startRow);
						const matchingEndTag = text.line.match(common.rowEndTagMatch);
						if (matchingStartTag) {
							startAndEndRow.push({ start: true, lineNumber: text.lineNumber, line: text.line });
						}
						if (matchingEndTag) {
							startAndEndRow.push({
								start: false,
								lineNumber: text.lineNumber,
								line: text.line
							});
						}
						if (params.lines && text.lineNumber === maxLine) {
							for (let index = 0; index < startAndEndRow.length; index++) {
								if (
									(startAndEndRow[index].start && index == startAndEndRow.length - 1) ||
									(startAndEndRow[index].start && startAndEndRow[index + 1].start)
								) {
									onError({
										lineNumber: startAndEndRow[index].lineNumber,
										detail: detailStrings.rowEndTagRequired,
										context: startAndEndRow[index].line
									});
								}
								if (index + 1 < startAndEndRow.length) {
									if (startAndEndRow[index].start && !startAndEndRow[index + 1].start) {
										index++;
										continue;
									}
								}
							}
						}

						const rowMatches = textBlock.match(common.looseRow);
						if (rowMatches === null) {
							return;
						}
						rowMatches.forEach(rowMatch => {
							const content = fullLooseMatches.filter(match => match.includes(rowMatch))[0];
							if (content) {
								//malformed colons
								if (!content.match(common.openAndClosingValidTripleColon)) {
									onError({
										lineNumber: text.lineNumber,
										detail: detailStrings.tripleColonsIncorrect,
										context: text.line
									});
								}

								const countVal = content.match(common.rowCountValue);
								if (countVal && countVal.length > 1) {
									const parsed = parseInt(countVal[1], 10);
									if (isNaN(parsed) && !common.rowEnd.test(text.line)) {
										onError({
											lineNumber: text.lineNumber,
											detail: detailStrings.rowCountMustBeNumber,
											context: text.line
										});
									} else {
										if ((parsed > 4 || parsed < 2) && !common.rowEnd.test(text.line)) {
											onError({
												lineNumber: text.lineNumber,
												detail: detailStrings.rowCountValue,
												context: text.line
											});
										}
									}
								}

								if (text.line) {
									let rowAttributes = content.match(common.rowAttributeMatchGlobal);
									if (rowAttributes && rowAttributes.length > 0) {
										rowAttributes = rowAttributes[0];
										const attributeMatches = rowAttributes.match(common.AttributeMatchGlobal);
										if (attributeMatches && attributeMatches.length > 0) {
											attributeMatches.forEach(attributeMatch => {
												const match = common.AttributeMatch.exec(attributeMatch);
												const attr = match[1];
												if (allowedRowAttributes) {
													const attributeInAllowedList = allowedRowAttributes.includes(
														attr.toLowerCase()
													);
													if (!attributeInAllowedList && !common.rowEnd.test(text.line)) {
														onError({
															lineNumber: text.lineNumber,
															detail: detailStrings.rowNonAllowedAttribute.replace('___', attr),
															context: text.line
														});
													} else {
														const attributeNotMatchCasing = allowedRowAttributes.includes(attr);
														if (!attributeNotMatchCasing && !common.rowEnd.test(text.line)) {
															onError({
																lineNumber: text.lineNumber,
																detail: detailStrings.rowCaseSensitive.replace('___', attr),
																context: text.line
															});
														}
													}
												}
											});
										}
									}
								}
							}
						});
					});
			});
	}
};
