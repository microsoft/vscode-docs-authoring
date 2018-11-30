const markdownlint = require('markdownlint');
const syntax = require('../../markdownlint-custom-rules/syntax');

test('validate extension', () => {
    const src = `${__dirname}/test-content/markdown-extensions.md`;
    const results = markdownlint.sync({
        customRules: syntax,
        files: [src],
    });

    expect(results[src]).toEqual([
        {
            lineNumber: 5,
            ruleNames: ['docsmd.syntax'],
            ruleDescription: 'Syntax linting.',
            errorDetail: `Bad syntax for markdown extension. Begin with "::: ".`,
            errorContext: ': zone',
            errorRange: null
        },
        {
            lineNumber: 15,
            ruleNames: ['docsmd.syntax'],
            ruleDescription: 'Syntax linting.',
            errorDetail: `Bad syntax for markdown extension. One space required after ":::".`,
            errorContext: ':::zone',
            errorRange: null
        },
        {
            lineNumber: 19,
            ruleNames: ['docsmd.syntax'],
            ruleDescription: 'Syntax linting.',
            errorDetail: `Bad syntax for markdown extension. "::: keyboard" is not supported.`,
            errorContext: '::: keyboard',
            errorRange: null
        },
    ]);
});
