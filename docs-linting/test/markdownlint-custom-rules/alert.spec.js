const markdownlint = require('markdownlint');
const alert = require('../../markdownlint-custom-rules/alert');
const errorDetailStrings = require('../../markdownlint-custom-rules/strings');

test('Alert markdown lint', () => {
	const src = `${__dirname}/test-content/alerts.md`;
	const results = markdownlint.sync({
		customRules: alert,
		files: [src]
	});

	expect(results[src]).toEqual([
		{
			lineNumber: 7,
			ruleNames: ['DOCSMD007', 'docsmd.alert'],
			ruleDescription: 'Alert linting.',
			errorDetail: errorDetailStrings.alertType,
			errorContext: '> [!DANGER]',
			errorRange: null
		},
		{
			lineNumber: 11,
			ruleNames: ['DOCSMD007', 'docsmd.alert'],
			ruleDescription: 'Alert linting.',
			errorDetail: errorDetailStrings.alertType,
			errorContext: '> [!NOT]',
			errorRange: null
		},
		{
			lineNumber: 15,
			ruleNames: ['DOCSMD007', 'docsmd.alert'],
			ruleDescription: 'Alert linting.',
			errorDetail: errorDetailStrings.alertType,
			errorContext: '> [!tip]',
			errorRange: null
		},
		{
			lineNumber: 19,
			ruleNames: ['DOCSMD007', 'docsmd.alert'],
			ruleDescription: 'Alert linting.',
			errorDetail: errorDetailStrings.alertNoOpen,
			errorContext: '[!NOTE]',
			errorRange: null
		},
		{
			lineNumber: 21,
			ruleNames: ['DOCSMD007', 'docsmd.alert'],
			ruleDescription: 'Alert linting.',
			errorDetail: errorDetailStrings.alertNoOpen,
			errorContext: '[!CAUTION]',
			errorRange: null
		},
		{
			lineNumber: 38,
			ruleNames: ['DOCSMD007', 'docsmd.alert'],
			ruleDescription: 'Alert linting.',
			errorDetail: errorDetailStrings.alertNoExclam,
			errorContext: '> [NOTE]',
			errorRange: null
		}
	]);
});
