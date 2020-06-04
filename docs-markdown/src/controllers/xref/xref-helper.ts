import { QuickPickItem, window } from 'vscode';
import { getAsync } from '../../helper/http-helper';
const rootUrl: string = 'https://xref.docs.microsoft.com';

export async function getXrefDisplayProperty() {
	const items: QuickPickItem[] = [];
	items.push({
		description: 'None (default)',
		label: 'none'
	});
	items.push({
		description: 'Name with Type',
		label: 'nameWithType'
	});
	items.push({
		description: 'Full Name',
		label: 'fullName'
	});
	return await window.showQuickPick(items, { placeHolder: 'Select Display Property' });
}

export async function getXrefSelection() {
	const items: QuickPickItem[] = [];
	const uid: string | undefined = await window.showInputBox({
		placeHolder: 'Enter XREF Search Term'
	});
	if (!uid) {
		return;
	}
	const response = await getAsync(`${rootUrl}/autocomplete?text=${uid}`);
	if (response.status !== 200) {
		window.showErrorMessage(
			'Failed to connect to XREF service. Please check your internet connection and try again.'
		);
		return;
	}
	if (response.data.length === 0) {
		window.showErrorMessage(`No results found for "${uid}". Please check your search term.`);
		return;
	}
	response.data.map((item: { tags: any; uid: string }) => {
		items.push({
			label: item.uid
		});
	});
	return await window.showQuickPick(items, { placeHolder: 'Link to XREF' });
}
