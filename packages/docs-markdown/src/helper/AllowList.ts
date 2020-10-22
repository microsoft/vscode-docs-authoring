import { ExtensionContext, QuickPickItem, workspace } from 'vscode';
import Axios from 'axios';
import { output } from './output';

export class AllowList {
	context;
	allowlist;
	config = workspace.getConfiguration('markdown');
	allowlistUrl = this.config.get<string>('allowlistUrl');
	constructor(context: ExtensionContext) {
		this.context = context;
	}
	getAllowList = async () => {
		this.allowlist = this.context.globalState.get('allowlist');
		if (!this.allowlist) {
			await this.refreshAllowList();
		}
	};
	refreshAllowList = async () => {
		try {
			const response = await Axios.get(this.allowlistUrl);
			await this.buildAllowList(response);
		} catch (error) {
			output.appendLine(error);
		}
	};
	getMsServiceSubServiceList = allowlist => {
		// get products from response
		const msServices: any[] = this.getRestrictedList(allowlist, 'ms.service');
		return msServices;
	};
	getMsProdTechnologyList = allowlist => {
		// get products from response
		const msProds: any[] = this.getRestrictedList(allowlist, 'ms.prod');
		return msProds;
	};
	getProductList = allowlist => {
		// get products from response
		const productQuickPick: QuickPickItem[] = this.getProductQuickPick(allowlist, 'product');
		productQuickPick.push({
			label: 'other'
		});
		productQuickPick.push({
			label: 'third-party'
		});

		return productQuickPick;
	};
	getMsProdList = allowlist => {
		const msProdQuickPick: QuickPickItem[] = this.getRootAllowListQuickPick(allowlist, 'ms.prod');
		return msProdQuickPick;
	};
	getServiceList = allowlist => {
		const serviceQuickPick: QuickPickItem[] = this.getRootAllowListQuickPick(
			allowlist,
			'ms.service'
		);
		return serviceQuickPick;
	};
	getTechnologyList = allowlist => {
		const msTechnologyQuickPick: QuickPickItem[] = this.getAllowListQuickPick(allowlist, 'ms.prod');
		return msTechnologyQuickPick;
	};
	getSubServiceList = allowlist => {
		const subServiceQuickPick: QuickPickItem[] = this.getAllowListQuickPick(
			allowlist,
			'ms.service'
		);
		return subServiceQuickPick;
	};
	private getRestrictedList(allowlist: any, type: string) {
		const msProds: any[] = [];
		Object.keys(allowlist)
			.filter(x => x.startsWith(type))
			.forEach((item: string) => {
				switch (item) {
					case 'ms.prod':
						allowlist[item].forEach(prod => msProds.push(prod.msTechnology));
						break;
					case 'ms.service':
						allowlist[item].forEach(prod => msProds.push(prod.msSubService));
						break;
				}
			});
		return msProds;
	}
	private getProductQuickPick(allowlist: any, type: string) {
		const items = new Set();
		const quickPick: QuickPickItem[] = [];
		Object.keys(allowlist)
			.filter(x => x.startsWith(type))
			.forEach((item: string) => {
				allowlist[item].forEach(prod => {
					items.add(prod.slug);
				});
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
				switch (item) {
					case 'ms.prod':
						allowlist[item].forEach(prod => items.add(prod.msProduct));
						break;
					case 'ms.service':
						allowlist[item].forEach(prod => items.add(prod.msService));
						break;
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
	private getRootAllowListQuickPick(allowlist: any, type: string) {
		const items = new Set();
		const quickPick: QuickPickItem[] = [];
		Object.keys(allowlist)
			.filter(x => x.startsWith(type))
			.forEach((item: string) => {
				switch (item) {
					case 'ms.prod':
						allowlist[item].forEach(prod => items.add(prod.msProduct));
						break;
					case 'ms.service':
						allowlist[item].forEach(prod => items.add(prod.msService));
						break;
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
