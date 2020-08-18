const markdownlint = require('markdownlint');
const securelinks = require('../../markdownlint-custom-rules/securelinks');
const errorDetailStrings = require('../../markdownlint-custom-rules/strings');

test('Secure Links markdown lint', () => {
	const src = `${__dirname}/test-content/securelinks.md`;
	const results = markdownlint.sync({
		customRules: securelinks,
		files: [src]
	});

	expect(results[src]).toEqual([
		{
			errorContext: '[Microsoft Home Content](http://www.microsoft.com/foo/test.txt)',
			errorDetail: 'Link http://www.microsoft.com/foo/test.txt',
			errorRange: [25, 37],
			lineNumber: 5,
			ruleDescription: 'All links to Microsoft properties should be secure',
			ruleNames: ['DOCSMD008', 'docsmd.securelinks']
		},
		{
			errorContext: '[Go get Visual Studio](htTp://www.visualstudio.com/foo/test)',
			errorDetail: 'Link http://www.visualstudio.com/foo/test',
			errorRange: [23, 36],
			lineNumber: 17,
			ruleDescription: 'All links to Microsoft properties should be secure',
			ruleNames: ['DOCSMD008', 'docsmd.securelinks']
		},
		{
			errorContext: '[Go get Visual Studio](http://aka.ms/learn)',
			errorDetail: 'Link http://aka.ms/learn',
			errorRange: [23, 19],
			lineNumber: 25,
			ruleDescription: 'All links to Microsoft properties should be secure',
			ruleNames: ['DOCSMD008', 'docsmd.securelinks']
		}
	]);
});
