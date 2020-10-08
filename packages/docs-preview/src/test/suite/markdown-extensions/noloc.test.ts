import * as chai from 'chai';
import { inline_plugin } from '../../../helper/common';
import { nolocOptions } from '../../../markdown-extensions/noloc';
const expect = chai.expect;

suite('NoLoc Extension', () => {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const md = require('markdown-it')().use(inline_plugin, 'no-loc', nolocOptions);
	test('noloc text', async () => {
		const result = md.render(`:::no-loc text="what do you want?":::`);
		expect(result).to.equal('<p>what do you want?</p>\n');
	});
});
