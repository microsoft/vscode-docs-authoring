const markdownlint = require('markdownlint');
const zone = require('../rules/zone');
const errorDetailStrings = require('../rules/strings');
const zoneLinting = 'zone linting.';
test('Zone markdown lint', () => {
	const src = `${__dirname}/test-content/zone.md`;
	let results = markdownlint.sync({
		customRules: zone,
		files: [src]
	});
	expect(results[src]).toEqual([
		{
			lineNumber: 7,
			ruleNames: ['DOCSMD005', 'docsmd.zone'],
			ruleDescription: zoneLinting,
			ruleInformation: null,
			errorDetail: errorDetailStrings.zoneEndTagRequired,
			errorContext: '::: zone target="docs"',
			errorRange: null
		}
	]);
});
