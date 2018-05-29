import * as vscode from "vscode";
import MarkdownPreviewConfig from "./markdownPreviewConfig";

export default class PreviewConfigManager {
    private previewConfigurationsForWorkspaces = new Map<string, MarkdownPreviewConfig>();

    public loadAndCacheConfiguration(
        resource: vscode.Uri,
    ) {
        const config = MarkdownPreviewConfig.getConfigForResource(resource);
        this.previewConfigurationsForWorkspaces.set(this.getKey(resource), config);
        return config;
    }

    public shouldUpdateConfiguration(
        resource: vscode.Uri,
    ): boolean {
        const key = this.getKey(resource);
        const currentConfig = this.previewConfigurationsForWorkspaces.get(key);
        const newConfig = MarkdownPreviewConfig.getConfigForResource(resource);
        return (!currentConfig || !currentConfig.isEqualTo(newConfig));
    }

    private getKey(
        resource: vscode.Uri,
    ): string {
        const folder = vscode.workspace.getWorkspaceFolder(resource);
        if (!folder) {
            return "";
        }
        return folder.uri.toString();
    }
}
