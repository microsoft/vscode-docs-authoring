const markdownlint = require('markdownlint');
const moniker = require('../../markdownlint-custom-rules/moniker');
const errorDetailStrings = require("../../markdownlint-custom-rules/strings");

test('validate extension', () => {
    const src = `${__dirname}/test-content/markdown-extensions.md`;
    const results = markdownlint.sync({
        customRules: moniker,
        files: [src],
    });

    expect(results[src]).toEqual([
        {
            lineNumber: 31,
            ruleNames: ['docsmd.moniker'],
            ruleDescription: 'Moniker linting.',
            errorDetail: errorDetailStrings.monikerRange,
            errorContext: '::: moniker range:"chromeless"',
            errorRange: null
        },
        {
            lineNumber: 49,
            ruleNames: ['docsmd.moniker'],
            ruleDescription: 'Moniker linting.',
            errorDetail: errorDetailStrings.monikerSyntax,
            errorContext: '::: moniker robot',
            errorRange: null
        }
    ]);
});
