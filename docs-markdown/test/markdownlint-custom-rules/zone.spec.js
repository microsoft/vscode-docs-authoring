const markdownlint = require('markdownlint');
const zone = require('../../markdownlint-custom-rules/zone');
const errorDetailStrings = require("../../markdownlint-custom-rules/strings");

test('validate extension', () => {
    const src = `${__dirname}/test-content/markdown-extensions.md`;
    const results = markdownlint.sync({
        customRules: zone,
        files: [src],
    });

    expect(results[src]).toEqual([
        {
            lineNumber: 23,
            ruleNames: ['docsmd.zone'],
            ruleDescription: 'Zone linting.',
            errorDetail: errorDetailStrings.zoneSyntax,
            errorContext: '::: zone pelican',
            errorRange: null
        },
        {
            lineNumber: 27,
            ruleNames: ['docsmd.zone'],
            ruleDescription: 'Zone linting.',
            errorDetail: errorDetailStrings.zoneRender,
            errorContext: '::: zone target:',
            errorRange: null
        },
        {
            lineNumber: 41,
            ruleNames: ['docsmd.zone'],
            ruleDescription: 'Zone linting.',
            errorDetail: errorDetailStrings.zoneValue,
            errorContext: '::: zone target="volcano"',
            errorRange: null
        }
    ]);
});
