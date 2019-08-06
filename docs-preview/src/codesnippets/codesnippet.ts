import { resolve } from "path";
import { readFileSync } from "fs";
import { window } from "vscode";

export const output = window.createOutputChannel("docs-preview");

export const CODE_RE = /\[!code-(.+?)\s*\[\s*.+?\s*]\(\s*(.+?)\s*\)\s*]/i;
export function codeSnippets(md, options) {
  const replaceCodeSnippetWithContents = (src: string, rootdir: string) => {
    let captureGroup;
    while ((captureGroup = CODE_RE.exec(src))) {
      const filePath = resolve(rootdir, captureGroup[2].trim());
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