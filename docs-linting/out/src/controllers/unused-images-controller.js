"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
const fs_1 = require("fs");
const recursive = require("recursive-readdir");
function removeUnusedImages(uri) {
    const root = vscode_1.workspace.workspaceFolders;
    recursive(root, [".git", ".github", ".vscode", ".vs", "node_module"], (err, files) => {
        if (err) {
            console.log(err);
        }
        files.map(file => {
            const regex = RegExp(uri);
            fs_1.readFile(file, "utf8", (err, data) => {
                regex.exec(data);
            });
        });
    });
}
exports.removeUnusedImages = removeUnusedImages;
//# sourceMappingURL=unused-images-controller.js.map