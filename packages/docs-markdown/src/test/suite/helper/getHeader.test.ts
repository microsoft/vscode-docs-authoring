/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chai from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { getHeadings } from '../../../helper/getHeader';
const expect = chai.expect;

suite('getHeadings', () => {
	test('Get heading', async () => {
		const filePath = resolve(
			__dirname,
			'../../../../../src/test/data/repo/articles/docs-markdown.md'
		);
		const content = readFileSync(filePath, 'utf8');
		const heading = getHeadings(content);
		expect(heading).to.equal('Docs Markdown Reference');
	});
});
