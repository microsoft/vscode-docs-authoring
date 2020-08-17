import { ExtensionContext, QuickPickItem, workspace } from 'vscode';
import Axios from 'axios';
import { TokenResponse, Auth } from './Auth';
import { output } from './output';

export class AllowList {
	context;
	allowlist;
	token: TokenResponse;
	config = workspace.getConfiguration('markdown');
	allowlistUrl = this.config.get<string>('allowlistUrl');
	constructor(context: ExtensionContext) {
		this.context = context;
	}
	getAllowList = async () => {
		this.token = this.context.globalState.get('token');
		const currentDate = new Date();
		if (
			!this.token ||
			(this.token && this.token.expiresOn && new Date(this.token.expiresOn) < currentDate)
		) {
			await this.forceRefreshAllowList();
		} else {
			this.allowlist = this.context.globalState.get('allowlist');
			if (!this.allowlist) {
				await this.refreshAllowList(this.token);
			}
		}
	};
	forceRefreshAllowList = async () => {
		const auth = new Auth(this.context);
		auth.getToken().then(async token => {
			await this.refreshAllowList(token);
		});
	};
	refreshAllowList = async (token: TokenResponse) => {
		const config = {
			headers: { Authorization: `Bearer ${token.accessToken}` }
		};
		try {
			const response = await Axios.get(this.allowlistUrl, config);
			await this.buildAllowList(response);
		} catch (error) {
			output.appendLine(error);
		}
	};
	getMsServiceSubServiceList = allowlist => {
		// get products from response
		const msServices: any[] = this.getRestrictedList(allowlist, 'list:ms.service');
		return msServices;
	};
	getMsProdTechnologyList = allowlist => {
		// get products from response
		const msProds: any[] = this.getRestrictedList(allowlist, 'list:ms.prod');
		return msProds;
	};
	getProductList = allowlist => {
		// get products from response
		const productQuickPick: QuickPickItem[] = this.getProductQuickPick(allowlist, 'list:product');
		productQuickPick.push({
			label: 'other'
		});
		productQuickPick.push({
			label: 'third-party'
		});

		return productQuickPick;
	};
	getMsProdList = allowlist => {
		const msProdQuickPick: QuickPickItem[] = this.getRootAllowListQuickPick(
			allowlist,
			'list:ms.prod'
		);
		return msProdQuickPick;
	};
	getServiceList = allowlist => {
		const serviceQuickPick: QuickPickItem[] = this.getRootAllowListQuickPick(
			allowlist,
			'list:ms.service'
		);
		return serviceQuickPick;
	};
	getTechnologyList = allowlist => {
		const msTechnologyQuickPick: QuickPickItem[] = this.getAllowListQuickPick(
			allowlist,
			'list:ms.prod'
		);
		return msTechnologyQuickPick;
	};
	getSubServiceList = allowlist => {
		const subServiceQuickPick: QuickPickItem[] = this.getAllowListQuickPick(
			allowlist,
			'list:ms.service'
		);
		return subServiceQuickPick;
	};
	private getRestrictedList(allowlist: any, type: string) {
		const msProds: any[] = [];
		Object.keys(allowlist)
			.filter(x => x.startsWith(type))
			.forEach((item: string) => {
				msProds.push(allowlist[item]);
			});
		return msProds;
	}
	private getProductQuickPick(allowlist: any, type: string) {
		const items = new Set();
		const quickPick: QuickPickItem[] = [];
		Object.keys(allowlist)
			.filter(x => x.startsWith(type))
			.forEach((item: string) => {
				const set = item.split(':');
				if (set.length > 2) {
					items.add(set[2]);
					Object.keys(allowlist[item].values).forEach((prod: string) =>
						// push the response products into the list of quickpicks.
						items.add(prod)
					);
				}
			});
		Array.from(items)
			.sort()
			.forEach((item: string) => {
				if (item) {
					quickPick.push({
						label: item
					});
				}
			});
		return quickPick;
	}
	private getAllowListQuickPick(allowlist: any, type: string) {
		const items = new Set();
		const quickPick: QuickPickItem[] = [];
		Object.keys(allowlist)
			.filter(x => x.startsWith(type))
			.forEach((item: string) => {
				Object.keys(allowlist[item].values).forEach((prod: string) => items.add(prod));
			});
		Array.from(items)
			.sort()
			.forEach((item: string) => {
				if (item) {
					quickPick.push({
						label: item
					});
				}
			});
		return quickPick;
	}
	private getRootAllowListQuickPick(allowlist: any, type: string) {
		const items = new Set();
		const quickPick: QuickPickItem[] = [];
		Object.keys(allowlist)
			.filter(x => x.startsWith(type))
			.forEach((item: string) => {
				const set = item.split(':');
				if (set.length > 2) {
					items.add(set[2]);
				}
			});
		Array.from(items)
			.sort()
			.forEach((item: string) => {
				if (item) {
					quickPick.push({
						label: item
					});
				}
			});
		return quickPick;
	}

	private async buildAllowList(response) {
		await this.context.globalState.update('allowlist', response.data);
		const serviceList = this.getServiceList(response.data);
		await this.context.globalState.update('ms.service', serviceList);
		const productList = this.getProductList(response.data);
		await this.context.globalState.update('product', productList);
		const msProdList = this.getMsProdList(response.data);
		await this.context.globalState.update('ms.prod', msProdList);
		const technologyList = this.getTechnologyList(response.data);
		await this.context.globalState.update('ms.technology', technologyList);
		const subServiceList = this.getSubServiceList(response.data);
		await this.context.globalState.update('ms.subservice', subServiceList);
		const prodTechnology = this.getMsProdTechnologyList(response.data);
		await this.context.globalState.update('prodTechnology', prodTechnology);
		const serviceSubService = this.getMsServiceSubServiceList(response.data);
		await this.context.globalState.update('serviceSubService', serviceSubService);
	}
}
