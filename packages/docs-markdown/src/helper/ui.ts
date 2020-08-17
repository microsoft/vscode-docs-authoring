'use-strict';

import { StatusBarAlignment, StatusBarItem, window, workspace } from 'vscode';
import { checkExtension } from '../helper/common';
import { output } from '../helper/output';

export class UiHelper {
	public LoadToolbar() {
		// toolbar only renders if markdown.showToolbar is true in user settings
		if (workspace.getConfiguration('markdown').showToolbar) {
			try {
				this.uiMessage();
				if (checkExtension('docsmsft.docs-article-templates')) {
					this.uiTemplate();
					this.uiCleanup();
				}
				this.uiBold();
				this.uiItalic();
				this.uiCode();
				this.uiAlert();
				this.uiNumberedList();
				this.uiBulletedList();
				this.uiNewTable();
				this.uiLink();
				this.uiImage();
				this.uiInclude();
				this.uiSnippet();
				// this returns false until an activation event is initiated.
				if (!checkExtension('docsmsft.docs-preview')) {
					this.uiPreview();
				}
			} catch (error) {
				output.appendLine('Failed to load UI: ' + error);
			}
		}
	}

	private uiMessage() {
		const statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
		statusBarItem.text = 'Docs Markdown';
		statusBarItem.color = 'white';
		statusBarItem.tooltip = 'Show quick pick (Alt + M / Option + M)';
		statusBarItem.show();
		statusBarItem.command = 'markdownQuickPick';
	}

	private uiLink() {
		const statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
		statusBarItem.text = '$(link)';
		statusBarItem.color = 'white';
		statusBarItem.tooltip = 'Insert Link';
		statusBarItem.show();
		statusBarItem.command = 'selectLinkTypeToolbar';
	}

	private uiImage() {
		const statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
		statusBarItem.text = '$(file-media)';
		statusBarItem.color = 'white';
		statusBarItem.tooltip = 'Insert Image';
		statusBarItem.show();
		statusBarItem.command = 'pickImageType';
	}

	private uiInclude() {
		const statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
		statusBarItem.text = '$(clippy)';
		statusBarItem.color = 'white';
		statusBarItem.tooltip = 'Insert Include';
		statusBarItem.show();
		statusBarItem.command = 'insertInclude';
	}

	private uiSnippet() {
		const statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
		statusBarItem.text = '$(file-code)';
		statusBarItem.color = 'white';
		statusBarItem.tooltip = 'Insert Snippet';
		statusBarItem.show();
		statusBarItem.command = 'insertSnippet';
	}

	private uiBold() {
		const statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
		statusBarItem.text = 'B';
		statusBarItem.color = 'white';
		statusBarItem.tooltip = 'Bold';
		statusBarItem.show();
		statusBarItem.command = 'formatBold';
	}

	private uiItalic() {
		const statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
		statusBarItem.text = 'i';
		statusBarItem.color = 'white';
		statusBarItem.tooltip = 'Italic';
		statusBarItem.show();
		statusBarItem.command = 'formatItalic';
	}

	private uiCode() {
		const statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
		statusBarItem.text = '$(code)';
		statusBarItem.color = 'white';
		statusBarItem.tooltip = 'Code';
		statusBarItem.show();
		statusBarItem.command = 'formatCode';
	}

	private uiAlert() {
		const statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
		statusBarItem.text = '$(alert)';
		statusBarItem.color = 'white';
		statusBarItem.tooltip = 'Alert';
		statusBarItem.show();
		statusBarItem.command = 'insertAlert';
	}

	private uiNewTable() {
		const statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
		statusBarItem.text = '$(diff-added)';
		statusBarItem.color = 'white';
		statusBarItem.tooltip = 'Insert Table';
		statusBarItem.show();
		statusBarItem.command = 'insertTable';
	}

	private uiNumberedList() {
		const statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
		statusBarItem.text = '$(list-ordered)';
		statusBarItem.color = 'white';
		statusBarItem.tooltip = 'Numbered List';
		statusBarItem.show();
		statusBarItem.command = 'insertNumberedList';
	}

	private uiBulletedList() {
		const statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
		statusBarItem.text = '$(list-unordered)';
		statusBarItem.color = 'white';
		statusBarItem.tooltip = 'Bulleted List';
		statusBarItem.show();
		statusBarItem.command = 'insertBulletedList';
	}

	private uiPreview() {
		const statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
		statusBarItem.text = '$(browser)';
		statusBarItem.color = 'white';
		statusBarItem.tooltip = 'Preview';
		statusBarItem.show();
		statusBarItem.command = 'previewTopic';
	}

	private uiTemplate() {
		const statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
		statusBarItem.text = '$(file-text)';
		statusBarItem.color = 'white';
		statusBarItem.tooltip = 'Template';
		statusBarItem.show();
		statusBarItem.command = 'applyTemplate';
	}

	private uiCleanup() {
		const statusBarItem: StatusBarItem = window.createStatusBarItem(StatusBarAlignment.Left);
		statusBarItem.text = '$(tasklist)';
		statusBarItem.color = 'white';
		statusBarItem.tooltip = 'Cleanup...';
		statusBarItem.show();
		statusBarItem.command = 'applyCleanup';
	}
}
