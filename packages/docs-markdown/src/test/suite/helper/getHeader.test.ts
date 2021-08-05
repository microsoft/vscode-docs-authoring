/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chai from 'chai';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { getHeadings } from '../../../helper/getHeader';
const expect = chai.expect;

suite('getHeadings', () => {
	test('Get single heading - explicit array value', async () => {
		const filePath = resolve(__dirname, '../../../../../src/test/data/repo/articles/bookmark.md');
		const content = readFileSync(filePath, 'utf8');
		const heading = getHeadings(content);
		expect(heading[0]).to.equal('# This is a bookmark page');
	});
	test('Get single heading', async () => {
		const filePath = resolve(__dirname, '../../../../../src/test/data/repo/articles/bookmark.md');
		const content = readFileSync(filePath, 'utf8');
		const heading = getHeadings(content);
		expect(heading).to.deep.equal(['# This is a bookmark page']);
	});
	test('Get muliple headings - 1-6', async () => {
		const filePath = resolve(__dirname, '../../../../../src/test/data/repo/articles/bookmark-2.md');
		const content = readFileSync(filePath, 'utf8');
		const heading = getHeadings(content);
		expect(heading).to.deep.equal([
			'# This is a bookmark page',
			'## Bookmark H2',
			'### Bookmark H3',
			'#### Bookmark H4',
			'##### Bookmark H5',
			'###### Bookmark H6'
		]);
	});
});
