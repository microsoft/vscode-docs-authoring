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

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: MetadataTreeNode): vscode.TreeItem {
		return element;
	}

	getChildren(element?: MetadataTreeNode): Thenable<MetadataTreeNode[]> {
		if (element) {
			const treeNodes = this.getTreeNodes();
			// Classify by category (required/optional).
			return Promise.resolve(treeNodes.filter(treeNode => treeNode.category === element.category));
		} else {
			// Root of tree.
			return Promise.resolve(this.getParentNodes());
		}
	}

	private getParentNodes(): MetadataTreeNode[] {
		return [
			new MetadataTreeNode({ category: MetadataCategory.Required }),
			new MetadataTreeNode({ category: MetadataCategory.Optional })
		];
	}

	private getTreeNodes(): MetadataTreeNode[] {
		const metadataEntries = getAllEffectiveMetadata();
		// Sort alphabetically.
		return metadataEntries
			.sort((a, b) => naturalLanguageCompare(a.key, b.key))
			.map(treeNode => {
				return new MetadataTreeNode(treeNode);
			});
	}
}
