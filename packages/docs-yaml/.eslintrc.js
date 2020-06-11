module.exports = {
	root: true,
	env: {
		browser: false,
		node: true,
		es6: true
	},
	extends: [
		'plugin:@typescript-eslint/recommended',
		'plugin:@typescript-eslint/recommended-requiring-type-checking',
		'plugin:import/typescript'
	],
	parser: '@typescript-eslint/parser',
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: ['./tsconfig.json']
	},
	plugins: ['@typescript-eslint', '@typescript-eslint/tslint', 'import'],
	settings: {
		'import/resolver': 'webpack'
	},
	rules: {
		'@typescript-eslint/no-inferrable-types': 'off',
		'@typescript-eslint/no-unnecessary-type-assertion': 'off',
		'@typescript-eslint/require-await': 'off',
		'@typescript-eslint/camelcase': 'off',
		'@typescript-eslint/explicit-function-return-type': 'off',
		'@typescript-eslint/adjacent-overload-signatures': 'error',
		'@typescript-eslint/array-type': 'error',
		'@typescript-eslint/class-name-casing': 'error',
		'@typescript-eslint/consistent-type-assertions': 'off',
		'@typescript-eslint/indent': ['off', 'tabs'],
		'@typescript-eslint/interface-name-prefix': 'error',
		'@typescript-eslint/member-ordering': 'error',
		'@typescript-eslint/no-empty-function': 'off',
		'@typescript-eslint/no-empty-interface': 'error',
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-misused-new': 'error',
		'@typescript-eslint/no-namespace': 'error',
		'@typescript-eslint/no-parameter-properties': 'off',
		'@typescript-eslint/no-use-before-define': 'off',
		'@typescript-eslint/no-var-requires': 'error',
		'@typescript-eslint/prefer-for-of': 'error',
		'@typescript-eslint/prefer-function-type': 'error',
		'@typescript-eslint/prefer-namespace-keyword': 'error',
		'@typescript-eslint/no-misused-promises': 'off',
		'@typescript-eslint/prefer-includes': 'off',
		'@typescript-eslint/quotes': [
			'error',
			'single',
			{ allowTemplateLiterals: true, avoidEscape: true }
		],
		'@typescript-eslint/triple-slash-reference': 'error',
		'@typescript-eslint/unified-signatures': 'error',
		'arrow-parens': ['error', 'as-needed'],
		camelcase: 'off',
		'comma-dangle': 'error',
		complexity: 'off',
		'constructor-super': 'error',
		'dot-notation': 'error',
		eqeqeq: ['error', 'smart'],
		'guard-for-in': 'off',
		'id-blacklist': 'off',
		'id-match': 'off',
		'import/order': 'off',
		'max-classes-per-file': 'off',
		'max-len': 'off',
		'new-parens': 'error',
		'no-bitwise': 'off',
		'no-caller': 'error',
		'no-console': 'error',
		'no-debugger': 'error',
		'no-eval': 'error',
		'no-new-wrappers': 'error',
		'no-throw-literal': 'error',
		'no-trailing-spaces': 'error',
		'no-undef-init': 'error',
		'no-unsafe-finally': 'error',
		'no-unused-expressions': 'error',
		'no-unused-labels': 'error',
		'no-var': 'error',
		'object-shorthand': 'error',
		'one-var': ['error', 'never'],
		'prefer-arrow/prefer-arrow-functions': 'off',
		'prefer-const': [
			'error',
			{
				destructuring: 'all'
			}
		],
		'quote-props': ['error', 'as-needed'],
		radix: 'off',
		'space-before-function-paren': [
			'error',
			{
				anonymous: 'always',
				named: 'never',
				asyncArrow: 'always'
			}
		],
		'spaced-comment': ['off', 'never'],
		'use-isnan': 'error',
		'valid-typeof': 'off',
		'@typescript-eslint/tslint/config': [
			'error',
			{
				rules: {
					'jsdoc-format': true,
					'no-reference-import': true
				}
			}
		],
		'@typescript-eslint/unbound-method': 'off',
		'@typescript-eslint/member-delimiter-style': [
			'error',
			{
				multiline: {
					delimiter: 'semi',
					requireLast: true
				},
				singleline: {
					delimiter: 'semi',
					requireLast: false
				}
			}
		],
		'@typescript-eslint/ban-ts-ignore': 'off',
		'@typescript-eslint/prefer-string-starts-ends-with': 'off',
		'@typescript-eslint/prefer-regexp-exec': 'off',
		'no-unused-expressions': 'off',
		'no-throw-literal': 'off',
		'@typescript-eslint/no-unused-vars': 'off',
		'import/no-unresolved': [2, { ignore: ['squirejs'] }],
		'import/no-cycle': [2, { maxDepth: 10 }],
		semi: ['error', 'always']
	}
};
