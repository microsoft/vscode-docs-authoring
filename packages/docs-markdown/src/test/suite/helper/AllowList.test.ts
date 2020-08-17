import * as chai from 'chai';
import * as spies from 'chai-spies';
import sinon = require('sinon');
import { context } from '../../test.common/common';
import { AllowList } from '../../../helper/AllowList';
import { workspace, ConfigurationTarget, WorkspaceConfiguration } from 'vscode';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import Axios from 'axios';
chai.use(spies);

const expect = chai.expect;

suite('AllowList', () => {
	test('getAllowList to call Axios', () => {
		const getConfigurationStub = sinon.stub(workspace, 'getConfiguration');
		const workspaceConfiguration: WorkspaceConfiguration = {
			get: () => 'allowlistUrl',
			has: () => true,
			inspect: () => {
				return { key: '' };
			},
			update: () => Promise.resolve()
		};
		getConfigurationStub.onCall(0).returns(workspaceConfiguration);
		const data = ['allowlist'];
		const stubAxios = sinon.stub(Axios, 'get').returns(new Promise(r => r({ data })));

		const spy = chai.spy.on(Axios, 'get');

		const allowlist = new AllowList(context);
		allowlist.getAllowList().then(() => {
			expect(spy).to.have.been.called();
		});
		getConfigurationStub.restore();
		stubAxios.restore();
	});
});
