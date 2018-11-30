const markdownlint = require('markdownlint');
const moniker = require('../../markdownlint-custom-rules/moniker');

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
            errorDetail: `Bad syntax for range argument. Use =, <=, or >=, and put value in quotes.`,
            errorContext: '::: moniker range:"chromeless"',
            errorRange: null
        },
        {
            lineNumber: 49,
            ruleNames: ['docsmd.moniker'],
            ruleDescription: 'Moniker linting.',
            errorDetail: `Bad syntax for moniker. Only "moniker range" is supported.`,
            errorContext: '::: moniker robot',
            errorRange: null
        }
    ]);
});
