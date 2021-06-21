import { Event, EventEmitter, TreeDataProvider, TreeItem, window, workspace } from 'vscode';
import { naturalLanguageCompare } from '../../helper/common';
import { DocFxFileInfo, readDocFxJson } from './docfx-file-parser';
import { MetadataCategory } from './metadata-category';
import { getAllEffectiveMetadata } from './metadata-controller';
import { MetadataTreeNode } from './metadata-tree-node';

export class MetadataTreeProvider implements TreeDataProvider<MetadataTreeNode> {
	private readonly parentNodes: MetadataTreeNode[] = [
		new MetadataTreeNode({ category: MetadataCategory.Required }),
		new MetadataTreeNode({ category: MetadataCategory.Optional })
	];

	private _onDidChangeTreeData: EventEmitter<
		MetadataTreeNode | undefined | null | void
	> = new EventEmitter<MetadataTreeNode | undefined | null | void>();
	// eslint-disable-next-line @typescript-eslint/member-ordering
	readonly onDidChangeTreeData: Event<MetadataTreeNode | undefined | null | void> = this
		._onDidChangeTreeData.event;

	refresh(): void {
		this._onDidChangeTreeData.fire();
	}

	getTreeItem(element: MetadataTreeNode): TreeItem {
		return element;
	}

	getChildren(element?: MetadataTreeNode): Thenable<MetadataTreeNode[]> {
		const editor = window.activeTextEditor;
		// Only show tree if it's a Markdown file.
		if (editor === undefined || editor.document.languageId !== 'markdown') return;

		let docFxFileInfo: DocFxFileInfo;
		const folder = workspace.getWorkspaceFolder(editor.document.uri);
		if (folder) {
			// Read the DocFx.json file, search for metadata defaults.
			docFxFileInfo = readDocFxJson(folder.uri.fsPath);
			if (!docFxFileInfo) {
				return;
			}
		}

		if (element) {
			const metadataEntries = getAllEffectiveMetadata(docFxFileInfo);
			const treeNodes = metadataEntries
				? metadataEntries // Sort alphabetically
						.sort((a, b) => naturalLanguageCompare(a.key, b.key))
						.map(treeNode => {
							return new MetadataTreeNode(treeNode);
						})
				: [];
			// Classify by category (required/optional).
			return Promise.resolve(treeNodes.filter(treeNode => treeNode.category === element.category));
		} else {
			// Root of tree.
			return Promise.resolve(this.parentNodes);
		}
	}
}
