import { readFileSync } from "fs";
import { resolve } from "path";
import { window, workspace } from "vscode";

export const output = window.createOutputChannel("docs-preview");

const INCLUDE_RE = /\[!include\s*\[\s*.+?\s*]\(\s*(.+?)\s*\)\s*]/i;
const FRONTMATTER_RE = /^---[\s\S]+?---/gmi;
const ROOTPATH_RE = /.*~/gmi;
export function include(md, options) {
  const replaceIncludeWithContents = (src: string, rootdir: string) => {
    let captureGroup;
    while ((captureGroup = INCLUDE_RE.exec(src))) {
      const repoRoot = workspace.workspaceFolders[0].uri.fsPath;
      let filePath = resolve(rootdir, captureGroup[1].trim());
      if (filePath.includes("~")) {
        filePath = filePath.replace(ROOTPATH_RE, repoRoot);
      }
      let mdSrc = readFileSync(filePath, "utf8");
      mdSrc = mdSrc.replace(FRONTMATTER_RE, "");
      src = src.slice(0, captureGroup.index) + mdSrc + src.slice(captureGroup.index + captureGroup[0].length, src.length);
    }
    return src;
  };

  const importInclude = (state) => {
    try {
      state.src = replaceIncludeWithContents(state.src, options.root);
    } catch (error) {
      output.appendLine(error);
    }
  };
  md.core.ruler.before("normalize", "include", importInclude);
}
