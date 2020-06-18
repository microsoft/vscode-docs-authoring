import { ExtensionContext, QuickPickItem } from 'vscode';
import Axios from 'axios';
import { TokenResponse } from './Auth';

export class AllowList {
	context;
	locScopeItems: QuickPickItem[] = [];
	constructor(context: ExtensionContext) {
		this.context = context;
	}
	getAllowList = async () => {
		const allowlist = this.context.globalState.get('allowlist');
		if (!allowlist) {
			// if user is inside :::image::: tag, then ask them for quickpick of products based on allow list
			// call allowlist with API Auth Token
			// you will need auth token to call list
			const token: TokenResponse = this.context.globalState.get('token');
			const config = {
				headers: { Authorization: `Bearer ${token.accessToken}` }
			};
			const response = await Axios.get(
				'https://docsvalidation.azurefd.net/validation/allowlists',
				config
			);
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
			return this.locScopeItems;
		}
	};
	saveAllowList = async allowlist => {
		if (allowlist) {
			await this.context.globalState.update('allowlist', allowlist);
		}
	};
}
