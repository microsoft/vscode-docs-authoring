const markdownlint = require('markdownlint');
const syntax = require('../../markdownlint-custom-rules/syntax');
const errorDetailStrings = require("../../markdownlint-custom-rules/strings");

test('Syntax markdown lint', () => {
    const src = `${__dirname}/test-content/markdown-extensions.md`;
    const results = markdownlint.sync({
        customRules: syntax,
        files: [src],
    });

    expect(results[src]).toEqual([
        {
            lineNumber: 19,
            ruleNames: ['DOCSMD004', 'docsmd.syntax'],
            ruleDescription: 'Syntax linting.',
            errorDetail: errorDetailStrings.syntaxUnsupportedExtension,
            errorContext: '::: keyboard',
            errorRange: null
        },
    ]);
});
