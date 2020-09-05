//
// PLEASE DO NOT MODIFY / DELETE UNLESS YOU KNOW WHAT YOU ARE DOING
//
// This file is providing the test runner to use when running extension tests.
// By default the test runner in use is Mocha based.
//
// You can provide your own test runner if you want to override it by exporting
// a function run(testRoot: string, clb: (error:Error) => void) that the extension
// host can call to run the tests. The test runner is expected to use console.log
// to report the results back to the caller. When the tests are finished, return
// a possible error to the callback or null if none.

import testRunner = require('vscode/lib/testrunner');

// You can directly control Mocha options by uncommenting the following lines
// See https://github.com/mochajs/mocha/wiki/Using-mocha-programmatically#set-options for more info
const opts = {
	reporterOptions: {
		mochaFile: './test-results-mocha.xml'
	},
	ui: 'bdd', // the BDD UI is being used in extension.test.ts (describe, it, should)
	useColors: true // colored output from test results,
};

if (process.env.SYSTEM_TEAMPROJECTID) {
	Object.defineProperties(opts, {
		reporter: {
			value: 'mocha-junit-reporter',
			writable: true
		}
	});
}

testRunner.configure(opts);

module.exports = testRunner;
