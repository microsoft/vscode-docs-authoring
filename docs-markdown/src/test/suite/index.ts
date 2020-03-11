import * as path from 'path';
import * as Mocha from 'mocha';
import * as glob from 'glob';

export function run(): Promise<void> {


	const NYC = require('nyc');

	// create an nyc instance, config here is the same as your package.json
	const nyc = new NYC({
		cwd: path.join(__dirname, '..', '..', '..'),
		include: [
			"**/**.js"
		],
		exclude: [
			"**/**.test.js"
		],
		reporter: ['text', 'html'],
		all: true,
		instrument: true,
		hookRequire: true,
		hookRunInContext: true,
		hookRunInThisContext: true,
		extension: [
			".ts",
			".tsx"
		],
		require: [
			"ts-node/register"
		],
		sourceMap: true
	});

	nyc.reset();
	nyc.wrap();


	// Create the mocha test
	const mocha = new Mocha({
		ui: 'tdd',
	});
	mocha.useColors(true);

	const testsRoot = path.resolve(__dirname, '..');

	return new Promise((c, e) => {
		glob('**/**.test.js', { cwd: testsRoot }, (err, files) => {
			if (err) {
				return e(err);
			}

			// Add files to the test suite
			files.forEach(f => mocha.addFile(path.resolve(testsRoot, f)));

			try {
				// Run the mocha test
				mocha.run(failures => {
					if (failures > 0) {
						e(new Error(`${failures} tests failed.`));
					} else {
						c();
					}
				});
			} catch (err) {
				console.error(err);
				e(err);
			} finally {
				if (nyc) {
					nyc.writeCoverageFile();
					nyc.report();
				}
			}
		});
	});


}
