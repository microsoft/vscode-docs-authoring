const markdownlint = require('markdownlint');
const syntax = require('../rules/syntax');
const errorDetailStrings = require('../rules/strings');

test('Syntax markdown lint', () => {
	const src = `${__dirname}/test-content/syntax.md`;
	const results = markdownlint.sync({
		customRules: syntax,
		files: [src]
	});

	expect(results[src]).toEqual([
		{
			lineNumber: 3,
			ruleNames: ['DOCSMD004', 'docsmd.syntax'],
			ruleDescription: 'triple colon syntax linting.',
			ruleInformation: null,
			errorDetail: errorDetailStrings.syntaxUnsupportedExtension,
			errorContext: '::: keyboard',
			errorRange: null
		}
	]);
});
