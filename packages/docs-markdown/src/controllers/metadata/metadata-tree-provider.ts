import * as vscode from 'vscode';
import { getAllEffectiveMetadata } from './metadata-controller';
import { MetadataTreeNode } from './metadata-tree-node';

export class MetadataTreeProvider implements vscode.TreeDataProvider<MetadataTreeNode> {
	private _onDidChangeTreeData: vscode.EventEmitter<
		MetadataTreeNode | undefined | null | void
	> = new vscode.EventEmitter<MetadataTreeNode | undefined | null | void>();
	// eslint-disable-next-line @typescript-eslint/member-ordering
	readonly onDidChangeTreeData: vscode.Event<MetadataTreeNode | undefined | null | void> = this
		._onDidChangeTreeData.event;

	constructor(private workspaceRoot: string) {}

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

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
}
