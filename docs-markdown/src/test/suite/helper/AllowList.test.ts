import * as chai from 'chai';
import * as spies from 'chai-spies';
import sinon = require('sinon');
import { context, tokenResponse } from '../../test.common/common';
import { Auth } from '../../../helper/Auth';
import { AllowList } from '../../../helper/AllowList';
import { workspace } from 'vscode';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AuthenticationContext } = require('adal-node');
import Axios from 'axios';
chai.use(spies);

const expect = chai.expect;

suite('AllowList', () => {
	test('getAllowList to call Axios', () => {
		const getConfigurationStub = sinon.stub(workspace, 'getConfiguration');
		getConfigurationStub.onCall(0).returns({
			get: () => 'tenant'
		});
		getConfigurationStub.onCall(1).returns({
			get: () => 'clientId'
		});
		getConfigurationStub.onCall(2).returns({
			get: () => 'clientSecret'
		});
		getConfigurationStub.onCall(3).returns({
			get: () => 'resource'
		});
		getConfigurationStub.onCall(4).returns({
			get: () => 'allowlistUrl'
		});

		const authenticationContextStub = sinon
			.stub(AuthenticationContext.prototype, 'acquireTokenWithClientCredentials')
			.yields(null, tokenResponse);
		const spy = chai.spy.on(Axios, 'get');

		const allowlist = new AllowList(context);
		allowlist.getAllowList().then(() => {
			expect(spy).to.have.been.called();
		});
		getConfigurationStub.restore();
		authenticationContextStub.restore();
	});
});
