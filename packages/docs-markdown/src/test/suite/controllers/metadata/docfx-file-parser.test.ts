import * as chai from 'chai';
import { resolve } from 'path';
import { DocFxFileInfo, readDocFxJson } from '../../../../controllers/metadata/docfx-file-parser';

const expect = chai.expect;

suite('docfx-file-parser.ts', () => {
	test('readDocFxJson()', () => {
		const filePath = resolve(__dirname, '../../../../../src/test/data/repo/docfx.json');
		const docFxMetadata: DocFxFileInfo = readDocFxJson(filePath);

		expect(docFxMetadata).to.not.be.false;
		expect(docFxMetadata).to.not.be.null;
		expect(docFxMetadata).to.not.be.undefined;
	});
});
