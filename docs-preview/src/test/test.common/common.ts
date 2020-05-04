import { resolve } from "path";
import { commands, Uri, window, workspace } from "vscode";

export function sleep(ms: number): Promise<void> {
    return new Promise((r) => {
        setTimeout(r, ms);
    });
}

export async function loadDocumentAndGetItReady(filePath: string) {
    const docUri = Uri.file(filePath);
    const document = await workspace.openTextDocument(docUri);
    await window.showTextDocument(document);
}

export async function openTestRepository() {
    const filePath = resolve(__dirname, "../../../../src/test/data/repo");
    const repoUri = Uri.file(filePath);
    await commands.executeCommand("vscode.openFolder", repoUri);
}

export async function createDocumentAndGetItReady() {
    await commands.executeCommand("workbench.action.files.newUntitledFile");
}
