import {
	CancellationToken,
	Event,
	ProviderResult,
	TreeDataProvider,
	TreeItem,
	TreeItemCollapsibleState
} from 'vscode';
import { getAllEffectiveMetadata } from '../metadata-controller';
import { MetadataSource } from '../metadata-source';
import { MetadataTreeNode } from '../metadata-tree-node';

const toSourceString = (source: MetadataSource): string => {
	switch (source) {
		case MetadataSource.FileMetadata:
			return 'docfx.json/fileMetadata';
		case MetadataSource.FrontMatter:
			return 'file metadata/front matter';
		case MetadataSource.GlobalMetadata:
			return 'docfx.json/globalMetadata';

		default:
			return '';
	}
};

const toLabel = (element: MetadataTreeNode): string | null => {
	if (!element) {
		return null;
	}

	const source = toSourceString(element.source);
	return `${element.key}: ${element.value} (${source})`;
};

export class MetadataTreeDataProvider implements TreeDataProvider<MetadataTreeNode> {
	onDidChangeTreeData?: Event<void | MetadataTreeNode>;

	getTreeItem(element: MetadataTreeNode): TreeItem | Thenable<TreeItem> {
		const label = toLabel(element);
		const treeItem = new TreeItem(label, TreeItemCollapsibleState.Expanded);

		return treeItem;
	}

	getChildren(element?: MetadataTreeNode): ProviderResult<MetadataTreeNode[]> {
		const allMetadata = getAllEffectiveMetadata();
		return allMetadata;
	}

	getParent?(element: MetadataTreeNode): ProviderResult<MetadataTreeNode> {
		throw new Error('Method not implemented.');
	}

	resolveTreeItem?(
		item: TreeItem,
		element: MetadataTreeNode,
		token: CancellationToken
	): ProviderResult<TreeItem> {
		throw new Error('Method not implemented.');
	}
}
