/* eslint-disable @typescript-eslint/no-var-requires */

'use strict';

const common = require('./common');
const detailStrings = require('./strings');
const schemas = require('./schemas');
const { default: axios } = require('axios');

// schema linting
let allowedColumnAttributes;
let columnDataResponse;

function loadColumnSchema() {
	axios
		.get(schemas.COLUMN_SCHEMA)
		.then(function (response) {
			columnDataResponse = response.data;
			allowedColumnAttributes = Object.keys(columnDataResponse.properties);
		})
		.catch(function () {
			const errorMessage = detailStrings.failedResponse
				.replace('NAME', 'column')
				.replace('URL', schemas.COLUMN_SCHEMA);
			common.output.apppendLine(errorMessage);
		});
}

loadColumnSchema();

module.exports = {
	names: ['DOCSMD003', 'column'],
	description: `Bad column syntax.`,
	tags: ['validation'],
	function: function rule(params, onError) {
		const doc = params.lines.join('\n');
		const fullLooseMatches = doc.match(common.looseColumn);
		const startAndEndColumn = [];
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
						//do we have an "column-end" tag?
						const matchingStartTag = text.line.match(common.startColumn);
						const matchingEndTag = text.line.match(common.columnEndTagMatch);
						if (matchingStartTag) {
							startAndEndColumn.push({ start: true, lineNumber: text.lineNumber, line: text.line });
						}
						if (matchingEndTag) {
							startAndEndColumn.push({
								start: false,
								lineNumber: text.lineNumber,
								line: text.line
							});
						}
						if (params.line && text.lineNumber === params.lines.length - 1) {
							for (let index = 0; index < startAndEndColumn.length; index++) {
								if (
									(startAndEndColumn[index].start && index == startAndEndColumn.length - 1) ||
									(startAndEndColumn[index].start && startAndEndColumn[index + 1].start)
								) {
									onError({
										lineNumber: startAndEndColumn[index].lineNumber,
										detail: detailStrings.columnSyntax,
										context: startAndEndColumn[index].line
									});
								}
								if (index + 1 < startAndEndColumn.length) {
									if (startAndEndColumn[index].start && !startAndEndColumn[index + 1].start) {
										index++;
										continue;
									}
								}
							}
						}

						const columnMatches = textBlock.match(common.looseColumn);
						if (columnMatches === null) {
							return;
						}
						columnMatches.forEach(columnMatch => {
							const content = fullLooseMatches.filter(match => match.includes(columnMatch))[0];
							if (content) {
								if (
									content.match(common.columnWithAttribute) &&
									!content.match(common.columnSpan)
								) {
									onError({
										lineNumber: text.lineNumber,
										detail: detailStrings.contenSpanAttribute,
										context: text.line
									});
								}
								//malformed colons
								if (!content.match(common.openAndClosingValidTripleColon)) {
									onError({
										lineNumber: text.lineNumber,
										detail: detailStrings.tripleColonsIncorrect,
										context: text.line
									});
								}

								let columnAttributes = content.match(common.columnWithAttribute);
								if (columnAttributes && columnAttributes.length > 0) {
									columnAttributes = columnAttributes[0];
									const attributeMatches = columnAttributes.match(common.AttributeMatchGlobal);
									if (attributeMatches && attributeMatches.length > 0) {
										attributeMatches.forEach(attributeMatch => {
											const match = common.AttributeMatch.exec(attributeMatch);
											const attr = match[1];
											const attributeInAllowedList = allowedColumnAttributes.includes(
												attr.toLowerCase()
											);
											if (!attributeInAllowedList) {
												onError({
													lineNumber: text.lineNumber,
													detail: detailStrings.columnNonAllowedAttribute.replace('___', attr),
													context: text.line
												});
											} else {
												const attributeNotMatchCasing = allowedColumnAttributes.includes(attr);
												if (!attributeNotMatchCasing) {
													onError({
														lineNumber: text.lineNumber,
														detail: detailStrings.columnCaseSensitive.replace('___', attr),
														context: text.line
													});
												}
											}
										});
									}
								}
							}
						});
					});
			});
	}
};
