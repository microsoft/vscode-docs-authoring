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

interface AppConfig {
	instance: string;
	tenant: string;
	clientId: string;
	clientSecret: string;
	resource: string;
}

export class Auth {
	context: ExtensionContext;
	config = workspace.getConfiguration('appConfig');

	appConfig = this.config.get<AppConfig>('appConfig');
	authorityUrl = `${this.appConfig.instance}/${this.appConfig.tenant}`;
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
					this.appConfig.resource,
					this.appConfig.clientId,
					this.appConfig.clientSecret,
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
