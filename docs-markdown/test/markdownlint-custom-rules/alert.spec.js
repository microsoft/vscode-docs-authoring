const markdownlint = require('markdownlint');
const alert = require('../../markdownlint-custom-rules/alert');
const errorDetailStrings = require("../../markdownlint-custom-rules/strings");

test('validate extension', () => {
    const src = `${__dirname}/test-content/alerts.md`;
    const results = markdownlint.sync({
        customRules: alert,
        files: [src],
    });

    expect(results[src]).toEqual([
        {
            lineNumber: 7,
            ruleNames: ['docsmd.alert'],
            ruleDescription: 'Alert linting.',
            errorDetail: errorDetailStrings.alertType,
            errorContext: '> [!DANGER]',
            errorRange: null
        },
        {
            lineNumber: 11,
            ruleNames: ['docsmd.alert'],
            ruleDescription: 'Alert linting.',
            errorDetail: errorDetailStrings.alertType,
            errorContext: '> [!NOT]',
            errorRange: null
        },
        {
            lineNumber: 15,
            ruleNames: ['docsmd.alert'],
            ruleDescription: 'Alert linting.',
            errorDetail: errorDetailStrings.alertType,
            errorContext: '> [!tip]',
            errorRange: null
        }
    ]);
});
