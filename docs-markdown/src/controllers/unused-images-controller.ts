import { readFile } from "fs";
import { workspace } from "vscode";
import { output } from "../helper/output";

// tslint:disable-next-line: no-var-requires
const recursive = require("recursive-readdir");

export function removeUnusedImages(uri: string) {
    const root = workspace.workspaceFolders;
    recursive(root,
        [".git", ".github", ".vscode", ".vs", "node_module"],
        (err: any, files: string[]) => {
            if (err) {
                output.appendLine(err);
            }
            files.map((file) => {
                const regex = RegExp(uri);
                readFile(file, "utf8", (error, data) => {
                    regex.exec(data);
                });
            });
        });
}
