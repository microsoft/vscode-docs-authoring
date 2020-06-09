/* eslint-disable no-console */

import { window, ExtensionContext } from 'vscode';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AuthenticationContext } = require('adal-node');

const appConfig = {
	instance: 'https://login.microsoftonline.com',
	tenant: '72f988bf-86f1-41af-91ab-2d7cd011db47',
	clientId: '8c9f99a6-46e9-4da8-afdd-2abed9f07955',
	clientSecret: 'Fw8~oB9-1B-xbh5F8zlR6L_2A.t.txYUYY',
	resource: 'https://graph.microsoft.com'
};

export interface TokenResponse {
	_authority: string;
	_clientId: string;
	accessToken: string;
	expiresIn: number;
	expiresOn: Date;
	isMRRT: boolean;
	resource: string;
	tokenType: string;
}

export class Auth {
	context: ExtensionContext;
	authorityUrl = `${appConfig.instance}/${appConfig.tenant}`;
	constructor(context) {
		this.context = context;
	}
	getToken = async (): Promise<TokenResponse> => {
		const token: TokenResponse = this.context.globalState.get('token');
		const expiresTime = new Date().getTime() / 1000;
		if (!token || token.expiresIn < expiresTime) {
			const authContext = new AuthenticationContext(this.authorityUrl);
			return new Promise((resolve, reject) => {
				authContext.acquireTokenWithClientCredentials(
					appConfig.resource,
					appConfig.clientId,
					appConfig.clientSecret,
					async (err, tokenResponse: TokenResponse) => {
						if (err) {
							window.showErrorMessage(err);
							reject();
						} else {
							await this.saveToken(tokenResponse);
							resolve(token);
						}
					}
				);
			});
		}
		return Promise.resolve(token);
	};
	saveToken = async (token: TokenResponse) => {
		if (token) {
			await this.context.globalState.update('token', token);
		}
	};
}
