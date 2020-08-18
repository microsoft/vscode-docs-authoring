const markdownlint = require('markdownlint');
const zone = require('../../markdownlint-custom-rules/zone');
const errorDetailStrings = require('../../markdownlint-custom-rules/strings');
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
			errorDetail: errorDetailStrings.zoneEndTagRequired,
			errorContext: '::: zone target="docs"',
			errorRange: null
		}
	]);
});
