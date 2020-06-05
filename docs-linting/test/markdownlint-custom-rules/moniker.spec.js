const markdownlint = require('markdownlint');
const moniker = require('../../markdownlint-custom-rules/moniker');
const errorDetailStrings = require('../../markdownlint-custom-rules/strings');

test('Moniker markdown lint', () => {
	const src = `${__dirname}/test-content/markdown-extensions.md`;
	const results = markdownlint.sync({
		customRules: moniker,
		files: [src]
	});

	expect(results[src]).toEqual([
		{
			lineNumber: 31,
			ruleNames: ['DOCSMD006', 'docsmd.moniker'],
			ruleDescription: 'Moniker linting.',
			errorDetail: errorDetailStrings.monikerRange,
			errorContext: ':::moniker',
			errorRange: null
		},
		{
			lineNumber: 46,
			ruleNames: ['DOCSMD006', 'docsmd.moniker'],
			ruleDescription: 'Moniker linting.',
			errorDetail: errorDetailStrings.monikerRange,
			errorContext: '::: moniker range=""',
			errorRange: null
		},
		{
			lineNumber: 50,
			ruleNames: ['DOCSMD006', 'docsmd.moniker'],
			ruleDescription: 'Moniker linting.',
			errorDetail: errorDetailStrings.monikerCaseSensitive,
			errorContext: '::: moniker Range=">="',
			errorRange: null
		},
		{
			lineNumber: 56,
			ruleNames: ['DOCSMD006', 'docsmd.moniker'],
			ruleDescription: 'Moniker linting.',
			errorDetail: errorDetailStrings.monikerEnd,
			errorContext: '::: moniker range="<="',
			errorRange: null
		},
		{
			lineNumber: 60,
			ruleNames: ['DOCSMD006', 'docsmd.moniker'],
			ruleDescription: 'Moniker linting.',
			errorDetail: errorDetailStrings.monikerRange,
			errorContext: '::: moniker robot="abc"',
			errorRange: null
		}
	]);
});
