import { resolve } from "path";
import { readFileSync } from "fs";
import { output } from "../extension";
import { workspace } from "vscode";

export const CODE_RE = /\[!code-(.+?)\s*\[\s*.+?\s*]\(\s*(.+?)\s*\)\s*]/i;
const ROOTPATH_RE = /.*~/gmi;
export function codeSnippets(md, options) {
  const replaceCodeSnippetWithContents = (src: string, rootdir: string) => {
    let captureGroup;
    while ((captureGroup = CODE_RE.exec(src))) {
      const repoRoot = workspace.workspaceFolders[0].uri.fsPath;
      let filePath = resolve(rootdir, captureGroup[2].trim());
      if (filePath.includes("~")) {
        filePath = filePath.replace(ROOTPATH_RE, repoRoot);
      }
      let mdSrc = readFileSync(filePath, "utf8");
      mdSrc = `\`\`\`${captureGroup[1].trim()}\r\n${mdSrc}\r\n\`\`\``;
      src = src.slice(0, captureGroup.index) + mdSrc + src.slice(captureGroup.index + captureGroup[0].length, src.length);
    }
    return src;
  };

  const importCodeSnippet = (state) => {
    try {
      state.src = replaceCodeSnippetWithContents(state.src, options.root);
    } catch (error) {
      output.appendLine(error);
    }
  };
  md.core.ruler.before("normalize", "codesnippet", importCodeSnippet);
}

export function custom_codeblock(md, options) {
  const CODEBLOCK_RE = /([ ]{5})/g;
  const removeCodeblockSpaces = (src: string) => {
    let captureGroup;
    while ((captureGroup = CODEBLOCK_RE.exec(src))) {
      src = src.slice(0, captureGroup.index) + src.slice(captureGroup.index + captureGroup[0].length, src.length);
    }
    return src;
  };

  const customCodeBlock = (state) => {
    try {
      state.src = removeCodeblockSpaces(state.src);
    } catch (error) {
      output.appendLine(error);
    }
  };
  md.core.ruler.before("normalize", "custom_codeblock", customCodeBlock);
}