import * as chai from 'chai';
import * as spies from 'chai-spies';
import { deactivate } from '../../extension';
import { sleep, sleepTime } from '../test.common/common';

chai.use(spies);
const expect = chai.expect;

suite('Extension.ts tests', () => {
	test('deactivate', () => {
		const spy = chai.spy(deactivate);
		deactivate();
		sleep(sleepTime);
		expect(spy).to.be.have.been.called;
	});
});
