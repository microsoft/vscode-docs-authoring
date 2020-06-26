import * as chai from 'chai';
import * as spies from 'chai-spies';
import { deactivate, installedExtensionsCheck, setupAutoComplete } from '../../extension';
import { sleep, sleepTime } from '../test.common/common';

chai.use(spies);
const expect = chai.expect;

suite('Extension.ts tests', () => {
	test('installedExtensionsCheck', () => {
		const spy = chai.spy(installedExtensionsCheck);
		installedExtensionsCheck();
		sleep(sleepTime);
		expect(spy).to.be.have.been.called;
	});
	test('setupAutoComplete', () => {
		const spy = chai.spy(setupAutoComplete);
		setupAutoComplete();
		sleep(sleepTime);
		expect(spy).to.be.have.been.called;
	});
	test('deactivate', () => {
		const spy = chai.spy(deactivate);
		deactivate();
		sleep(sleepTime);
		expect(spy).to.be.have.been.called;
	});
});
