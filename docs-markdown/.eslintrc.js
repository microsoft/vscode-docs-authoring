module.exports = {
  env: {
    browser: true,
    es6: true,
    node: true,
    mocha: true
  },
  extends: [
    "standard"
  ],
  globals: {
    Atomics: "readonly",
    SharedArrayBuffer: "readonly"
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: "module"
  },
  plugins: [
    "@typescript-eslint",
  ],
  rules: {
    "indent": "off",
    "no-unused-vars": 0,
    "prefer-promise-reject-errors": ["error", { "allowEmptyReject": true }],
    "space-before-function-paren": 0,
    "no-case-declarations": 0,
    "no-prototype-builtins": 0,
    "promise/param-names": 0,
    "no-var": 2,
    "no-useless-constructor": 0,
    "quotes": ["error", "double"],
    "no-cond-assign": 0
  }
}
