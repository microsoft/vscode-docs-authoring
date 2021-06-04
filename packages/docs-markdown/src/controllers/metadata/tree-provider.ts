import * as vscode from 'vscode';
import {
	MetadataTreeNode,
	MetadataSource,
	MetadataType,
	getAllEffectiveMetadata
} from 'metadata-controller';

export class MetadataTreeProvider implements vscode.TreeDataProvider<MetadataTreeNode> {
	constructor(private workspaceRoot: string) {}

	getTreeItem(element: MetadataTreeNode): vscode.TreeItem {
		return element;
	}

	getChildren(element?: MetadataTreeNode): Thenable<MetadataTreeNode[]> {
		if (!this.workspaceRoot) {
			vscode.window.showInformationMessage('No metadata in empty workspace');
			return Promise.resolve([]);
		}

		if (element) {
			// None have children.
			return Promise.resolve([]);
		} else {
			// Root of tree.
			return Promise.resolve(getAllEffectiveMetadata());
		}
	}

	/**
	 * Get the metadata for the current file.
	 */
	private getMetadata(): MetadataTreeNode[] {
		return this.stub();
	}

	private stub(): MetadataEntry[] {
		//const data: MetadataEntry[] = new Array(3);
		const data: MetadataEntry[] = [
			new MetadataEntry(MetadataSource.FrontMatter, 'ms.author', `gewarren`),
			new MetadataEntry(MetadataSource.FileMetadata, 'ms.topic', `conceptual`),
			new MetadataEntry(MetadataSource.GlobalMetadata, 'ms.prod', `dotnet`)
		];

		return data;
	}
}

class MetadataEntry extends vscode.TreeItem {
	constructor(public source: MetadataSource, public key: MetadataType, public value: string) {
		super(`${key}: ${value}`, vscode.TreeItemCollapsibleState.None);
		const prettySource =
			source === MetadataSource.FrontMatter
				? 'YAML header'
				: source === MetadataSource.FileMetadata
				? 'docfx.json fileMetadata'
				: 'docfx.json globalMetadata';
		this.description = `(${prettySource})`;
		this.tooltip = `${this.key}: ${this.value} (from ${prettySource})`;
	}

	// iconPath = {
	//   light: path.join(__filename, '..', '..', 'resources', 'light', 'MetadataEntry.svg'),
	//   dark: path.join(__filename, '..', '..', 'resources', 'dark', 'MetadataEntry.svg')
	// };
}
