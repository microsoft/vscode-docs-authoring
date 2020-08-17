/* eslint-disable @typescript-eslint/no-var-requires */

'use strict';

const common = require('./common');
const detailStrings = require('./strings');

module.exports = {
	names: ['DOCSMD010', 'docsmd.xref'],
	description: `xref linting.`,
	tags: ['validation'],
	function: function rule(params, onError) {
		try {
			const doc = params.lines.join('\n');
			const fullLooseMatches = doc.match(common.openXref);
			if (fullLooseMatches) {
				params.tokens
					.filter(function filterToken(token) {
						return token.type === 'inline';
					})
					.map(text => {
						let matches = fullLooseMatches.filter(
							regexMatch => text.content.indexOf(regexMatch) > -1
						);

						if (matches == null || matches.length == 0) {
							return;
						}
						matches.map(content => {
							// no colon for "<xref:...>"
							if (content.match(common.xrefShouldIncludeColon)) {
								onError({
									lineNumber: text.lineNumber,
									detail: detailStrings.xrefShouldIncludeColon,
									context: text.line
								});
							}

							//xref should not have a space before the uid <xref: ...> vs <xref:...>
							if (content.match(common.xrefHasSpace)) {
								onError({
									lineNumber: text.lineNumber,
									detail: detailStrings.xrefHasSpace,
									context: text.line
								});
							}

							// Condition: After "<xref:...>" is missing uid.
							if (content.match(common.missingUidAttributeXref)) {
								onError({
									lineNumber: text.lineNumber,
									detail: detailStrings.missingUidAttributeXref,
									context: text.line
								});
							}

							// Condition: "<xref:...?displayProperty=" bad displayProperty indicator.
							const displayPropertyMatch = content.match(common.xrefHasDisplayProperty);
							if (displayPropertyMatch) {
								// Condition: "<xref:...?displayProperty=fullName|nameWithType>" bad displayProperty value.
								const displayPropertyValue = content.match(common.xrefDisplayPropertyValues);
								if (!displayPropertyValue) {
									onError({
										lineNumber: text.lineNumber,
										detail: detailStrings.usesCorrectXrefDisplayProperties,
										context: text.line
									});
								}
							}

							if (content.match(common.notEscapedCharacters)) {
								onError({
									lineNumber: text.lineNumber,
									detail: detailStrings.notEscapedCharacters,
									context: text.line
								});
							}
						});
					});
			}
		} catch (error) {
			console.log(error);
		}
	}
};
