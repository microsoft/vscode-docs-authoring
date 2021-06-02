/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chai from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { getHeadings } from '../../../helper/getHeader';
const expect = chai.expect;

suite('getHeadings', () => {
	test('Get heading', async () => {
		const filePath = resolve(__dirname, '../../../../../src/test/data/repo/articles/bookmark.md');
		const content = readFileSync(filePath, 'utf8');
		const heading = getHeadings(content);
		expect(heading[0]).to.equal('# This is a bookmark page');
	});
});
