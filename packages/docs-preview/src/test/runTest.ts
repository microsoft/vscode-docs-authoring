import * as path from 'path';

import { runTests } from 'vscode-test';

async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`

		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// The path to test runner
		// Passed to --extensionTestsPath
		const extensionTestsPath = path.resolve(__dirname, './suite/index-coverage');

		// the path to the test data repo
		// Passed to --launchArgs
		const repoPath = path.resolve(__dirname, '../../../src/test/data/repo');

		// Download VS Code, unzip it and run the integration test
		await runTests({
			extensionDevelopmentPath,
			extensionTestsPath,
			launchArgs: [repoPath]
		});
	} catch (err) {
		// eslint-disable-next-line no-console
		console.error('Failed to run tests');
		process.exit(1);
	}
}

main();
