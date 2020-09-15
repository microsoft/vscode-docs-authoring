/* eslint-disable @typescript-eslint/no-var-requires */

'use strict';

const common = require('./common');
const detailStrings = require('./strings');
const schemas = require('./schemas');
const { default: axios } = require('axios');

// schema linting
let allowedZoneAttributes;
let allowedZoneTargetTypes;
let zoneDataResponse;

function loadZoneSchema() {
	return axios
		.get(schemas.ZONE_SCHEMA)
		.then(function (response) {
			zoneDataResponse = response.data;
			allowedZoneTargetTypes = Object.values(zoneDataResponse.properties.target.enum);
			allowedZoneAttributes = Object.keys(zoneDataResponse.properties);
		})
		.catch(function () {
			const errorMessage = detailStrings.failedResponse
				.replace('NAME', 'zone')
				.replace('URL', schemas.ZONE_SCHEMA);
			common.output.apppendLine(errorMessage);
		});
}

loadZoneSchema();

module.exports = {
	names: ['DOCSMD005', 'docsmd.zone'],
	description: `zone linting.`,
	tags: ['validation'],
	function: function rule(params, onError) {
		const doc = params.lines.join('\n');
		const fullLooseMatches = doc.match(common.looseZone);
		const startAndEndZone = [];

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
						//do we have an "zone-end" tag?
						const matchingStartTag = text.line.match(common.startZone);
						const matchingEndTag = text.line.match(common.zoneEndTagMatch);
						if (matchingStartTag) {
							startAndEndZone.push({ start: true, lineNumber: text.lineNumber, line: text.line });
						}
						if (matchingEndTag) {
							startAndEndZone.push({
								start: false,
								lineNumber: text.lineNumber,
								line: text.line
							});
						}

						if (params.lines && text.lineNumber === maxLine) {
							for (let index = 0; index < startAndEndZone.length; index++) {
								if (
									(startAndEndZone[index].start && index == startAndEndZone.length - 1) ||
									(startAndEndZone[index].start && startAndEndZone[index + 1].start)
								) {
									onError({
										lineNumber: startAndEndZone[index].lineNumber,
										detail: detailStrings.zoneEndTagRequired,
										context: startAndEndZone[index].line
									});
								}
								if (index + 1 < startAndEndZone.length) {
									if (startAndEndZone[index].start && !startAndEndZone[index + 1].start) {
										index++;
										continue;
									}
								}
							}
						}
						const zoneMatches = textBlock.match(common.looseZone);
						if (zoneMatches === null) {
							return;
						}
						zoneMatches.forEach(zoneMatch => {
							const content = fullLooseMatches.filter(match => match.includes(zoneMatch))[0];
							if (content) {
								// Begin linting when a colon is at the beginning of a line.
								// Condition: Value of "zone target=" is other than "chromeless" or "docs".
								const typeMatch = common.zoneTargetMatch.exec(content);
								if (typeMatch) {
									if (
										allowedZoneTargetTypes &&
										allowedZoneTargetTypes.indexOf(typeMatch[1]) === -1
									) {
										onError({
											lineNumber: text.lineNumber,
											detail: detailStrings.zoneNonAllowedType.replace('___', typeMatch[1]),
											context: text.line
										});
									}
								}

								let zoneAttributes = content.match(common.zoneWithAttribute);
								if (zoneAttributes && zoneAttributes.length > 0) {
									zoneAttributes = zoneAttributes[0];
									const attributeMatches = zoneAttributes.match(common.AttributeMatchGlobal);
									if (attributeMatches && attributeMatches.length > 0) {
										attributeMatches.forEach(attributeMatch => {
											const match = common.AttributeMatch.exec(attributeMatch);
											const attr = match[1];
											if (allowedZoneAttributes) {
												const attributeInAllowedList = allowedZoneAttributes.includes(
													attr.toLowerCase()
												);
												if (
													!attributeInAllowedList &&
													text.line &&
													!text.line.includes(':::zone-end')
												) {
													onError({
														lineNumber: text.lineNumber,
														detail: detailStrings.zoneNonAllowedAttribute.replace('___', attr),
														context: text.line
													});
												} else {
													const attributeNotMatchCasing = allowedZoneAttributes.includes(attr);
													if (
														!attributeNotMatchCasing &&
														text.line &&
														!text.line.includes(':::zone-end')
													) {
														onError({
															lineNumber: text.lineNumber,
															detail: detailStrings.zoneCaseSensitive.replace('___', attr),
															context: text.line
														});
													}
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
