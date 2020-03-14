import { workspace } from "vscode";
import { readFile } from "fs";
const recursive = require("recursive-readdir");

export function removeUnusedImages(uri: string) {
    const root = workspace.workspaceFolders;
    recursive(root,
        [".git", ".github", ".vscode", ".vs", "node_module"],
        (err: any, files: string[]) => {
            if (err) {
                console.log(err);
            }
            files.map(file => {
                const regex = RegExp(uri)
                readFile(file, "utf8", (err, data) => {
                    regex.exec(data);
                });
            });
        });
}