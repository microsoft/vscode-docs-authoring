const markdownlint = require('markdownlint');
const xref = require('../../markdownlint-custom-rules/xref');
const errorDetailStrings = require('../../markdownlint-custom-rules/strings');
const xrefLinting = 'xref linting.';

test('Xref markdown lint', () => {
	const src = `${__dirname}/test-content/xref.md`;
	let results = markdownlint.sync({
		customRules: xref,
		files: [src]
	});

	expect(results[src]).toEqual([
		{
			lineNumber: 3,
			ruleNames: ['DOCSMD010', 'docsmd.xref'],
			ruleDescription: xrefLinting,
			errorDetail: errorDetailStrings.notEscapedCharacters,
			errorContext:
				'<xref:Microsoft.Extensions.Configuration.AzureKeyVaultConfigurationExtensions.AddAzureKeyVault*>',
			errorRange: null
		},
		{
			lineNumber: 5,
			ruleNames: ['DOCSMD010', 'docsmd.xref'],
			ruleDescription: xrefLinting,
			errorDetail: errorDetailStrings.notEscapedCharacters,
			errorContext: '<xref:System.Threading.Tasks.ValueTask`1>',
			errorRange: null
		}
	]);
});
