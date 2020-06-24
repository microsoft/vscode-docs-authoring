import { ExtensionContext, QuickPickItem, workspace } from 'vscode';
import Axios from 'axios';
import { TokenResponse, Auth } from './Auth';
import { output } from './output';

export class AllowList {
	context;
	locScopeItems: QuickPickItem[] = [];
	allowlist;
	token: TokenResponse;
	config = workspace.getConfiguration('markdown');
	allowlistUrl = this.config.get<string>('allowlistUrl');
	constructor(context: ExtensionContext) {
		this.context = context;
	}
	getAllowList = async () => {
		const auth = new Auth(this.context);
		this.token = this.context.globalState.get('token');
		const expiresTime = Math.round(new Date().getTime() / 1000);
		let promises: Promise<any>[] = [];
		if (!this.token) {
			promises = [auth.getToken()];
		}
		Promise.all(promises).then(() => {
			this.allowlist = this.context.globalState.get('allowlist');
			this.token = this.context.globalState.get('token');
			if (
				!this.allowlist ||
				(this.token &&
					this.token.expiresIn &&
					Math.round((new Date().getTime() + this.token.expiresIn * 1000) / 1000) < expiresTime)
			) {
				this.refreshAllowList(this.token);
			}
		});
	};
	saveAllowList = async allowlist => {
		if (allowlist) {
			await this.context.globalState.update('allowlist', allowlist);
		}
	};
	refreshAllowList = async (token: TokenResponse) => {
		const config = {
			headers: { Authorization: `Bearer ${token.accessToken}` }
		};
		try {
			const response = await Axios.get(this.allowlistUrl, config);
			// get products from response
			const products: string[] = [];
			Object.keys(response.data)
				.filter(x => x.startsWith('list:product'))
				.map((item: string) => {
					const set = item.split(':');
					if (set.length > 2) {
						products.push(set[2]);
						Object.keys(response.data[item].values).map((prod: string) =>
							// push the response products into the list of quickpicks.
							products.push(prod)
						);
					}
				});
			products.sort().map(item => {
				this.locScopeItems.push({
					label: item
				});
			});
			this.locScopeItems.push({
				label: 'other'
			});
			this.locScopeItems.push({
				label: 'third-party'
			});
			await this.saveAllowList(this.locScopeItems);
		} catch (error) {
			output.appendLine(error);
		}

		return this.locScopeItems;
	};
}
