const markdownlint = require('markdownlint');
const syntax = require('../../markdownlint-custom-rules/syntax');
const errorDetailStrings = require("../../markdownlint-custom-rules/strings");

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
            errorDetail: errorDetailStrings.syntaxCount,
            errorContext: ': zone',
            errorRange: null
        },
        {
            lineNumber: 15,
            ruleNames: ['docsmd.syntax'],
            ruleDescription: 'Syntax linting.',
            errorDetail: errorDetailStrings.syntaxSpace,
            errorContext: ':::zone',
            errorRange: null
        },
        {
            lineNumber: 19,
            ruleNames: ['docsmd.syntax'],
            ruleDescription: 'Syntax linting.',
            errorDetail: errorDetailStrings.syntaxUnsupportedExtension,
            errorContext: '::: keyboard',
            errorRange: null
        },
    ]);
});
