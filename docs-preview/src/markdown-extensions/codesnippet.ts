import { resolve } from "path";
import { readFileSync, createReadStream } from "fs";
import { output } from "../extension";
import { workspace } from "vscode";
import { createInterface } from "readline"
import * as reader from "readline-sync";

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

export const TRIPLE_COLON_CODE_RE = /:::(\s+)?code\s+(source|range|id|highlight|language|interactive)=".*?"\s+(source|range|id|highlight|language|interactive)=".*?"\s+(source|range|id|highlight|language|interactive)=".*?"\s+((source|range|id|highlight|language|interactive)=".*?"\s+)?((source|range|id|highlight|language|interactive)=".*?")?(\s+)?:::/i;
export function tripleColonCodeSnippets(md, options) {
  const replaceTripleColonCodeSnippetWithContents = (src: string, rootdir: string) => {
    let captureGroup;
    while ((captureGroup = TRIPLE_COLON_CODE_RE.exec(src))) {
      const repoRoot = workspace.workspaceFolders[0].uri.fsPath;
      const SOURCE_RE = /source="(.*?)"/g;
      const source = SOURCE_RE.exec(captureGroup[0]);
      const LANGUAGE_RE = /language="(.*?)"/g;
      const language = LANGUAGE_RE.exec(captureGroup[0]);
      let output = "";
      let filePath = resolve(rootdir, source[1].trim());
      if (filePath.includes("~")) {

        filePath = filePath.replace(ROOTPATH_RE, repoRoot);
      }
      let mdSrc = readFileSync(filePath, "utf8")
        .split('\n')
        .filter(Boolean);
      const RANGE_RE = /range="(.*?)"/g;
      const range = RANGE_RE.exec(captureGroup[0]);
      const ID_RE = /id="(.*?)"/g;
      const id = ID_RE.exec(captureGroup[0]);
      const rangeArr: number[] = [];
      if (range) {
        const rangeList = range[1].split(",");
        rangeList.forEach((element) => {
          if (element.indexOf("-") > 0) {
            const rangeThru = element.split("-");
            const startRange = parseInt(rangeThru[0]);
            const endRange = parseInt(rangeThru.pop());
            for (let index = startRange; index <= endRange; index++) {
              rangeArr.push(index);
            }
          } else {
            rangeArr.push(parseInt(element));
          }
        });
        rangeArr.sort();
        const lineArr: string[] = [];
        mdSrc.map((line, index) => {
          rangeArr.filter(x => {
            var thing = x === index + 1
            if (thing) {
              lineArr.push(line);
            }
          })
        });
        output = lineArr.join("\n");
      } else if (id) {
        // logic for id.
      } else {
        output = readFileSync(filePath, "utf8")
      }
      output = `\`\`\`${language[1].trim()}\r\n${output}\r\n\`\`\``;
      src = src.slice(0, captureGroup.index) + output + src.slice(captureGroup.index + captureGroup[0].length, src.length);
    }
    return src;
  };

  const importTripleColonCodeSnippets = (state) => {
    try {
      state.src = replaceTripleColonCodeSnippetWithContents(state.src, options.root);
    } catch (error) {
      output.appendLine(error);
    }
  };
  md.core.ruler.before("normalize", "codesnippet", importTripleColonCodeSnippets);
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