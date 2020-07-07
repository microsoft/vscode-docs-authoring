import * as chai from 'chai';
import sinon = require('sinon');
import { context, tokenResponse } from '../../test.common/common';
import { workspace } from 'vscode';
import { Auth, TokenResponse } from '../../../helper/Auth';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AuthenticationContext } = require('adal-node');

const expect = chai.expect;
suite('Auth', () => {
	test('getToken returns TokenResponse', () => {
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
		const authenticationContextStub = sinon
			.stub(AuthenticationContext.prototype, 'acquireTokenWithClientCredentials')
			.yields(null, tokenResponse);
		const auth = new Auth(context);
		auth.getToken().then(token => {
			expect(token).to.deep.equal(tokenResponse);
		});
		authenticationContextStub.restore();
		getConfigurationStub.restore();
	});
});
