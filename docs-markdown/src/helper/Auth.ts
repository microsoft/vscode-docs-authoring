/* eslint-disable no-console */

import { window, ExtensionContext, workspace } from 'vscode';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { AuthenticationContext } = require('adal-node');

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
	config = workspace.getConfiguration('markdown');
	instance = 'https://login.microsoftonline.com';
	tenant = this.config.get<string>('tenant');
	clientId = this.config.get<string>('clientId');
	clientSecret = this.config.get<string>('clientSecret');
	resource = 'https://graph.microsoft.com';
	authorityUrl = `${this.instance}/${this.tenant}`;
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
					this.resource,
					this.clientId,
					this.clientSecret,
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
