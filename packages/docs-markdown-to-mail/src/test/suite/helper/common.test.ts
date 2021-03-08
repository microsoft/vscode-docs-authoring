/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chai from 'chai';
import { updateSiteRelativeLinks } from '../../../helper/common';

const expect = chai.expect;

suite('Common', () => {
	test('Site-relative links', async () => {
		const siteRelativeLink = updateSiteRelativeLinks(
			'[link text](/help/contribute/validation-ref/alt-text-bad-value)'
		);
		expect(siteRelativeLink).to.equal(
			'[link text](https://review.docs.microsoft.com/help/contribute/validation-ref/alt-text-bad-value)'
		);
	});
});
