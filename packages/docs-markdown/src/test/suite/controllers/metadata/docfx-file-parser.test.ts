import * as chai from 'chai';
import * as spies from 'chai-spies';
import * as common from '../../../../helper/common';
import { resolve } from 'path';
import { readDocFxJson } from '../../../../controllers/metadata/docfx-file-parser';
import { DocFxMetadata } from '../../../../controllers/metadata/docfx-metadata';

chai.use(spies);
const expect = chai.expect;

suite('docfx-file-parser.ts', () => {
	// Reset and tear down the spies
	teardown(() => {
		chai.spy.restore(common);
	});

	test('readDocFxJson() correctly caches file', () => {
		// Spy on the parsing of the JSON file, it should only be called once.
		const spy = chai.spy.on(common, 'tryFindFile');

		const filePath = resolve(__dirname, '../../../../../src/test/data/repo/docfx.json');
		let docFxMetadata: DocFxMetadata = readDocFxJson(filePath);

		expect(spy).to.have.been.called();
		docFxMetadata = readDocFxJson(filePath);

		// It should have been cached, and only called once.
		expect(spy).to.have.been.called.once;
	});
});
