const markdownlint = require('markdownlint');
const row = require('../rules/row');
const errorDetailStrings = require('../rules/strings');
const rowLinting = 'row linting.';
test('row markdown lint', () => {
	const src = `${__dirname}/test-content/row.md`;
	let results = markdownlint.sync({
		customRules: row,
		files: [src]
	});
	expect(results[src]).toEqual([
		{
			lineNumber: 3,
			ruleNames: ['DOCSMD001', 'docsmd.row'],
			ruleDescription: rowLinting,
			ruleInformation: null,
			errorDetail: errorDetailStrings.rowCountValue,
			errorContext: ':::row count="5":::',
			errorRange: null
		},
		{
			lineNumber: 12,
			ruleNames: ['DOCSMD001', 'docsmd.row'],
			ruleDescription: rowLinting,
			ruleInformation: null,
			errorDetail: errorDetailStrings.rowCountMustBeNumber,
			errorContext: ':::row count="abc":::',
			errorRange: null
		}
	]);
});
