/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as chai from 'chai';
import { logRepoData } from '../../../helper/github';

const expect = chai.expect;

suite('Github', () => {
	test('Log repo data', async () => {
		const spy = chai.spy(logRepoData);
		logRepoData();
		expect(spy).to.be.have.been.called;
	});
});
