/* eslint-disable @typescript-eslint/no-var-requires */

'use strict';

const common = require('./common');
const detailStrings = require('./strings');
const schemas = require('./schemas');
const { default: axios } = require('axios');

// schema linting
let allowedImageTypes;
let allowedImageAttributes;
let imageDataResponse;

function loadImageSchema() {
	axios
		.get(schemas.IMAGE_SCHEMA)
		.then(function (response) {
			imageDataResponse = response.data;
			allowedImageTypes = Object.values(imageDataResponse.properties.type.enum);
			allowedImageAttributes = Object.keys(imageDataResponse.properties);
		})
		.catch(function () {
			const errorMessage = detailStrings.failedResponse
				.replace('NAME', 'image')
				.replace('URL', schemas.IMAGE_SCHEMA);
			common.output.apppendLine(errorMessage);
		});
}

loadImageSchema();

module.exports = {
	names: ['DOCSMD011', 'docsmd.image'],
	description: `image linting.`,
	tags: ['validation'],
	function: function rule(params, onError) {
		const doc = params.lines.join('\n');
		const fullLooseMatches = doc.match(common.syntaxImageLooseMatch);
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
						const imageMatches = textBlock.match(common.syntaxImageLooseMatch);
						if (imageMatches === null) {
							return;
						}
						imageMatches.forEach(imageMatch => {
							const content = !imageMatch.match(common.imageComplexEndTagMatch)
								? fullLooseMatches.filter(match => match.includes(imageMatch))[0]
								: imageMatch;

							//malformed colons
							if (!content.match(common.openAndClosingValidTripleColon)) {
								onError({
									lineNumber: text.lineNumber,
									detail: detailStrings.tripleColonsIncorrect,
									context: text.line
								});
							}

							//source check
							const notImageComplexEndTagMatch = content.match(common.imageComplexEndTagMatch);
							if (!notImageComplexEndTagMatch) {
								const sourceMatch = common.imageSourceMatch.exec(content);
								if (!sourceMatch || sourceMatch[1] === '') {
									onError({
										lineNumber: text.lineNumber,
										detail: detailStrings.imageSourceRequired,
										context: text.line
									});
								}
							}

							//lightbox source check
							if (!notImageComplexEndTagMatch) {
								const sourceMatch = 'common.imageLightboxMatch.exec(content)';
								if (sourceMatch && sourceMatch[1] === '') {
									onError({
										lineNumber: text.lineNumber,
										detail: detailStrings.imageLightboxSourceInvalid,
										context: text.line
									});
								}
							}

							//case sensitivity and attributes check
							let attrMatches = content.match(common.syntaxImageAttributes);
							attrMatches = attrMatches.filter(attr => attr != '');
							attrMatches.forEach(attr => {
								if (attr !== attr.toLowerCase()) {
									onError({
										lineNumber: text.lineNumber,
										detail: detailStrings.imageCaseSensitive,
										context: text.line
									});
								}

								//make sure each attribute is allowed...
								if (
									allowedImageAttributes &&
									allowedImageAttributes.indexOf(attr) === -1 &&
									attr !== ':image'
								) {
									onError({
										lineNumber: text.lineNumber,
										detail: detailStrings.imageNonAllowedAttribute.replace('___', attr),
										context: text.line
									});
								}

								//make sure the value of each attribute is strong type matched
								if (
									imageDataResponse &&
									attr !== ':image' &&
									imageDataResponse.properties[attr].type === 'boolean'
								) {
									var attrValueRegEx = new RegExp(`${attr}\\s*=\\s*"([a-z]*)"`, 'm');
									const attrValueMatch = attrValueRegEx.exec(content);
									if (
										'true' != attrValueMatch[1].toLowerCase() &&
										'false' != attrValueMatch[1].toLowerCase()
									) {
										onError({
											lineNumber: text.lineNumber,
											detail: detailStrings.imageAttributeWrongStrongTypeBoolean.replace(
												'___',
												attr
											),
											context: text.line
										});
									}
								}
							});

							//check if the type is valid
							const typeMatch = common.imageTypeMatch.exec(content);
							if (typeMatch) {
								if (allowedImageTypes && allowedImageTypes.indexOf(typeMatch[1]) === -1) {
									onError({
										lineNumber: text.lineNumber,
										detail: detailStrings.imageNonAllowedType.replace('___', typeMatch[1]),
										context: text.line
									});
								}

								//complex type rules
								if (typeMatch[1] === 'complex') {
									//do we have an "image-end" tag?
									const imageMatches = content.match(common.imageOpen);
									if (imageMatches.length > 2 || !content.match(common.imageComplexEndTagMatch)) {
										onError({
											lineNumber: text.lineNumber,
											detail: detailStrings.imageComplexEndTagRequired,
											context: text.line
										});
									}

									//do we have a long description?
									const longDescMatch = common.imageLongDescriptionMatch.exec(content);
									if (!longDescMatch || longDescMatch[4].match(/^\s*$/im)[0] != '') {
										onError({
											lineNumber: text.lineNumber,
											detail: detailStrings.imageComplexLongDescriptionRequired,
											context: text.line
										});
									}
								}

								if (common.imageAltTextTypes.indexOf(typeMatch[1]) !== -1) {
									//do we have alt-text?
									const altTextMatch = common.imageAltTextMatch.exec(content);
									if (!altTextMatch || altTextMatch[1] === '') {
										onError({
											lineNumber: text.lineNumber,
											detail: detailStrings.imageAltTextRequired,
											context: text.line
										});
									}
								} else {
									//do we have loc-scope? cuzzz, we shouldn't!
									const locScopeMatch = common.imageLocScopeMatch.exec(content);
									if (locScopeMatch) {
										onError({
											lineNumber: text.lineNumber,
											detail: detailStrings.imageIconRemoveLocScope,
											context: text.line
										});
									}
									//do we have alt-text? cuzzz, we shouldn't!
									const altTextMatch = common.imageAltTextMatch.exec(content);
									if (altTextMatch) {
										onError({
											lineNumber: text.lineNumber,
											detail: detailStrings.imageIconRemoveAltText,
											context: text.line
										});
									}
								}
							}
						});
					});
			});
	}
};
