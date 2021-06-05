import * as vscode from 'vscode';
import { getAllEffectiveMetadata } from './metadata-controller';
import { MetadataTreeNode } from './metadata-tree-node';
import { MetadataCategory } from './metadata-category';
import { naturalLanguageCompare } from '../../helper/common';

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
			const treeNodes = this.getTreeNodes();
			// Classify by category (required/optional).
			if (element.category === MetadataCategory.Required) {
				return Promise.resolve(
					treeNodes.filter(treeNode => treeNode.category === MetadataCategory.Required)
				);
			} else if (element.category === MetadataCategory.Optional) {
				return Promise.resolve(
					treeNodes.filter(treeNode => treeNode.category === MetadataCategory.Optional)
				);
			}
		} else {
			// Root of tree.
			return Promise.resolve(this.getParentNodes());
		}
	}

	private getParentNodes(): MetadataTreeNode[] {
		const data: MetadataTreeNode[] = [
			new MetadataTreeNode({ category: MetadataCategory.Required }),
			new MetadataTreeNode({ category: MetadataCategory.Optional })
		];

		return data;
	}

	private getTreeNodes(): MetadataTreeNode[] {
		const metadataEntries = getAllEffectiveMetadata();
		// Sort alphabetically.
		metadataEntries.sort((a, b) => naturalLanguageCompare(a.key, b.key));
		const treeNodes: MetadataTreeNode[] = new Array(metadataEntries.length);

		// Convert to tree nodes.
		for (let index = 0; index < metadataEntries.length; index++) {
			treeNodes[index] = new MetadataTreeNode({
				category: metadataEntries[index].category,
				source: metadataEntries[index].source,
				key: metadataEntries[index].key,
				value: metadataEntries[index].value
			});
		}

		return treeNodes;
	}
}
