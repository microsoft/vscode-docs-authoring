/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chai from 'chai';
import { cleanupDownloadFiles } from '../../../helper/cleanup';

const expect = chai.expect;

suite('Cleanup', () => {
	test('Cleanup downloaded files', async () => {
		const spy = chai.spy(cleanupDownloadFiles);
		cleanupDownloadFiles(true);
		expect(spy).to.be.have.been.called;
	});
});
