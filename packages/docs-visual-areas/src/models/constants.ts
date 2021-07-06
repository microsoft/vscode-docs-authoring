import * as vscode from 'vscode';

export const extensionShortName = 'docs-visual-areas';
export const extensionId = 'docs-msft.docs-visual-areas';
export const visualAreasSection = 'docs-visual-areas';

// export const timeout = async (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

export const isObjectEmpty = (o: any) => typeof o === 'object' && Object.keys(o).length === 0;

export const colors = [
	// { name: 'Yellow', value: '#f9e64f' },
	{ name: 'Blue', value: '#007fff' },
	{ name: 'Orange', value: '#ff3d00' },
	{ name: 'Green', value: '#42b883' },
	{ name: 'Yellow', value: '#F0EE22' },
	{ name: 'Light Blue', value: '#61dafb' }
];

export const fileTypes = ['markdown'];
