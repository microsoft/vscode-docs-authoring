import { window, workspace, QuickPickItem } from 'vscode';
import { noActiveEditorMessage } from '../../helper/common';
import { search } from '../../helper/utility';
import { getSubDirectories, getOpenPublishingFile } from './utilities';

// finds the directories to search, passes this and the search term to the search function.
export async function searchRepo() {
	const editor = window.activeTextEditor;
	let folderPath: string = '';

	if (!editor) {
		noActiveEditorMessage();
		return;
	}

	if (workspace.workspaceFolders) {
		folderPath = workspace.workspaceFolders[0].uri.fsPath;
	}

	const selected = editor.selection;
	// There are two kinds of repo searching, whole repo, and scoped folder (both recursive)
	const scopeOptions: QuickPickItem[] = [];

	scopeOptions.push({ label: 'Full Search', description: 'Look in all directories for snippet' });
	scopeOptions.push({
		label: 'Scoped Search',
		description: 'Look in specific directories for snippet'
	});
	scopeOptions.push({
		label: 'Cross-Repository Reference',
		description: 'Reference GitHub repository'
	});

	const selection = await window.showQuickPick(scopeOptions);
	if (!selection) {
		return;
	}
	const searchSelection = selection.label;

	switch (searchSelection) {
		case 'Full Search':
			await search(editor, selected, folderPath);
			break;
		case 'Scoped Search':
			// gets all subdirectories to populate the scope search function.
			let subDirectories: string[] = [];
			subDirectories = getSubDirectories(
				folderPath,
				['.git', '.github', '.vscode', '.vs', 'node_module', 'media', 'breadcrumb', 'includes'],
				subDirectories
			);

			const dirOptions: QuickPickItem[] = [];

			subDirectories.forEach(subDir => {
				dirOptions.push({ label: subDir, description: 'sub directory' });
			});

			const directory = await window.showQuickPick(dirOptions);
			if (directory) {
				search(editor, selected, directory.label);
			}
			break;
		default:
			if (workspace) {
				if (workspace.workspaceFolders) {
					const repoRoot = workspace.workspaceFolders[0].uri.fsPath;
					// get openpublishing.json at root
					const openPublishingRepos = await getOpenPublishingFile(repoRoot);
					if (openPublishingRepos) {
						const openPublishingOptions: QuickPickItem[] = [];

						openPublishingRepos.map((repo: { path_to_root: string; url: string }) => {
							openPublishingOptions.push({ label: repo.path_to_root, description: repo.url });
						});
						window.showQuickPick(openPublishingOptions).then(repo => {
							if (repo) {
								search(editor, selected, '', '', repo.label);
							}
						});
					}
				}
			}
			break;
	}
}
